"use server";

import { revalidatePath } from "next/cache";

import { type ActionState, actionError, actionSuccess, toFieldErrors } from "@/lib/action-state";
import { resolveCommissionBps } from "@/lib/commission";
import { DEFAULT_TDS_BPS, GST_ON_COMMISSION_BPS, ROUTES, TDS_SECTIONS } from "@/lib/constants";
import { requireRole } from "@/lib/dal";
import { env } from "@/lib/env";
import { formatINR, rupeesToPaise } from "@/lib/money";
import { computeReleaseBreakdown } from "@/lib/tax";
import {
  createMilestonesSchema,
  fundEscrowSchema,
  markPayoutFailedSchema,
  markPayoutPaidSchema,
  milestoneIdSchema,
  refundEscrowSchema,
} from "@/lib/validators/escrow";
import { prisma } from "@/server/db/client";
import { getPaymentProvider, type PayoutResult } from "@/server/payments";

/**
 * The money side of the marketplace.
 *
 * Amounts are integers of paise end to end. Nothing here talks to a payment
 * vendor directly: `getPaymentProvider()` hands back an adapter behind the
 * `PaymentProvider` interface.
 */

/* ------------------------------- funding in ------------------------------- */

export async function fundEscrowAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const client = await requireRole("CLIENT");

  const parsed = fundEscrowSchema.safeParse({
    projectId: formData.get("projectId"),
    amountRupees: formData.get("amountRupees"),
    paymentMethod: formData.get("paymentMethod"),
  });

  if (!parsed.success) {
    return actionError("Please fix the highlighted fields.", toFieldErrors(parsed.error));
  }

  const { paymentMethod } = parsed.data;
  const amountPaise = rupeesToPaise(Number(parsed.data.amountRupees));

  const project = await prisma.project.findUnique({
    where: { id: parsed.data.projectId },
    select: {
      id: true,
      clientId: true,
      status: true,
      escrow: { select: { id: true, status: true, balancePaise: true } },
    },
  });

  if (!project) return actionError("That project no longer exists.");
  if (project.clientId !== client.id) {
    return actionError("Only the client on this project can fund its escrow.");
  }
  if (project.status === "CANCELLED" || project.status === "COMPLETED") {
    return actionError("This project is closed.");
  }

  const escrow =
    project.escrow ??
    (await prisma.escrowAccount.create({
      data: { projectId: project.id },
      select: { id: true, status: true, balancePaise: true },
    }));

  if (escrow.status === "RELEASED" || escrow.status === "REFUNDED") {
    return actionError("This escrow account is already settled.");
  }

  const provider = getPaymentProvider();
  const order = await provider.createPaymentOrder({
    escrowId: escrow.id,
    amountPaise,
    method: paymentMethod,
    receipt: `escrow_${escrow.id}`,
    notes: { projectId: project.id },
  });

  // A live integration credits escrow from the `payment.captured` webhook. The
  // mock rail settles immediately, so the credit is applied here.
  const balanceAfter = escrow.balancePaise + amountPaise;

  await prisma.$transaction([
    prisma.escrowAccount.update({
      where: { id: escrow.id },
      data: {
        status: "FUNDED",
        provider: provider.id,
        providerRef: order.orderId,
        fundedPaise: { increment: amountPaise },
        balancePaise: balanceAfter,
        fundedAt: new Date(),
      },
    }),
    prisma.ledgerEntry.create({
      data: {
        escrowId: escrow.id,
        type: "ESCROW_FUNDING",
        amountPaise,
        balanceAfterPaise: balanceAfter,
        reference: order.orderId,
        note: `Funded via ${paymentMethod}`,
      },
    }),
  ]);

  revalidatePath(ROUTES.escrow);
  revalidatePath(`${ROUTES.projects}/${project.id}`);

  return actionSuccess(`Escrow funded with ${formatINR(amountPaise)}.`);
}

/* -------------------------------- milestones ------------------------------ */

