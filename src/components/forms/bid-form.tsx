"use client";

import { useActionState } from "react";

import { submitBidAction } from "@/actions/bids";
import { FieldError, FormStatus } from "@/components/forms/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IDLE_ACTION_STATE } from "@/lib/action-state";
import { formatINR } from "@/lib/money";

/** A freelancer's proposal: price, timeline and the pitch. */
export function BidForm({
  projectId,
  suggestedAmountPaise,
}: {
  projectId: string;
  suggestedAmountPaise?: number;
}) {
  const [state, formAction, isPending] = useActionState(submitBidAction, IDLE_ACTION_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="projectId" value={projectId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="amountRupees">Your quote (₹)</Label>
          <Input
            id="amountRupees"
            name="amountRupees"
            inputMode="decimal"
            required
            placeholder={suggestedAmountPaise ? String(suggestedAmountPaise / 100) : "45000"}
            aria-invalid={state.fieldErrors?.amountRupees ? true : undefined}
          />
          <FieldError messages={state.fieldErrors?.amountRupees} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="deliveryDays">Delivery (days)</Label>
          <Input
            id="deliveryDays"
            name="deliveryDays"
            inputMode="numeric"
            required
            placeholder="14"
            aria-invalid={state.fieldErrors?.deliveryDays ? true : undefined}
          />
          <FieldError messages={state.fieldErrors?.deliveryDays} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="coverLetter">Cover letter</Label>
        <Textarea
          id="coverLetter"
          name="coverLetter"
          rows={6}
          required
          placeholder="Why you are a fit, relevant work, and how you would approach this brief."
          aria-invalid={state.fieldErrors?.coverLetter ? true : undefined}
        />
        <FieldError messages={state.fieldErrors?.coverLetter} />
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Sending..." : "Send proposal"}
        </Button>
        <FormStatus status={state.status} message={state.message} />
      </div>

      {suggestedAmountPaise ? (
        <p className="text-xs text-muted-foreground">
          The client budgeted around {formatINR(suggestedAmountPaise)}.
        </p>
      ) : null}
    </form>
  );
}
