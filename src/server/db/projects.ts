import "server-only";

import type { EngagementModel, Prisma } from "@prisma/client";

import { prisma } from "@/server/db/client";

/**
 * Read queries for the project board (bidding model) and the gig catalogue
 * (instant-book model). Mutations live in `src/actions/projects.ts`.
 */

/** Author card shown on list views — never expose the full user record. */
const authorSelect = { id: true, name: true, image: true } satisfies Prisma.UserSelect;

export const projectCardInclude = {
  client: { select: authorSelect },
  _count: { select: { bids: true } },
} satisfies Prisma.ProjectInclude;

export type ProjectCard = Prisma.ProjectGetPayload<{ include: typeof projectCardInclude }>;

export const projectDetailInclude = {
  client: { select: authorSelect },
  assignedFreelancer: { select: authorSelect },
  escrow: true,
  milestones: { orderBy: { position: "asc" } },
  _count: { select: { bids: true } },
} satisfies Prisma.ProjectInclude;

export type ProjectDetail = Prisma.ProjectGetPayload<{ include: typeof projectDetailInclude }>;

export interface ProjectListFilters {
  page: number;
  pageSize: number;
  category?: string;
  search?: string;
  engagementModel?: EngagementModel;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

function buildProjectWhere(filters: ProjectListFilters): Prisma.ProjectWhereInput {
  const search = filters.search?.trim();

  return {
    status: "OPEN",
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.engagementModel ? { engagementModel: filters.engagementModel } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { skills: { has: search } },
          ],
        }
      : {}),
  };
}

export async function listOpenProjects(
  filters: ProjectListFilters,
): Promise<Paginated<ProjectCard>> {
  const where = buildProjectWhere(filters);

  const [items, total] = await prisma.$transaction([
    prisma.project.findMany({
      where,
      include: projectCardInclude,
      orderBy: { publishedAt: "desc" },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    prisma.project.count({ where }),
  ]);

  return { items, total, page: filters.page, pageSize: filters.pageSize };
}

export function getProjectById(id: string): Promise<ProjectDetail | null> {
  return prisma.project.findUnique({ where: { id }, include: projectDetailInclude });
}

export function listProjectsByClient(clientId: string): Promise<ProjectCard[]> {
  return prisma.project.findMany({
    where: { clientId },
    include: projectCardInclude,
    orderBy: { createdAt: "desc" },
  });
}

export function listProjectsForFreelancer(freelancerId: string): Promise<ProjectCard[]> {
  return prisma.project.findMany({
    where: { assignedFreelancerId: freelancerId },
    include: projectCardInclude,
    orderBy: { createdAt: "desc" },
  });
}

/* ---------------------------------- gigs ---------------------------------- */

export const gigCardInclude = {
  freelancer: { select: authorSelect },
} satisfies Prisma.GigInclude;

export type GigCard = Prisma.GigGetPayload<{ include: typeof gigCardInclude }>;

export interface GigListFilters {
  page: number;
  pageSize: number;
  category?: string;
  search?: string;
}

export async function listActiveGigs(filters: GigListFilters): Promise<Paginated<GigCard>> {
  const search = filters.search?.trim();

  const where: Prisma.GigWhereInput = {
    isActive: true,
    ...(filters.category ? { category: filters.category } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [items, total] = await prisma.$transaction([
    prisma.gig.findMany({
      where,
      include: gigCardInclude,
      orderBy: { createdAt: "desc" },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
    prisma.gig.count({ where }),
  ]);

  return { items, total, page: filters.page, pageSize: filters.pageSize };
}

export function getGigById(id: string) {
  return prisma.gig.findUnique({
    where: { id },
    include: { freelancer: { select: authorSelect } },
  });
}
