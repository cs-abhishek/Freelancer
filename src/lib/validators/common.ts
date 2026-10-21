import { z } from "zod";

import { MAX_PAISE } from "@/lib/money";

/**
 * Shared field schemas.
 *
 * CONVENTIONS
 * - These schemas are used by BOTH react-hook-form and Server Actions, so they
 *   are authored to keep `z.input` and `z.output` identical. Only type-
 *   preserving string transforms (`trim`, `toLowerCase`, `toUpperCase`, `pipe`)
 *   are used, which keeps react-hook-form generics trivial and safe.
 * - Numeric form fields arrive from HTML inputs as STRINGS and are validated as
 *   strings here; conversion to paise / integers happens inside the Server
 *   Action via the helpers in `@/lib/money`.
 */

/* ------------------------------ primitives ------------------------------- */

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Enter a valid email address"));

/** Indian mobile number, optionally prefixed with +91. */
export const indianPhoneSchema = z
  .string()
  .trim()
  .regex(/^(?:\+91)?[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number");

export const gstinSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, "Enter a valid 15-character GSTIN");

export const panSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{5}[0-9]{4}[A-Z]$/, "Enter a valid 10-character PAN");

export const upiIdSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9._-]{2,256}@[a-z]{2,64}$/, "Enter a valid UPI ID, e.g. name@okhdfcbank");

export const skillSchema = z.string().trim().min(1, "Skill cannot be empty").max(40, "Skill is too long");

export const idSchema = z.string().trim().min(1, "Missing identifier").max(64, "Invalid identifier");

/** An ISO-8601 or `<input type="date">` value, validated without a Date parse at schema level. */
export const dateInputSchema = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(Date.parse(value)), "Enter a valid date");

/* -------------------------------- money ---------------------------------- */

/**
 * A rupee amount typed by a user, e.g. "499", "499.5", "499.99".
 * Negative amounts, more than two decimal places and values above the
 * 32-bit paise ceiling are rejected.
 */
export const rupeeAmountSchema = z
  .string()
  .trim()
  .regex(/^\d+(?:\.\d{1,2})?$/, "Enter an amount with up to 2 decimal places")
  .refine((value) => Number(value) > 0, "Amount must be greater than zero")
  .refine(
    (value) => Math.round(Number(value) * 100) <= MAX_PAISE,
    "Amount is larger than the maximum this platform supports",
  );

/** An already-converted integer number of paise. */
export const paiseSchema = z
  .number()
  .int("Amount must be a whole number of paise")
  .min(0, "Amount cannot be negative")
  .max(MAX_PAISE, "Amount exceeds the maximum this platform supports");

/** Star rating, 1-5. */
export const ratingSchema = z.coerce.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5");

/* ------------------------------ pagination ------------------------------- */

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

/* ------------------------------ normalization ---------------------------- */

/**
 * Normalizes an Indian mobile number to E.164 (+91XXXXXXXXXX).
 * Lives next to `indianPhoneSchema` so the two can never drift apart.
 */
export function normalizeIndianPhone(input: string): string {
  const compact = input.trim().replace(/[\s-]/g, "");
  return compact.startsWith("+91") ? compact : `+91${compact}`;
}

/** Normalizes an email address to its trimmed, lowercase form. */
export function normalizeEmail(input: string): string {
  return input.trim().toLowerCase();
}
