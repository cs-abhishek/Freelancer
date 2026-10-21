import "server-only";

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

import { env } from "@/lib/env";
import { assertPaise } from "@/lib/money";

import type {
  CreatePaymentOrderInput,
  CreatePayoutInput,
  CreateRefundInput,
  PaymentOrder,
  PaymentProvider,
  PayoutResult,
  RefundResult,
  WebhookEvent,
} from "./types";

/**
 * Development adapter.
 *
 * It moves no real money: it validates the paise amounts, mints fake provider
 * ids, and signs/verifies webhooks with `AUTH_SECRET` so the escrow flow can be
 * exercised end to end without a Razorpay account.
 */

function hmacHex(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

/** Produces the signature `verifyWebhook` expects. Useful in dev scripts and tests. */
export function signMockWebhook(payload: string, secret = env.AUTH_SECRET): string {
  return hmacHex(secret, payload);
}

export class MockPaymentProvider implements PaymentProvider {
  readonly id = "mock" as const;

  async createPaymentOrder(input: CreatePaymentOrderInput): Promise<PaymentOrder> {
    const amountPaise = assertPaise(input.amountPaise, "amountPaise");

    return {
      providerId: this.id,
      orderId: `mock_order_${randomUUID()}`,
      amountPaise,
      status: "CREATED",
      // No hosted checkout: in dev the escrow action is confirmed by posting a
      // signed payload to the webhook route (see signMockWebhook).
      checkoutUrl: undefined,
    };
  }

  async createPayout(input: CreatePayoutInput): Promise<PayoutResult> {
    const amountPaise = assertPaise(input.amountPaise, "amountPaise");

    if (amountPaise === 0) {
      throw new RangeError("A payout must be greater than zero paise.");
    }

    return {
      providerId: this.id,
      providerPayoutId: `mock_payout_${randomUUID()}`,
      // The mock settles immediately so released milestones reach a terminal state.
      status: "PAID",
      utr: `MOCK${randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase()}`,
    };
  }

  async createRefund(input: CreateRefundInput): Promise<RefundResult> {
    const amountPaise = assertPaise(input.amountPaise, "amountPaise");

    return {
      providerId: this.id,
      refundId: `mock_refund_${randomUUID()}`,
      amountPaise,
      status: "PROCESSED",
    };
  }

  async verifyWebhook(rawBody: string, signature: string | null): Promise<WebhookEvent> {
    if (!signature) {
      throw new Error("Missing webhook signature.");
    }

    const expected = Buffer.from(hmacHex(env.AUTH_SECRET, rawBody), "hex");
    const received = Buffer.from(signature, "hex");

    if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
      throw new Error("Invalid webhook signature.");
    }

    const parsed: unknown = JSON.parse(rawBody);

    if (typeof parsed !== "object" || parsed === null) {
      throw new Error("Webhook payload must be a JSON object.");
    }

    const { type, referenceId, amountPaise } = parsed as {
      type?: unknown;
      referenceId?: unknown;
      amountPaise?: unknown;
    };

    if (typeof type !== "string" || typeof referenceId !== "string") {
      throw new Error("Webhook payload is missing `type` or `referenceId`.");
    }

    return {
      type,
      referenceId,
      amountPaise: typeof amountPaise === "number" ? assertPaise(amountPaise, "amountPaise") : undefined,
      raw: parsed,
    };
  }
}
