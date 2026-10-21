import { z } from "zod";
import type { BudgetType, EngagementModel, PreferredTier } from "@prisma/client";

import { PROJECT_CATEGORIES } from "@/lib/constants";

import { dateInputSchema, idSchema, rupeeAmountSchema, skillSchema } from "./common";

/** Kept in sync with the Prisma `EngagementModel` enum via `satisfies`. */
export const ENGAGEMENT_MODELS = ["BIDDING", "INSTANT_BOOK"] as const satisfies readonly EngagementModel[];
export const BUDGET_TYPES = ["FIXED", "HOURLY"] as const satisfies readonly BudgetType[];
export const PREFERRED_TIERS = ["ANY", "STUDENT_ONLY", "PRO_ONLY"] as const satisfies readonly PreferredTier[];

export const engagementModelSchema = z.enum(ENGAGEMENT_MODELS);
export const budgetTypeSchema = z.enum(BUDGET_TYPES);
export const preferredTierSchema = z.enum(PREFERRED_TIERS);
export const projectCategorySchema = z.enum(PROJECT_CATEGORIES);

/** Display copy for the enum values, shown on forms and trust badges. */
export const BUDGET_TYPE_LABELS: Record<BudgetType, string> = {
  FIXED: "Fixed price",
  HOURLY: "Hourly",
};

export const PREFERRED_TIER_LABELS: Record<PreferredTier, string> = {
  ANY: "Open to all",
  STUDENT_ONLY: "Campus star friendly",
  PRO_ONLY: "Senior pro required",
};

/**
 * Shared shape for create/update. Declared separately from `createProjectSchema`
 * so that `.partial()` stays available (it is not offered on refined schemas).
 */
const projectBaseSchema = z.object({
  title: z.string().trim().min(10, "Title must be at least 10 characters").max(140, "Title is too long"),
  description: z
    .string()
    .trim()
    .min(30, "Describe the work in at least 30 characters")
    .max(10_000, "Description is too long"),
  category: projectCategorySchema,
  skills: z.array(skillSchema).max(20, "Too many skills"),
  engagementModel: engagementModelSchema,
  budgetType: budgetTypeSchema,
  preferredTier: preferredTierSchema,
  budgetMinRupees: rupeeAmountSchema.optional(),
  budgetMaxRupees: rupeeAmountSchema.optional(),
  deadline: z.union([dateInputSchema, z.literal("")]).optional(),
});

export const createProjectSchema = projectBaseSchema.refine(
  (data) =>
    !(data.budgetMinRupees && data.budgetMaxRupees) ||
    Number(data.budgetMinRupees) <= Number(data.budgetMaxRupees),
  { message: "Minimum budget cannot exceed the maximum budget", path: ["budgetMaxRupees"] },
);

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = projectBaseSchema
  .partial()
  .extend({ projectId: idSchema })
  .refine(
    (data) =>
      !(data.budgetMinRupees && data.budgetMaxRupees) ||
      Number(data.budgetMinRupees) <= Number(data.budgetMaxRupees),
    { message: "Minimum budget cannot exceed the maximum budget", path: ["budgetMaxRupees"] },
  );

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

export const projectIdSchema = z.object({ projectId: idSchema });

/** Filters read from URL search params, so coercion from strings is expected. */
export const projectFiltersSchema = z.object({
  q: z.string().trim().max(120).optional(),
  category: projectCategorySchema.optional(),
  engagementModel: engagementModelSchema.optional(),
  budgetType: budgetTypeSchema.optional(),
  preferredTier: preferredTierSchema.optional(),
  minBudgetRupees: rupeeAmountSchema.optional(),
  maxBudgetRupees: rupeeAmountSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(12),
});

export type ProjectFilters = z.infer<typeof projectFiltersSchema>;

/* --------------------------------- gigs ---------------------------------- */

export const upsertGigSchema = z.object({
  gigId: idSchema.optional(),
  title: z.string().trim().min(10, "Title must be at least 10 characters").max(140, "Title is too long"),
  description: z.string().trim().min(30, "Describe the gig in at least 30 characters").max(5_000, "Description is too long"),
  category: projectCategorySchema,
  skills: z.array(skillSchema).max(20, "Too many skills"),
  priceRupees: rupeeAmountSchema,
  deliveryDays: z.string().trim().regex(/^\d{1,3}$/, "Enter the delivery time in days"),
  revisionsIncluded: z.string().trim().regex(/^\d{1,2}$/, "Enter the number of revisions"),
  isActive: z.boolean(),
});

export type UpsertGigInput = z.infer<typeof upsertGigSchema>;

export const createGigOrderSchema = z.object({
  gigId: idSchema,
  requirements: z.string().trim().min(20, "Describe what you need in at least 20 characters").max(2_000, "Requirements are too long"),
});

export type CreateGigOrderInput = z.infer<typeof createGigOrderSchema>;
