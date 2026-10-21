import "server-only";

import type { MilestoneStatus, Prisma } from "@prisma/client";

import { prisma } from "@/server/db/client";

/**
 * Read queries for the money side of the marketplace: escrow accounts, the
 * append-only ledger, payouts and invoices. Every amount here is paise.
 */

const escrowDetailInclude = {
  project: { select: { id: true, title: true, clientId: true, status: true } },
  ledgerEntries: { orderBy: { createdAt: "desc" } },
  milestones: { orderBy: { position: "asc" } },
  payouts: { orderBy: { createdAt: "desc" } },
  invoices: { orderBy: { issuedAt: "desc" } },
} satisfies Prisma.EscrowAccountInclude;

export type EscrowDetail = Prisma.EscrowAccountGetPayload<{
  include: typeof escrowDetailInclude;
}>;

export function getEscrowByProjectId(projectId: string) {
  return prisma.escrowAccount.findUnique({ where: { projectId } });
}

export function getEscrowDetailByProjectId(projectId: string): Promise<EscrowDetail | null> {
  return prisma.escrowAccount.findUnique({
    where: { projectId },
    include: escrowDetailInclude,
  });
}

export function getMilestoneById(id: string) {
  return prisma.milestone.findUnique({
    where: { id },
    include: { project: { select: { id: true, title: true, clientId: true, assignedFreelancerId: true } } },
  });
}

export function listMilestonesForProject(projectId: string) {
  return prisma.milestone.findMany({
    where: { projectId },
    orderBy: { position: "asc" },
  });
}

/** Escrow movements, oldest first — the order a passbook would print them in. */
export function listLedgerEntries(escrowId: string) {
  return prisma.ledgerEntry.findMany({
    where: { escrowId },
    orderBy: { createdAt: "asc" },
  });
}

export function listPayoutsForUser(userId: string) {
  return prisma.payout.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export function listInvoicesForClient(clientId: string) {
  return prisma.invoice.findMany({
    where: { clientId },
    orderBy: { issuedAt: "desc" },
  });
}

const escrowSummaryInclude = {
  project: { select: { id: true, title: true, status: true } },
} satisfies Prisma.EscrowAccountInclude;

export type EscrowSummary = Prisma.EscrowAccountGetPayload<{
  include: typeof escrowSummaryInclude;
}>;

/** Escrow accounts held against the client's own projects. */
export function listEscrowsForClient(clientId: string): Promise<EscrowSummary[]> {
  return prisma.escrowAccount.findMany({
    where: { project: { clientId } },
    include: escrowSummaryInclude,
    orderBy: { createdAt: "desc" },
  });
}

/** Escrow accounts the freelancer has been hired against. */
export function listEscrowsForFreelancer(freelancerId: string): Promise<EscrowSummary[]> {
  return prisma.escrowAccount.findMany({
    where: { project: { assignedFreelancerId: freelancerId } },
    include: escrowSummaryInclude,
    orderBy: { createdAt: "desc" },
  });
}

const pendingPayoutInclude = {
  user: { select: { id: true, name: true, email: true } },
  escrow: { select: { id: true, project: { select: { id: true, title: true } } } },
} satisfies Prisma.PayoutInclude;

export type PendingPayout = Prisma.PayoutGetPayload<{ include: typeof pendingPayoutInclude }>;

/** Payouts awaiting a bank reference — the admin settlement queue. */
export function listPendingPayouts(): Promise<PendingPayout[]> {
  return prisma.payout.findMany({
    where: { status: { in: ["PENDING", "PROCESSING"] } },
    include: pendingPayoutInclude,
    orderBy: { createdAt: "asc" },
  });
}

/* ------------------------------ metrics ------------------------------ */

/** Milestones that are funded or waiting on a client decision. */
const ACTIVE_MILESTONE_STATUSES: MilestoneStatus[] = ["FUNDED", "IN_PROGRESS", "SUBMITTED"];

/** Deliverables in flight across the client's own projects. */
export function countActiveMilestonesForClient(clientId: string): Promise<number> {
  return prisma.milestone.count({
    where: { project: { clientId }, status: { in: ACTIVE_MILESTONE_STATUSES } },
  });
}

/** Deliverables in flight on engagements the freelancer has been hired for. */
export function countActiveMilestonesForFreelancer(freelancerId: string): Promise<number> {
  return prisma.milestone.count({
    where: {
      project: { assignedFreelancerId: freelancerId },
      status: { in: ACTIVE_MILESTONE_STATUSES },
    },
  });
}