export async function createMilestonesAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const client = await requireRole("CLIENT");

  // The plan is submitted as one JSON field, since it is a variable-length list.
  let plan: unknown;
  try {
    plan = JSON.parse(String(formData.get("milestones") ?? ""));
  } catch {
    return actionError("The milestone plan could not be read. Please try again.");
  }

  const parsed = createMilestonesSchema.safeParse({
    projectId: formData.get("projectId"),
    milestones: plan,
  });

  if (!parsed.success) {
    return actionError("Please fix the milestone plan.", toFieldErrors(parsed.error));
  }

  const data = parsed.data;

  const project = await prisma.project.findUnique({
    where: { id: data.projectId },
    select: {
      id: true,
      clientId: true,
      escrow: { select: { id: true, fundedPaise: true } },
      _count: { select: { milestones: true } },
    },
  });

  if (!project) return actionError("That project no longer exists.");
  if (project.clientId !== client.id) {
    return actionError("Only the client on this project can plan milestones.");
  }
  if (project._count.milestones > 0) {
    return actionError("This project already has a milestone plan.");
  }
  if (!project.escrow) {
    return actionError("Fund the escrow account before planning milestones.");
  }

  const escrowId = project.escrow.id;
  const amounts = data.milestones.map((milestone) => rupeesToPaise(Number(milestone.amountRupees)));
  const totalPaise = amounts.reduce((sum, amount) => sum + amount, 0);

  if (totalPaise > project.escrow.fundedPaise) {
    return actionError(
      `The plan totals ${formatINR(totalPaise)} but only ${formatINR(project.escrow.fundedPaise)} has been funded.`,
    );
  }

  await prisma.milestone.createMany({
    data: data.milestones.map((milestone, index) => ({
      projectId: project.id,
      escrowId,
      title: milestone.title,
      description: milestone.description ? milestone.description : null,
      amountPaise: amounts[index] ?? 0,
      // `@@unique([projectId, position])` — positions are 1-based and ordered.
      position: index + 1,
      dueAt: milestone.dueDate ? new Date(milestone.dueDate) : null,
    })),
  });

  revalidatePath(`${ROUTES.projects}/${project.id}`);
  revalidatePath(ROUTES.escrow);

  return actionSuccess(`${data.milestones.length} milestone(s) saved.`);
}

/* ------------------------------- release out ------------------------------ */

