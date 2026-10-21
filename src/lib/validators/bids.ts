import { z } from "zod";
import type { BidStatus } from "@prisma/client";

import { idSchema, rupeeAmountSchema } from "./common";

export const BID_DECISIONS = ["SHORTLISTED", "ACCEPTED", "REJECTED"] as const satisfies readonly BidStatus[];

export const submitBidSchema = z.object({
  projectId: idSchema,
  /** Rupee string, converted to paise inside the action. */
  amountRupees: rupeeAmountSchema,
  deliveryDays: z
    .string()
    .trim()
    .regex(/^\d{1,4}$/, "Enter the number of days you need")
    .refine((value) => Number(value) >= 1, "Delivery must take at least one day"),
  coverLetter: z
    .string()
    .trim()
    .min(50, "Write at least 50 characters so the client can assess your fit")
    .max(5_000, "Cover letter is too long"),
});

export type SubmitBidInput = z.infer<typeof submitBidSchema>;

export const bidDecisionSchema = z.object({
  bidId: idSchema,
  decision: z.enum(BID_DECISIONS),
});

export type BidDecisionInput = z.infer<typeof bidDecisionSchema>;

export const bidIdSchema = z.object({ bidId: idSchema });
