"use server";

import { revalidatePath } from "next/cache";

import { type ActionState, actionError, actionSuccess, toFieldErrors } from "@/lib/action-state";
import { ROUTES } from "@/lib/constants";
import { requireRole } from "@/lib/dal";
import { rupeesToPaise } from "@/lib/money";
import { bidDecisionSchema, bidIdSchema, submitBidSchema } from "@/lib/validators/bids";
import { hasBidOnProject } from "@/server/db/bids";
import { prisma } from "@/server/db/client";

/**
 * Proposals: submitting, withdrawing and deciding.
 *
 * Every mutation re-checks ownership here — the `proxy.ts` redirect layer is
 * not an authorization layer.
 */

export async function submitBidAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const freelancer = await requireRole("FREELANCER");

  const parsed = submitBidSchema.safeParse({
    projectId: formData.get("projectId"),
    amountRupees: formData.get("amountRupees"),
    deliveryDays: formData.get("deliveryDays"),
    coverLetter: formData.get("coverLetter"),
  });

  if (!parsed.success) {
    return actionError("Please fix the highlighted fields.", toFieldErrors(parsed.error));
  }

  const data = parsed.data;

  const project = await prisma.project.findUnique({
    where: { id: data.projectId },
    select: { id: true, clientId: true, status: true, engagementModel: true },
  });

  if (!project) return actionError("That project no longer exists.");
  if (project.clientId === freelancer.id) return actionError("You cannot bid on your own project.");
  if (project.status !== "OPEN") return actionError("This project is no longer accepting proposals.");
  if (project.engagementModel !== "BIDDING") {
    return actionError("This project is booked instantly rather than through bidding.");
  }
  // The database enforces `@@unique([projectId, freelancerId])`; this check turns
  // that constraint violation into a readable message.
  if (await hasBidOnProject(project.id, freelancer.id)) {
    return actionError("You have already proposed on this project.");
  }

  await prisma.$transaction([
    prisma.bid.create({
      data: {
        projectId: project.id,
        freelancerId: freelancer.id,
        amountPaise: rupeesToPaise(Number(data.amountRupees)),
        deliveryDays: Number.parseInt(data.deliveryDays, 10),
        coverLetter: data.coverLetter,
      },
    }),
    prisma.project.update({
      where: { id: project.id },
      data: { bidCount: { increment: 1 } },
    }),
  ]);

  revalidatePath(ROUTES.projects);
  revalidatePath(`${ROUTES.projects}/${project.id}`);
  revalidatePath(ROUTES.bids);

  return actionSuccess("Proposal sent.");
}

export async function withdrawBidAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const freelancer = await requireRole("FREELANCER");

  const parsed = bidIdSchema.safeParse({ bidId: formData.get("bidId") });
  if (!parsed.success) return actionError("Missing proposal.", toFieldErrors(parsed.error));

  const bid = await prisma.bid.findUnique({
    where: { id: parsed.data.bidId },
    select: { id: true, projectId: true, freelancerId: true, status: true },
  });

  if (!bid) return actionError("That proposal no longer exists.");
  if (bid.freelancerId !== freelancer.id) {
    return actionError("You can only withdraw your own proposal.");
  }
  if (bid.status === "WITHDRAWN") return actionError("That proposal is already withdrawn.");
  if (bid.status === "ACCEPTED") {
    return actionError("An accepted proposal cannot be withdrawn.");
  }

  await prisma.$transaction([
    prisma.bid.update({
      where: { id: bid.id },
      data: { status: "WITHDRAWN", withdrawnAt: new Date() },
    }),
    prisma.project.update({
      where: { id: bid.projectId },
      data: { bidCount: { decrement: 1 } },
    }),
  ]);

  revalidatePath(ROUTES.bids);
  revalidatePath(`${ROUTES.projects}/${bid.projectId}`);

  return actionSuccess("Proposal withdrawn.");
}

export async function decideBidAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const client = await requireRole("CLIENT");

  const parsed = bidDecisionSchema.safeParse({
    bidId: formData.get("bidId"),
    decision: formData.get("decision"),
  });

  if (!parsed.success) return actionError("Choose an outcome.", toFieldErrors(parsed.error));

  const { bidId, decision } = parsed.data;

  const bid = await prisma.bid.findUnique({
    where: { id: bidId },
    select: {
      id: true,
      projectId: true,
      freelancerId: true,
      status: true,
      project: { select: { clientId: true, status: true } },
    },
  });

  if (!bid) return actionError("That proposal no longer exists.");
  if (bid.project.clientId !== client.id) {
    return actionError("Only the client who posted this project can decide on proposals.");
  }
  if (bid.status === "ACCEPTED" || bid.status === "REJECTED") {
    return actionError("This proposal has already been decided.");
  }
  if (bid.status === "WITHDRAWN") return actionError("This proposal was withdrawn.");

  if (decision !== "ACCEPTED") {
    await prisma.bid.update({ where: { id: bid.id }, data: { status: decision } });

    revalidatePath(`${ROUTES.projects}/${bid.projectId}`);

    return actionSuccess(
      decision === "SHORTLISTED" ? "Proposal shortlisted." : "Proposal declined.",
    );
  }

  if (bid.project.status !== "OPEN") {
    return actionError("This project is no longer open for hiring.");
  }

  await prisma.$transaction([
    prisma.bid.update({ where: { id: bid.id }, data: { status: "ACCEPTED" } }),
    // Losing proposals are closed out so the board stays honest.
    prisma.bid.updateMany({
      where: {
        projectId: bid.projectId,
        id: { not: bid.id },
        status: { in: ["PENDING", "SHORTLISTED"] },
      },
      data: { status: "REJECTED" },
    }),
    prisma.project.update({
      where: { id: bid.projectId },
      data: {
        assignedFreelancerId: bid.freelancerId,
        status: "IN_PROGRESS",
      },
    }),
  ]);

  revalidatePath(`${ROUTES.projects}/${bid.projectId}`);
  revalidatePath(ROUTES.bids);
  revalidatePath(ROUTES.escrow);

  return actionSuccess("Proposal accepted. Fund the escrow account to release the first milestone.");
}