export async function releaseMilestoneAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const client = await requireRole("CLIENT");

  const parsed = milestoneIdSchema.safeParse({ milestoneId: formData.get("milestoneId") });
  if (!parsed.success) return actionError("Missing milestone.", toFieldErrors(parsed.error));

  const milestone = await prisma.milestone.findUnique({
    where: { id: parsed.data.milestoneId },
    select: {
      id: true,
      status: true,
      amountPaise: true,
      projectId: true,
      project: { select: { clientId: true, assignedFreelancerId: true } },
      escrow: { select: { id: true, balancePaise: true } },
    },
  });

  if (!milestone) return actionError("That milestone no longer exists.");
  if (milestone.project.clientId !== client.id) {
    return actionError("Only the client on this project can release funds.");
  }
  if (!milestone.escrow) {
    return actionError("Fund the escrow account before releasing milestones.");
  }
  if (milestone.status === "RELEASED") {
    return actionError("That milestone has already been released.");
  }
  if (milestone.status !== "SUBMITTED" && milestone.status !== "APPROVED") {
    return actionError("The freelancer must submit the milestone before it can be released.");
  }

  const freelancerId = milestone.project.assignedFreelancerId;
  if (!freelancerId) return actionError("Hire a freelancer before releasing funds.");

  const escrow = milestone.escrow;
  if (escrow.balancePaise < milestone.amountPaise) {
    return actionError(
      `The escrow balance is ${formatINR(escrow.balancePaise)}, which does not cover this milestone.`,
    );
  }

  const freelancerProfile = await prisma.freelancerProfile.findUnique({
    where: { userId: freelancerId },
    select: { upiId: true, tier: true, verificationStatus: true },
  });
  const upiId = freelancerProfile?.upiId ?? null;

  // Verified Campus Talent is charged half the standard take rate.
  const breakdown = computeReleaseBreakdown(milestone.amountPaise, {
    commissionBps: resolveCommissionBps({
      tier: freelancerProfile?.tier,
      verificationStatus: freelancerProfile?.verificationStatus,
      standardBps: env.PLATFORM_COMMISSION_BPS,
    }),
    gstBps: GST_ON_COMMISSION_BPS,
    tdsBps: DEFAULT_TDS_BPS,
  });

  const provider = getPaymentProvider();

  // The payout row is created first so the provider call has a stable id to
  // echo back and to use as an idempotency key.
  const payout = await prisma.payout.create({
    data: {
      userId: freelancerId,
      escrowId: escrow.id,
      grossPaise: breakdown.grossPaise,
      commissionPaise: breakdown.commissionPaise,
      tdsPaise: breakdown.tdsPaise,
      netPaise: breakdown.payoutPaise,
      tdsSection: TDS_SECTIONS.SECTION_194J,
      status: "PENDING",
      provider: provider.id,
      upiId,
    },
    select: { id: true },
  });

  let result: PayoutResult;
  try {
    result = await provider.createPayout({
      payoutId: payout.id,
      amountPaise: breakdown.payoutPaise,
      upiId: upiId ?? undefined,
      purpose: `Milestone payout for project ${milestone.projectId}`,
      idempotencyKey: `payout:${payout.id}`,
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "The payment rail rejected the payout.";
    await prisma.payout.update({
      where: { id: payout.id },
      data: { status: "FAILED", failureReason: reason },
    });
    return actionError(`The payout could not be sent: ${reason}`);
  }

  // Client funds leave the escrow in one movement; the split is recorded on the
  // escrow accumulators and the payout row, so the ledger balance stays exact.
  const balanceAfter = escrow.balancePaise - breakdown.grossPaise;

  await prisma.$transaction([
    prisma.payout.update({
      where: { id: payout.id },
      data: {
        status: result.status,
        providerRef: result.providerPayoutId,
        utr: result.utr ?? null,
        paidAt: result.status === "PAID" ? new Date() : null,
      },
    }),
    prisma.milestone.update({
      where: { id: milestone.id },
      data: { status: "RELEASED", releasedAt: new Date() },
    }),
    prisma.escrowAccount.update({
      where: { id: escrow.id },
      data: {
        balancePaise: balanceAfter,
        releasedPaise: { increment: breakdown.grossPaise },
        commissionPaise: { increment: breakdown.commissionPaise },
        gstCollectedPaise: { increment: breakdown.gstOnCommissionPaise },
        tdsWithheldPaise: { increment: breakdown.tdsPaise },
        status: balanceAfter === 0 ? "RELEASED" : "PARTIALLY_RELEASED",
        releasedAt: balanceAfter === 0 ? new Date() : null,
      },
    }),
    prisma.ledgerEntry.create({
      data: {
        escrowId: escrow.id,
        type: "MILESTONE_RELEASE",
        amountPaise: -breakdown.grossPaise,
        balanceAfterPaise: balanceAfter,
        reference: `milestone:${milestone.id}`,
        note: "Milestone released to the freelancer",
      },
    }),
  ]);

  revalidatePath(ROUTES.escrow);
  revalidatePath(`${ROUTES.projects}/${milestone.projectId}`);

  return actionSuccess(
    `${formatINR(breakdown.payoutPaise)} sent to the freelancer (TDS ${formatINR(breakdown.tdsPaise)} withheld).`,
  );
}

/* ------------------------------ proof of work ----------------------------- */

export async function submitMilestoneAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const freelancer = await requireRole("FREELANCER");

  const parsed = milestoneIdSchema.safeParse({ milestoneId: formData.get("milestoneId") });
  if (!parsed.success) return actionError("Missing milestone.", toFieldErrors(parsed.error));

  const milestone = await prisma.milestone.findUnique({
    where: { id: parsed.data.milestoneId },
    select: {
      id: true,
      status: true,
      projectId: true,
      project: { select: { assignedFreelancerId: true } },
    },
  });

  if (!milestone) return actionError("That milestone no longer exists.");
  if (milestone.project.assignedFreelancerId !== freelancer.id) {
    return actionError("Only the hired freelancer can submit this milestone.");
  }
  if (milestone.status === "SUBMITTED" || milestone.status === "APPROVED") {
    return actionError("That milestone is already with the client.");
  }
  if (milestone.status === "RELEASED") {
    return actionError("That milestone has already been paid out.");
  }

  await prisma.milestone.update({
    where: { id: milestone.id },
    data: { status: "SUBMITTED", submittedAt: new Date() },
  });

  revalidatePath(ROUTES.escrow);
  revalidatePath(`${ROUTES.projects}/${milestone.projectId}`);

  return actionSuccess("Delivered. The client can now release the funds.");
}

