"use client";

import { useActionState } from "react";

import { createProjectAction } from "@/actions/projects";
import { FieldError, FormStatus } from "@/components/forms/field-error";
import { SkillsInput } from "@/components/forms/skills-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IDLE_ACTION_STATE } from "@/lib/action-state";
import { PROJECT_CATEGORIES } from "@/lib/constants";
import { ENGAGEMENT_MODELS, BUDGET_TYPES, BUDGET_TYPE_LABELS, PREFERRED_TIERS, PREFERRED_TIER_LABELS } from "@/lib/validators/projects";

/** Posts a new brief to the board (bidding) or publishes an instant-book brief. */
export function ProjectForm() {
  const [state, formAction, isPending] = useActionState(createProjectAction, IDLE_ACTION_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          placeholder="Build a Razorpay checkout flow for our D2C store"
          aria-invalid={state.fieldErrors?.title ? true : undefined}
        />
        <FieldError messages={state.fieldErrors?.title} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Brief</Label>
        <Textarea
          id="description"
          name="description"
          rows={8}
          required
          placeholder="Scope, deliverables, tech stack and anything that would help a freelancer quote accurately."
          aria-invalid={state.fieldErrors?.description ? true : undefined}
        />
        <FieldError messages={state.fieldErrors?.description} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            name="category"
            defaultValue={PROJECT_CATEGORIES[0]}
            className="border-input bg-background h-8 rounded-lg border px-2 text-sm"
          >
            {PROJECT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <FieldError messages={state.fieldErrors?.category} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="engagementModel">How do you want to hire?</Label>
          <select
            id="engagementModel"
            name="engagementModel"
            defaultValue={ENGAGEMENT_MODELS[0]}
            className="border-input bg-background h-8 rounded-lg border px-2 text-sm"
          >
            <option value="BIDDING">Collect proposals, then pick</option>
            <option value="INSTANT_BOOK">Single quote, hire fast</option>
          </select>
          <FieldError messages={state.fieldErrors?.engagementModel} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="budgetType">Budget type</Label>
          <select
            id="budgetType"
            name="budgetType"
            defaultValue={BUDGET_TYPES[0]}
            className="border-input bg-background h-8 rounded-lg border px-2 text-sm"
          >
            {BUDGET_TYPES.map((budgetType) => (
              <option key={budgetType} value={budgetType}>
                {BUDGET_TYPE_LABELS[budgetType]}
              </option>
            ))}
          </select>
          <FieldError messages={state.fieldErrors?.budgetType} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="preferredTier">Who should apply?</Label>
          <select
            id="preferredTier"
            name="preferredTier"
            defaultValue={PREFERRED_TIERS[0]}
            className="border-input bg-background h-8 rounded-lg border px-2 text-sm"
          >
            {PREFERRED_TIERS.map((tier) => (
              <option key={tier} value={tier}>
                {PREFERRED_TIER_LABELS[tier]}
              </option>
            ))}
          </select>
          <FieldError messages={state.fieldErrors?.preferredTier} />
        </div>

        <SkillsInput errors={state.fieldErrors?.skills} />

        <div className="flex flex-col gap-2">
          <Label htmlFor="deadline">Deadline</Label>
          <Input id="deadline" name="deadline" type="date" />
          <FieldError messages={state.fieldErrors?.deadline} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="budgetMinRupees">Budget from (₹)</Label>
          <Input
            id="budgetMinRupees"
            name="budgetMinRupees"
            inputMode="decimal"
            placeholder="25000"
            aria-invalid={state.fieldErrors?.budgetMinRupees ? true : undefined}
          />
          <FieldError messages={state.fieldErrors?.budgetMinRupees} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="budgetMaxRupees">Budget up to (₹)</Label>
          <Input
            id="budgetMaxRupees"
            name="budgetMaxRupees"
            inputMode="decimal"
            placeholder="60000"
            aria-invalid={state.fieldErrors?.budgetMaxRupees ? true : undefined}
          />
          <FieldError messages={state.fieldErrors?.budgetMaxRupees} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Publishing..." : "Publish project"}
        </Button>
        <FormStatus status={state.status} message={state.message} />
      </div>
    </form>
  );
}
