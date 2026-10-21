import { z } from "zod";
import type { FreelancerTier, UserRole } from "@prisma/client";

import { emailSchema, gstinSchema, idSchema, indianPhoneSchema, panSchema, skillSchema, upiIdSchema } from "./common";

/**
 * NOTE: Prisma enums are imported with `import type` only. Validators are shared
 * with client components, and a value import of `@prisma/client` would pull the
 * Prisma runtime into the browser bundle. The `satisfies` assertions below keep
 * these literals in sync with the generated Prisma enums at compile time.
 */

/* --------------------------------- roles --------------------------------- */

export const ROLES = ["CLIENT", "FREELANCER", "ADMIN"] as const satisfies readonly UserRole[];
export const SIGNUP_ROLES = ["CLIENT", "FREELANCER"] as const satisfies readonly UserRole[];
export const FREELANCER_TIERS = ["CAMPUS_TALENT", "WORKING_PROFESSIONAL"] as const satisfies readonly FreelancerTier[];

export const roleSchema = z.enum(ROLES);
export const signupRoleSchema = z.enum(SIGNUP_ROLES);
export const freelancerTierSchema = z.enum(FREELANCER_TIERS);

export type Role = (typeof ROLES)[number];
export type SignupRole = (typeof SIGNUP_ROLES)[number];

/* --------------------------- sign-in  / sign-up -------------------------- */

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(120, "Name is too long"),
  email: emailSchema,
  role: signupRoleSchema,
  /** Accepted terms of service. */
  acceptTerms: z.literal(true, "You must accept the terms to continue"),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const otpRequestSchema = z.object({
  phone: indianPhoneSchema,
});

export const otpVerifySchema = z.object({
  phone: indianPhoneSchema,
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code you received"),
});

export type OtpRequestInput = z.infer<typeof otpRequestSchema>;
export type OtpVerifyInput = z.infer<typeof otpVerifySchema>;

/* ------------------------------- onboarding ------------------------------ */

export const freelancerOnboardingSchema = z
  .object({
    tier: freelancerTierSchema,
    headline: z.string().trim().min(10, "Write at least 10 characters").max(120, "Headline is too long"),
    bio: z.string().trim().max(2000, "Bio is too long").optional(),
    city: z.string().trim().max(80, "City name is too long").optional(),
    skills: z.array(skillSchema).min(1, "Add at least one skill").max(20, "Too many skills"),

    /** Rupee string, converted to paise in the action. */
    hourlyRateRupees: z.string().trim().regex(/^\d+(?:\.\d{1,2})?$/, "Enter a valid hourly rate").optional(),

    // Campus talent
    collegeName: z.string().trim().max(160, "College name is too long").optional(),
    graduationYear: z.string().trim().regex(/^\d{4}$/, "Enter a 4-digit year").optional(),
    campusEmail: z.union([emailSchema, z.literal("")]).optional(),

    // Working professional
    yearsExperience: z.string().trim().regex(/^\d{1,2}$/, "Enter your years of experience").optional(),
    currentEmployer: z.string().trim().max(160, "Employer name is too long").optional(),

    // Payout rail
    upiId: z.union([upiIdSchema, z.literal("")]).optional(),
    panNumber: z.union([panSchema, z.literal("")]).optional(),
  })
  .refine((data) => data.tier !== "CAMPUS_TALENT" || Boolean(data.collegeName || data.campusEmail), {
    message: "Campus talent must provide a college name or college email",
    path: ["collegeName"],
  })
  .refine(
    (data) => data.tier !== "WORKING_PROFESSIONAL" || data.yearsExperience !== undefined,
    { message: "Tell us how many years of experience you have", path: ["yearsExperience"] },
  );

export type FreelancerOnboardingInput = z.infer<typeof freelancerOnboardingSchema>;

export const clientOnboardingSchema = z.object({
  companyName: z.string().trim().max(160, "Company name is too long").optional(),
  companyType: z.enum(["STARTUP", "SMB", "CREATOR", "INDIVIDUAL"], "Select a company type"),
  gstin: z.union([gstinSchema, z.literal("")]).optional(),
  billingName: z.string().trim().max(160, "Billing name is too long").optional(),
  billingAddress: z.string().trim().max(400, "Address is too long").optional(),
  billingCity: z.string().trim().max(80, "City name is too long").optional(),
  billingState: z.string().trim().max(80, "State name is too long").optional(),
  billingPincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode").optional(),
  placeOfSupply: z.string().trim().max(80, "State name is too long").optional(),
});

export type ClientOnboardingInput = z.infer<typeof clientOnboardingSchema>;

/* ------------------------------- kyc review ------------------------------ */

export const kycReviewSchema = z.object({
  documentId: idSchema,
  status: z.enum(["VERIFIED", "REJECTED"], "Choose an outcome"),
  note: z.string().trim().max(500, "Note is too long").optional(),
});

export type KycReviewInput = z.infer<typeof kycReviewSchema>;
