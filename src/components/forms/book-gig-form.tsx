"use client";

import { useActionState } from "react";

import { createGigOrderAction } from "@/actions/projects";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IDLE_ACTION_STATE } from "@/lib/action-state";
import { formatINR } from "@/lib/money";

/** Instant book: buying a packaged gig creates an escrow-backed project. */
export function BookGigForm({ gigId, pricePaise }: { gigId: string; pricePaise: number }) {
  const [state, formAction, isPending] = useActionState(
    createGigOrderAction,
    IDLE_ACTION_STATE,
  );

  const requirementsError = state.fieldErrors?.requirements?.[0];

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="gigId" value={gigId} />

      <div className="flex flex-col gap-2">
        <Label htmlFor="requirements">What do you need?</Label>
        <Textarea
          id="requirements"
          name="requirements"
          rows={4}
          placeholder="Share the brief, links and any constraints."
          aria-invalid={requirementsError ? true : undefined}
          required
        />
        {requirementsError ? (
          <p className="text-xs text-destructive">{requirementsError}</p>
        ) : null}
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Booking..." : `Book for ${formatINR(pricePaise)}`}
      </Button>

      {state.status === "success" && state.message ? (
        <p className="text-xs text-muted-foreground">{state.message}</p>
      ) : null}
      {state.status === "error" && state.message ? (
        <p className="text-xs text-destructive">{state.message}</p>
      ) : null}
    </form>
  );
}
