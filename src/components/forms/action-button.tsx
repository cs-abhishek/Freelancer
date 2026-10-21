"use client";

import { type ComponentProps, useActionState } from "react";

import { Button } from "@/components/ui/button";
import { IDLE_ACTION_STATE, type ActionState } from "@/lib/action-state";

type ButtonProps = ComponentProps<typeof Button>;

/**
 * A one-button form around a Server Action. Used for the small, single-field
 * mutations (withdraw a proposal, release a milestone, review a KYC document)
 * where a full form component would be noise.
 *
 * The hidden `fields` are static values, so the action can re-check ownership
 * against the record id without the caller wiring up a whole form.
 */
export function ActionButton({
  action,
  fields,
  label,
  pendingLabel,
  variant,
  size,
  className,
}: {
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  fields: Record<string, string>;
  label: string;
  pendingLabel?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
}) {
  const [state, formAction, isPending] = useActionState(action, IDLE_ACTION_STATE);

  return (
    <form action={formAction} className="flex flex-col items-start gap-1">
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}

      <Button
        type="submit"
        variant={variant}
        size={size}
        className={className}
        disabled={isPending}
      >
        {isPending ? (pendingLabel ?? label) : label}
      </Button>

      {state.status === "error" && state.message ? (
        <p className="text-xs text-destructive">{state.message}</p>
      ) : null}
      {state.status === "success" && state.message ? (
        <p className="text-xs text-muted-foreground">{state.message}</p>
      ) : null}
    </form>
  );
}
