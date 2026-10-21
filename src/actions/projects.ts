"use server";

import { revalidatePath } from "next/cache";

import { type ActionState, actionError, actionSuccess, toFieldErrors } from "@/lib/action-state";
import { ROUTES } from "@/lib/constants";
import { requireRole } from "@/lib/dal";
import { rupeesToPaise } from "@/lib/money";
import { slugify } from "@/lib/utils";
import {
  createGigOrderSchema,
  createProjectSchema,
  projectIdSchema,
  updateProjectSchema,
  upsertGigSchema,
} from "@/lib/validators/projects";
import { prisma } from "@/server/db/client";

/* -------------------------------- helpers --------------------------------- */

/** Blank optional inputs arrive as `""`; Prisma wants `undefined` to skip them. */
function text(formData: FormData, key: string): string | undefined {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

/** Multi-selects (skills) repeat the same field name. */
function skills(formData: FormData, key = "skills"): string[] {
  return formData.getAll(key).map((value) => String(value));
}

/** Checkboxes are only present in `FormData` when ticked. */
function checked(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1";
}

/** Rupee string -> integer paise. `null` clears the column. */
function paiseOrNull(rupees: string | undefined): number | null {
  return rupees ? rupeesToPaise(Number(rupees)) : null;
}

/** `""` means "no deadline", so it must not reach `new Date("")`. */
function dateOrNull(value: string | undefined): Date | null {
  return value ? new Date(value) : null;
}

/**
 * Slug is `@unique`, so two clients posting "Build a landing page" must not
 * collide. The title is slugified and, on the rare clash, suffixed with a
 * short random token until a free one is found.
 */
async function uniqueProjectSlug(title: string): Promise<string> {
  const base = slugify(title) || "project";

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate =
      attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 8)}`;

    const clash = await prisma.project.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!clash) return candidate;
  }

  return `${base}-${Date.now().toString(36)}`;
}

/* -------------------------------- projects -------------------------------- */

export async function createProjectAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const client = await requireRole("CLIENT");

  const parsed = createProjectSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    skills: skills(formData),
    engagementModel: formData.get("engagementModel"),
    budgetType: formData.get("budgetType"),
    preferredTier: formData.get("preferredTier"),
    budgetMinRupees: text(formData, "budgetMinRupees"),
    budgetMaxRupees: text(formData, "budgetMaxRupees"),
    deadline: text(formData, "deadline") ?? "",
  });

  if (!parsed.success) {
    return actionError("Please fix the highlighted fields.", toFieldErrors(parsed.error));
  }

  const data = parsed.data;

  await prisma.project.create({
    data: {
      clientId: client.id,
      title: data.title,
      slug: await uniqueProjectSlug(data.title),
      description: data.description,
      category: data.category,
      skills: data.skills,
      engagementModel: data.engagementModel,
      budgetType: data.budgetType,
      preferredTier: data.preferredTier,
      budgetMinPaise: paiseOrNull(data.budgetMinRupees),
      budgetMaxPaise: paiseOrNull(data.budgetMaxRupees),
      deadline: dateOrNull(data.deadline),
      // Posting goes straight to the board; DRAFT is reserved for saved drafts.
      status: "OPEN",
      publishedAt: new Date(),
    },
    select: { id: true },
  });

  revalidatePath(ROUTES.projects);
  revalidatePath(ROUTES.dashboard);

  return actionSuccess("Project published to the board.");
}

export async function updateProjectAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const client = await requireRole("CLIENT");

  const parsed = updateProjectSchema.safeParse({
    projectId: formData.get("projectId"),
    title: text(formData, "title"),
    description: text(formData, "description"),
    category: text(formData, "category"),
    skills: skills(formData),
    engagementModel: text(formData, "engagementModel"),
    budgetType: text(formData, "budgetType"),
    preferredTier: text(formData, "preferredTier"),
    budgetMinRupees: text(formData, "budgetMinRupees"),
    budgetMaxRupees: text(formData, "budgetMaxRupees"),
    deadline: formData.get("deadline") ?? undefined,
  });

  if (!parsed.success) {
    return actionError("Please fix the highlighted fields.", toFieldErrors(parsed.error));
  }

  const { projectId, ...changes } = parsed.data;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { clientId: true, status: true },
  });

  if (!project) return actionError("That project no longer exists.");
  if (project.clientId !== client.id) {
    return actionError("Only the client who posted this project can edit it.");
  }
  if (project.status !== "DRAFT" && project.status !== "OPEN") {
    return actionError("A project can only be edited before work starts.");
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      ...(changes.title !== undefined ? { title: changes.title } : {}),
      ...(changes.description !== undefined ? { description: changes.description } : {}),
      ...(changes.category !== undefined ? { category: changes.category } : {}),
      ...(changes.skills !== undefined ? { skills: changes.skills } : {}),
      ...(changes.engagementModel !== undefined
        ? { engagementModel: changes.engagementModel }
        : {}),
      ...(changes.budgetType !== undefined ? { budgetType: changes.budgetType } : {}),
      ...(changes.preferredTier !== undefined
        ? { preferredTier: changes.preferredTier }
        : {}),
      ...(changes.budgetMinRupees !== undefined
        ? { budgetMinPaise: paiseOrNull(changes.budgetMinRupees) }
        : {}),
      ...(changes.budgetMaxRupees !== undefined
        ? { budgetMaxPaise: paiseOrNull(changes.budgetMaxRupees) }
        : {}),
      ...(changes.deadline !== undefined ? { deadline: dateOrNull(changes.deadline) } : {}),
    },
  });

  revalidatePath(ROUTES.projects);
  revalidatePath(`${ROUTES.projects}/${projectId}`);

  return actionSuccess("Project updated.");
}

export async function deleteProjectAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const client = await requireRole("CLIENT");

  const parsed = projectIdSchema.safeParse({ projectId: formData.get("projectId") });
  if (!parsed.success) return actionError("Missing project.", toFieldErrors(parsed.error));

  const project = await prisma.project.findUnique({
    where: { id: parsed.data.projectId },
    select: { id: true, clientId: true, status: true, _count: { select: { bids: true } } },
  });

  if (!project) return actionError("That project no longer exists.");
  if (project.clientId !== client.id) {
    return actionError("Only the client who posted this project can delete it.");
  }
  if (project._count.bids > 0) {
    return actionError("This project has proposals. Close it instead of deleting it.");
  }
  if (project.status !== "DRAFT" && project.status !== "OPEN") {
    return actionError("Only draft or open projects can be deleted.");
  }

  // Bids, milestones and the escrow account cascade from the project.
  await prisma.project.delete({ where: { id: project.id } });

  revalidatePath(ROUTES.projects);
  revalidatePath(ROUTES.dashboard);

  return actionSuccess("Project deleted.");
}

/* ---------------------------------- gigs ---------------------------------- */

export async function upsertGigAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const freelancer = await requireRole("FREELANCER");

  const parsed = upsertGigSchema.safeParse({
    gigId: text(formData, "gigId"),
    title: formData.get("title"),
    description: formData.get("description"),
    category: formData.get("category"),
    skills: skills(formData),
    priceRupees: formData.get("priceRupees"),
    deliveryDays: formData.get("deliveryDays"),
    revisionsIncluded: formData.get("revisionsIncluded"),
    isActive: checked(formData, "isActive"),
  });

  if (!parsed.success) {
    return actionError("Please fix the highlighted fields.", toFieldErrors(parsed.error));
  }

  const data = parsed.data;

  const values = {
    title: data.title,
    description: data.description,
    category: data.category,
    skills: data.skills,
    pricePaise: rupeesToPaise(Number(data.priceRupees)),
    deliveryDays: Number.parseInt(data.deliveryDays, 10),
    revisionsIncluded: Number.parseInt(data.revisionsIncluded, 10),
    isActive: data.isActive,
  };

  if (data.gigId) {
    const existing = await prisma.gig.findUnique({
      where: { id: data.gigId },
      select: { freelancerId: true },
    });

    if (!existing) return actionError("That gig no longer exists.");
    if (existing.freelancerId !== freelancer.id) {
      return actionError("You can only edit your own gigs.");
    }

    await prisma.gig.update({ where: { id: data.gigId }, data: values });
  } else {
    await prisma.gig.create({ data: { ...values, freelancerId: freelancer.id } });
  }

  revalidatePath(ROUTES.gigs);
  revalidatePath(ROUTES.dashboard);

  return actionSuccess(data.gigId ? "Gig updated." : "Gig published.");
}

/**
 * Instant book: the client buys a packaged gig outright.
 *
 * The order is fulfilled as an ordinary `Project` so that it reuses the same
 * escrow + milestone machinery as a bid-driven engagement.
 */
export async function createGigOrderAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const client = await requireRole("CLIENT");

  const parsed = createGigOrderSchema.safeParse({
    gigId: formData.get("gigId"),
    requirements: formData.get("requirements"),
  });

  if (!parsed.success) {
    return actionError("Please fix the highlighted fields.", toFieldErrors(parsed.error));
  }

  const gig = await prisma.gig.findUnique({
    where: { id: parsed.data.gigId },
    select: {
      id: true,
      title: true,
      category: true,
      skills: true,
      pricePaise: true,
      deliveryDays: true,
      isActive: true,
      freelancerId: true,
    },
  });

  if (!gig) return actionError("That gig no longer exists.");
  if (!gig.isActive) return actionError("This gig is no longer available to book.");
  if (gig.freelancerId === client.id) return actionError("You cannot book your own gig.");

  const requirements = parsed.data.requirements;
  const deadline = new Date(Date.now() + gig.deliveryDays * 24 * 60 * 60 * 1_000);

  await prisma.$transaction(async (tx) => {
    const order = await tx.gigOrder.create({
      data: {
        gigId: gig.id,
        clientId: client.id,
        status: "ACTIVE",
        amountPaise: gig.pricePaise,
        requirements,
      },
      select: { id: true },
    });

    const project = await tx.project.create({
      data: {
        clientId: client.id,
        title: gig.title,
        description: requirements,
        category: gig.category,
        skills: gig.skills,
        engagementModel: "INSTANT_BOOK",
        status: "IN_PROGRESS",
        budgetMinPaise: gig.pricePaise,
        budgetMaxPaise: gig.pricePaise,
        deadline,
        publishedAt: new Date(),
        assignedFreelancerId: gig.freelancerId,
        gigOrderId: order.id,
        // One deliverable, so the gig becomes a single milestone.
        milestones: {
          create: {
            title: "Full delivery",
            description: requirements,
            amountPaise: gig.pricePaise,
            position: 1,
          },
        },
      },
      select: { id: true },
    });

    const escrow = await tx.escrowAccount.create({
      data: { projectId: project.id },
      select: { id: true },
    });

    await tx.milestone.updateMany({
      where: { projectId: project.id },
      data: { escrowId: escrow.id },
    });
  });

  revalidatePath(ROUTES.gigs);
  revalidatePath(ROUTES.projects);
  revalidatePath(ROUTES.dashboard);

  return actionSuccess("Gig booked. Fund the escrow account to start the work.");
}