/* --------------------------------- refunds -------------------------------- */

export async function refundEscrowAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  // Money leaving the platform is admin-gated; the client raises a dispute.
  const admin = await requireRole("ADMIN");

  const parsed = refundEscrowSchema.safeParse({
    projectId: formData.get("projectId"),
    amountRupees: formData.get("amountRupees"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return actionError("Please fix the highlighted fields.", toFieldErrors(parsed.error));
  }

  const data = parsed.data;
  const amountPaise = rupeesToPaise(Number(data.amountRupees));

  const project = await prisma.project.findUnique({
    where: { id: data.projectId },
    select: { id: true, escrow: { select: { id: true, balancePaise: true } } },
  });

  if (!project) return actionError("That project no longer exists.");
  if (!project.escrow) return actionError("This project has no escrow account.");

  const escrow = project.escrow;
  if (amountPaise > escrow.balancePaise) {
    return actionError(`Only ${formatINR(escrow.balancePaise)} is available to refund.`);
  }

  const provider = getPaymentProvider();
  const refund = await provider.createRefund({
    escrowId: escrow.id,
    amountPaise,
    reason: data.reason,
  });

  const balanceAfter = escrow.balancePaise - amountPaise;

  await prisma.$transaction([
    prisma.escrowAccount.update({
      where: { id: escrow.id },
      data: {
        refundedPaise: { increment: amountPaise },
        balancePaise: balanceAfter,
        status: balanceAfter === 0 ? "REFUNDED" : "FUNDED",
      },
    }),
    prisma.ledgerEntry.create({
      data: {
        escrowId: escrow.id,
        type: "REFUND",
        amountPaise: -amountPaise,
        balanceAfterPaise: balanceAfter,
        reference: refund.refundId,
        note: `${data.reason} (initiated by ${admin.id})`,
      },
    }),
  ]);

  revalidatePath(ROUTES.escrow);
  revalidatePath(`${ROUTES.projects}/${project.id}`);

  return actionSuccess(`Refunded ${formatINR(amountPaise)} to the client.`);
}

/* --------------------------------- payouts -------------------------------- */

export async function markPayoutPaidAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("ADMIN");

  const parsed = markPayoutPaidSchema.safeParse({
    payoutId: formData.get("payoutId"),
    utr: formData.get("utr"),
  });

  if (!parsed.success) {
    return actionError("Enter the settlement reference.", toFieldErrors(parsed.error));
  }

  const payout = await prisma.payout.findUnique({
    where: { id: parsed.data.payoutId },
    select: { id: true, status: true },
  });

  if (!payout) return actionError("That payout no longer exists.");
  if (payout.status === "PAID") return actionError("That payout is already marked as paid.");

  await prisma.payout.update({
    where: { id: payout.id },
    data: {
      status: "PAID",
      utr: parsed.data.utr,
      failureReason: null,
      paidAt: new Date(),
    },
  });

  revalidatePath(ROUTES.escrow);

  return actionSuccess("Payout marked as paid.");
}

export async function markPayoutFailedAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireRole("ADMIN");

  const parsed = markPayoutFailedSchema.safeParse({
    payoutId: formData.get("payoutId"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return actionError("Give a reason for the failure.", toFieldErrors(parsed.error));
  }

  const payout = await prisma.payout.findUnique({
    where: { id: parsed.data.payoutId },
    select: { id: true, status: true },
  });

  if (!payout) return actionError("That payout no longer exists.");
  if (payout.status === "PAID") return actionError("A settled payout cannot be marked as failed.");

  await prisma.payout.update({
    where: { id: payout.id },
    data: { status: "FAILED", failureReason: parsed.data.reason },
  });

  revalidatePath(ROUTES.escrow);

  return actionSuccess("Payout marked as failed.");
}
