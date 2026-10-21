import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/server/db/client";

/**
 * Read queries for proposals (bids). Writing a bid, withdrawing it and
 * deciding on it are mutations and live in `src/actions/bids.ts`.
 */

/**
 * The freelancer's public card. Trust signals (tier, verification, rating) come
 * from `FreelancerProfile`; nothing sensitive is selected here.
 */
const bidderSelect = {
  id: true,
  name: true,
  image: true,
  freelancerProfile: {
    select: {
      tier: true,
      verificationStatus: true,
      headline: true,
      skills: true,
      hourlyRatePaise: true,
      ratingSum: true,
      ratingCount: true,
      completedProjects: true,
    },
  },
} satisfies Prisma.UserSelect;

export const bidInclude = {
  freelancer: { select: bidderSelect },
} satisfies Prisma.BidInclude;

export type BidWithFreelancer = Prisma.BidGetPayload<{ include: typeof bidInclude }>;

const bidWithProjectInclude = {
  project: {
    select: {
      id: true,
      title: true,
      status: true,
      budgetMinPaise: true,
      budgetMaxPaise: true,
      clientId: true,
    },
  },
} satisfies Prisma.BidInclude;

export type BidWithProject = Prisma.BidGetPayload<{ include: typeof bidWithProjectInclude }>;

/** Bids received on a project, newest first. */
export function listBidsForProject(projectId: string): Promise<BidWithFreelancer[]> {
  return prisma.bid.findMany({
    where: { projectId, status: { not: "WITHDRAWN" } },
    include: bidInclude,
    orderBy: { createdAt: "desc" },
  });
}

/** Bids the freelancer has submitted. */
export function listBidsByFreelancer(freelancerId: string): Promise<BidWithProject[]> {
  return prisma.bid.findMany({
    where: { freelancerId },
    include: bidWithProjectInclude,
    orderBy: { createdAt: "desc" },
  });
}

export function getBidById(id: string): Promise<BidWithFreelancer | null> {
  return prisma.bid.findUnique({ where: { id }, include: bidInclude });
}

/** True when the freelancer already has a live or decided bid on the project. */
export async function hasBidOnProject(projectId: string, freelancerId: string): Promise<boolean> {
  const existing = await prisma.bid.findUnique({
    where: { projectId_freelancerId: { projectId, freelancerId } },
    select: { id: true },
  });

  return existing !== null;
}

/**
 * The viewer's own proposal. Freelancers must never see the competing bids on a
 * project, so this is the only bid lookup they are allowed to make.
 */
export function getBidOnProject(
  projectId: string,
  freelancerId: string,
): Promise<BidWithFreelancer | null> {
  return prisma.bid.findUnique({
    where: { projectId_freelancerId: { projectId, freelancerId } },
    include: bidInclude,
  });
}

const clientBidInclude = {
  freelancer: { select: bidderSelect },
  project: { select: { id: true, title: true, status: true } },
} satisfies Prisma.BidInclude;

export type ClientBid = Prisma.BidGetPayload<{ include: typeof clientBidInclude }>;

/** Proposals received across every project the client owns. */
export function listBidsForClient(clientId: string): Promise<ClientBid[]> {
  return prisma.bid.findMany({
    where: { project: { clientId }, status: { not: "WITHDRAWN" } },
    include: clientBidInclude,
    orderBy: { createdAt: "desc" },
  });
}
