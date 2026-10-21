import type { PaymentMethod } from "@/lib/validators/escrow";

/**
 * Provider-agnostic payment + payout contract.
 *
 * Razorpay Route / Cashfree Split will implement this interface later; today
 * only the mock adapter exists, so the rest of the app never talks to a
 * vendor SDK directly. Every amount crossing this boundary is an integer
 * count of paise.
 */

export type PaymentProviderId = "mock" | "razorpay";

/** Money flowing in: the client funds an escrow account. */
export interface CreatePaymentOrderInput {
  /** Escrow account the collection is attached to. */
  escrowId: string;
  amountPaise: number;
  method?: PaymentMethod;
  /** Merchant-side reference shown on the client's statement. */
  receipt?: string;
  notes?: Record<string, string>;
}

export type PaymentOrderStatus = "CREATED" | "PAID" | "FAILED";

export interface PaymentOrder {
  providerId: PaymentProviderId;
  orderId: string;
  amountPaise: number;
  status: PaymentOrderStatus;
  /** Where to send the client to complete payment. Absent for offline rails. */
  checkoutUrl?: string;
}

/** Money flowing out: the platform pays a freelancer. */
export interface CreatePayoutInput {
  payoutId: string;
  amountPaise: number;
  /** UPI VPA, e.g. `name@okhdfcbank`. */
  upiId?: string;
  /** Short description that appears on the freelancer's statement. */
  purpose: string;
  /** Our own idempotency key so a retry cannot pay twice. */
  idempotencyKey: string;
}

export type PayoutStatus = "PENDING" | "PAID" | "FAILED";

export interface PayoutResult {
  providerId: PaymentProviderId;
  providerPayoutId: string;
  status: PayoutStatus;
  /** Bank UTR, present when the rail settles synchronously. */
  utr?: string;
}

export interface CreateRefundInput {
  escrowId: string;
  amountPaise: number;
  reason?: string;
}

export type RefundStatus = "PENDING" | "PROCESSED" | "FAILED";

export interface RefundResult {
  providerId: PaymentProviderId;
  refundId: string;
  amountPaise: number;
  status: RefundStatus;
}

/** Normalised shape of a provider webhook, after signature verification. */
export interface WebhookEvent {
  /** Provider-specific event name, e.g. `payment.captured`. */
  type: string;
  /** Our id (`escrowId`, `payoutId`, ...) echoed back in the payload. */
  referenceId: string;
  amountPaise?: number;
  raw: unknown;
}

export interface PaymentProvider {
  readonly id: PaymentProviderId;

  /** Creates a collection order the client pays into escrow. */
  createPaymentOrder(input: CreatePaymentOrderInput): Promise<PaymentOrder>;

  /** Sends money to a freelancer's payout rail. */
  createPayout(input: CreatePayoutInput): Promise<PayoutResult>;

  /** Returns money to the client. */
  createRefund(input: CreateRefundInput): Promise<RefundResult>;

  /**
   * Verifies the webhook signature and normalises the payload.
   * Must throw when the signature does not match.
   */
  verifyWebhook(rawBody: string, signature: string | null): Promise<WebhookEvent>;
}
