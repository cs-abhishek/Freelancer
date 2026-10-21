"use client";

import { useActionState, useState } from "react";

import { createMilestonesAction } from "@/actions/escrow";
import { FieldError, FormStatus } from "@/components/forms/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IDLE_ACTION_STATE } from "@/lib/action-state";

interface DraftMilestone {
  /** Stable key for React; not part of the submitted payload. */
  key: number;
  title: string;
  amountRupees: string;
  dueDate: string;
}

function emptyRow(key: number): DraftMilestone {
  return { key, title: "", amountRupees: "", dueDate: "" };
}

/**
 * The milestone plan is a variable-length list, so it is serialised into one
 * JSON hidden field that `createMilestonesAction` parses and validates.
 */
export function MilestonePlanForm({ projectId }: { projectId: string }) {
  const [rows, setRows] = useState<DraftMilestone[]>([emptyRow(1)]);
  const [state, formAction, isPending] = useActionState(
    createMilestonesAction,
    IDLE_ACTION_STATE,
  );

  function updateRow(key: number, patch: Partial<DraftMilestone>) {
    setRows((current) =>
      current.map((row) => (row.key === key ? { ...row, ...patch } : row)),
    );
  }

  function addRow() {
    setRows((current) => [...current, emptyRow(current.length + 1)]);
  }

  function removeRow(key: number) {
    setRows((current) => (current.length > 1 ? current.filter((row) => row.key !== key) : current));
  }

  const payload = rows
    .filter((row) => row.title.trim() !== "" && row.amountRupees.trim() !== "")
    .map((row) => ({
      title: row.title.trim(),
      amountRupees: row.amountRupees.trim(),
      dueDate: row.dueDate.trim(),
    }));

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="milestones" value={JSON.stringify(payload)} />

      <div className="flex flex-col gap-3">
        {rows.map((row, index) => (
          <div key={row.key} className="grid gap-3 sm:grid-cols-[1fr_10rem_10rem_auto]">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`milestone-title-${row.key}`}>Milestone {index + 1}</Label>
              <Input
                id={`milestone-title-${row.key}`}
                value={row.title}
                onChange={(event) => updateRow(row.key, { title: event.target.value })}
                placeholder="Wireframes and design system"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`milestone-amount-${row.key}`}>Amount (₹)</Label>
              <Input
                id={`milestone-amount-${row.key}`}
                inputMode="decimal"
                value={row.amountRupees}
                onChange={(event) => updateRow(row.key, { amountRupees: event.target.value })}
                placeholder="15000"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor={`milestone-due-${row.key}`}>Due</Label>
              <Input
                id={`milestone-due-${row.key}`}
                type="date"
                value={row.dueDate}
                onChange={(event) => updateRow(row.key, { dueDate: event.target.value })}
              />
            </div>
            <div className="flex items-end pb-0.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeRow(row.key)}
                disabled={rows.length === 1}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          Add milestone
        </Button>
        <Button type="submit" size="sm" disabled={isPending || payload.length === 0}>
          {isPending ? "Saving..." : "Save plan"}
        </Button>
        <FormStatus status={state.status} message={state.message} />
      </div>

      <FieldError messages={state.fieldErrors?.milestones} />
    </form>
  );
}
