"use client";

import { useActionState } from "react";

import { fundEscrowAction } from "@/actions/escrow";
import { FieldError, FormStatus } from "@/components/forms/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IDLE_ACTION_STATE } from "@/lib/action-state";
import { PAYMENT_METHODS } from "@/lib/validators/escrow";

const METHOD_LABELS: Record<string, string> = {
  UPI: "UPI",
  NETBANKING: "Net banking",
  CARD: "Card",
};

/** Funds an escrow account. Amounts are entered in rupees, stored in paise. */
export function FundEscrowForm({
  projectId,
  outstandingRupees,
}: {
  projectId: string;
  outstandingRupees?: string;
}) {
  const [state, formAction, isPending] = useActionState(fundEscrowAction, IDLE_ACTION_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="projectId" value={projectId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="amountRupees">Amount (₹)</Label>
          <Input
            id="amountRupees"
            name="amountRupees"
            inputMode="decimal"
            required
            defaultValue={outstandingRupees}
            placeholder="50000"
            aria-invalid={state.fieldErrors?.amountRupees ? true : undefined}
          />
          <FieldError messages={state.fieldErrors?.amountRupees} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="paymentMethod">Pay with</Label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            defaultValue={PAYMENT_METHODS[0]}
            className="border-input bg-background h-8 rounded-lg border px-2 text-sm"
          >
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {METHOD_LABELS[method] ?? method}
              </option>
            ))}
          </select>
          <FieldError messages={state.fieldErrors?.paymentMethod} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Funding..." : "Fund escrow"}
        </Button>
        <FormStatus status={state.status} message={state.message} />
      </div>

      <p className="text-xs text-muted-foreground">
        Funds are held in escrow and only released against milestones you approve.
      </p>
    </form>
  );
}
