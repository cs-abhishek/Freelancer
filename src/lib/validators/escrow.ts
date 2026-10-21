import { z } from "zod";

import { DEFAULT_COMMISSION_BPS } from "@/lib/constants";

import { idSchema, rupeeAmountSchema } from "./common";

/** Payment rails the client can use to fund escrow. */
export const PAYMENT_METHODS = ["UPI", "NETBANKING", "CARD"] as const;
export const paymentMethodSchema = z.enum(PAYMENT_METHODS);
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const fundEscrowSchema = z.object({
  projectId: idSchema,
  /** Rupee string, converted to paise inside the action. */
  amountRupees: rupeeAmountSchema,
  paymentMethod: paymentMethodSchema,
});

export type FundEscrowInput = z.infer<typeof fundEscrowSchema>;

export const escrowLookupSchema = z.object({
  projectId: idSchema,
});

export const milestoneIdSchema = z.object({
  milestoneId: idSchema,
});

export const createMilestonesSchema = z
  .object({
    projectId: idSchema,
    milestones: z
      .array(
        z.object({
          title: z.string().trim().min(3, "Milestone title is too short").max(140, "Milestone title is too long"),
          description: z.string().trim().max(1_000, "Description is too long").optional(),
          amountRupees: rupeeAmountSchema,
          dueDate: z.string().trim().optional(),
        }),
      )
      .min(1, "Add at least one milestone")
      .max(20, "A project can have at most 20 milestones"),
  })
  .refine(
    (data) => data.milestones.length === new Set(data.milestones.map((m) => m.title)).size,
    { message: "Milestone titles must be unique", path: ["milestones"] },
  );

export type CreateMilestonesInput = z.infer<typeof createMilestonesSchema>;

export const refundEscrowSchema = z.object({
  projectId: idSchema,
  amountRupees: rupeeAmountSchema,
  reason: z.string().trim().min(10, "Give a reason of at least 10 characters").max(500, "Reason is too long"),
});

export type RefundEscrowInput = z.infer<typeof refundEscrowSchema>;

export const commissionSchema = z.coerce
  .number()
  .int()
  .min(0)
  .max(10_000)
  .default(DEFAULT_COMMISSION_BPS);

/* -------------------------------- invoices -------------------------------- */

export const invoiceQuerySchema = z.object({
  escrowId: idSchema,
  /** GST rate in basis points, e.g. 1800 = 18%. */
  gstRateBps: z.coerce.number().int().min(0).max(2_800).default(1_800),
});

export type InvoiceQueryInput = z.infer<typeof invoiceQuerySchema>;

/* --------------------------------- payouts -------------------------------- */

export const payoutIdSchema = z.object({ payoutId: idSchema });

export const markPayoutPaidSchema = z.object({
  payoutId: idSchema,
  /** Bank UTR or UPI reference returned by the payment rail. */
  utr: z.string().trim().min(6, "UTR must be at least 6 characters").max(64, "UTR is too long"),
});

export type MarkPayoutPaidInput = z.infer<typeof markPayoutPaidSchema>;

export const markPayoutFailedSchema = z.object({
  payoutId: idSchema,
  reason: z.string().trim().min(5, "Give a reason of at least 5 characters").max(300, "Reason is too long"),
});

export type MarkPayoutFailedInput = z.infer<typeof markPayoutFailedSchema>;
