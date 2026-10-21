import "server-only";

import { env } from "@/lib/env";

import { MockPaymentProvider } from "./mock";
import type { PaymentProvider } from "./types";

let instance: PaymentProvider | null = null;

/**
 * Resolves the configured payment provider once per process.
 *
 * Switching to Razorpay is a matter of setting `PAYMENT_PROVIDER=razorpay` and
 * adding the adapter here — callers only ever see the `PaymentProvider`
 * interface.
 */
export function getPaymentProvider(): PaymentProvider {
  if (instance) return instance;

  switch (env.PAYMENT_PROVIDER) {
    case "mock":
      instance = new MockPaymentProvider();
      return instance;

    case "razorpay":
      throw new Error(
        "PAYMENT_PROVIDER=razorpay is not wired up yet. Implement the Razorpay adapter, or set PAYMENT_PROVIDER=mock for local development.",
      );

    default: {
      const unsupported: never = env.PAYMENT_PROVIDER;
      throw new Error(`Unsupported payment provider: ${String(unsupported)}`);
    }
  }
}

export { MockPaymentProvider, signMockWebhook } from "./mock";
export type {
  CreatePaymentOrderInput,
  CreatePayoutInput,
  CreateRefundInput,
  PaymentOrder,
  PaymentOrderStatus,
  PaymentProvider,
  PaymentProviderId,
  PayoutResult,
  PayoutStatus,
  RefundResult,
  RefundStatus,
  WebhookEvent,
} from "./types";
