"use client";

import { useActionState } from "react";

import { markPayoutFailedAction, markPayoutPaidAction, refundEscrowAction } from "@/actions/escrow";
import { FieldError, FormStatus } from "@/components/forms/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IDLE_ACTION_STATE } from "@/lib/action-state";

/**
 * Admin-only money controls. These are the only paths that move funds out of a
 * settled escrow, so each one is gated by `requireRole("ADMIN")` in the action
 * and needs an auditable reference (UTR / reason).
 */

export function PayoutPaidForm({ payoutId }: { payoutId: string }) {
  const [state, formAction, isPending] = useActionState(markPayoutPaidAction, IDLE_ACTION_STATE);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="payoutId" value={payoutId} />
      <div className="flex flex-col gap-2">
        <Label htmlFor={`utr-${payoutId}`}>Bank UTR</Label>
        <Input
          id={`utr-${payoutId}`}
          name="utr"
          required
          placeholder="422112345678"
          autoComplete="off"
          aria-invalid={state.fieldErrors?.utr ? true : undefined}
        />
        <FieldError messages={state.fieldErrors?.utr} />
      </div>
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Saving..." : "Mark paid"}
      </Button>
      <FormStatus status={state.status} message={state.message} />
    </form>
  );
}

export function PayoutFailedForm({ payoutId }: { payoutId: string }) {
  const [state, formAction, isPending] = useActionState(markPayoutFailedAction, IDLE_ACTION_STATE);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="payoutId" value={payoutId} />
      <div className="flex flex-col gap-2">
        <Label htmlFor={`reason-${payoutId}`}>Failure reason</Label>
        <Input
          id={`reason-${payoutId}`}
          name="reason"
          required
          placeholder="UPI handle rejected the credit"
          aria-invalid={state.fieldErrors?.reason ? true : undefined}
        />
        <FieldError messages={state.fieldErrors?.reason} />
      </div>
      <Button type="submit" size="sm" variant="destructive" disabled={isPending}>
        {isPending ? "Saving..." : "Mark failed"}
      </Button>
      <FormStatus status={state.status} message={state.message} />
    </form>
  );
}

export function AdminRefundForm({ projectId }: { projectId: string }) {
  const [state, formAction, isPending] = useActionState(refundEscrowAction, IDLE_ACTION_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="projectId" value={projectId} />

      <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
        <div className="flex flex-col gap-2">
          <Label htmlFor={`refund-amount-${projectId}`}>Refund (₹)</Label>
          <Input
            id={`refund-amount-${projectId}`}
            name="amountRupees"
            inputMode="decimal"
            required
            placeholder="10000"
            aria-invalid={state.fieldErrors?.amountRupees ? true : undefined}
          />
          <FieldError messages={state.fieldErrors?.amountRupees} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor={`refund-reason-${projectId}`}>Reason</Label>
          <Input
            id={`refund-reason-${projectId}`}
            name="reason"
            required
            placeholder="Scope cancelled before the first milestone"
            aria-invalid={state.fieldErrors?.reason ? true : undefined}
          />
          <FieldError messages={state.fieldErrors?.reason} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" variant="destructive" size="sm" disabled={isPending}>
          {isPending ? "Refunding..." : "Refund to client"}
        </Button>
        <FormStatus status={state.status} message={state.message} />
      </div>
    </form>
  );
}
