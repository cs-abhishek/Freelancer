"use client";

import { useActionState, useState } from "react";
import Link from "next/link";

import { completeFreelancerOnboardingAction } from "@/actions/auth";
import { FieldError, FormStatus } from "@/components/forms/field-error";
import { SkillsInput } from "@/components/forms/skills-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { IDLE_ACTION_STATE } from "@/lib/action-state";
import { ROUTES } from "@/lib/constants";
import { FREELANCER_TIERS } from "@/lib/validators/auth";

const TIER_LABELS: Record<string, string> = {
  CAMPUS_TALENT: "Verified Campus Talent (student)",
  WORKING_PROFESSIONAL: "Verified Working Professional",
};

/** Picks a freelancer's side of the marketplace and submits their proof. */
export function FreelancerOnboardingForm() {
  const [tier, setTier] = useState<string>(FREELANCER_TIERS[0]);
  const [state, formAction, isPending] = useActionState(
    completeFreelancerOnboardingAction,
    IDLE_ACTION_STATE,
  );

  const isCampus = tier === "CAMPUS_TALENT";

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="tier">Which tier are you?</Label>
        <select
          id="tier"
          name="tier"
          value={tier}
          onChange={(event) => setTier(event.target.value)}
          className="border-input bg-background h-8 rounded-lg border px-2 text-sm"
        >
          {FREELANCER_TIERS.map((value) => (
            <option key={value} value={value}>
              {TIER_LABELS[value] ?? value}
            </option>
          ))}
        </select>
        <FieldError messages={state.fieldErrors?.tier} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="headline">Headline</Label>
        <Input
          id="headline"
          name="headline"
          required
          placeholder="Full-stack developer building payments for Indian D2C brands"
          aria-invalid={state.fieldErrors?.headline ? true : undefined}
        />
        <FieldError messages={state.fieldErrors?.headline} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="bio">About you</Label>
        <Textarea id="bio" name="bio" rows={4} placeholder="What you build and the work you enjoy." />
        <FieldError messages={state.fieldErrors?.bio} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SkillsInput placeholder="React, TypeScript, Postgres" errors={state.fieldErrors?.skills} />

        <div className="flex flex-col gap-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" placeholder="Bengaluru" />
          <FieldError messages={state.fieldErrors?.city} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="hourlyRateRupees">Hourly rate (₹)</Label>
          <Input
            id="hourlyRateRupees"
            name="hourlyRateRupees"
            inputMode="decimal"
            placeholder="1200"
            aria-invalid={state.fieldErrors?.hourlyRateRupees ? true : undefined}
          />
          <FieldError messages={state.fieldErrors?.hourlyRateRupees} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="upiId">UPI ID for payouts</Label>
          <Input id="upiId" name="upiId" placeholder="name@okhdfcbank" autoComplete="off" />
          <FieldError messages={state.fieldErrors?.upiId} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="panNumber">PAN</Label>
          <Input id="panNumber" name="panNumber" placeholder="ABCDE1234F" autoComplete="off" />
          <FieldError messages={state.fieldErrors?.panNumber} />
        </div>

        {isCampus ? (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="collegeName">College</Label>
              <Input id="collegeName" name="collegeName" placeholder="IIT Bombay" />
              <FieldError messages={state.fieldErrors?.collegeName} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="campusEmail">College email</Label>
              <Input
                id="campusEmail"
                name="campusEmail"
                type="email"
                placeholder="you@iitb.ac.in"
                autoComplete="off"
              />
              <FieldError messages={state.fieldErrors?.campusEmail} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="graduationYear">Graduation year</Label>
              <Input
                id="graduationYear"
                name="graduationYear"
                inputMode="numeric"
                placeholder="2027"
                aria-invalid={state.fieldErrors?.graduationYear ? true : undefined}
              />
              <FieldError messages={state.fieldErrors?.graduationYear} />
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              <Label htmlFor="yearsExperience">Years of experience</Label>
              <Input
                id="yearsExperience"
                name="yearsExperience"
                inputMode="numeric"
                placeholder="5"
                aria-invalid={state.fieldErrors?.yearsExperience ? true : undefined}
              />
              <FieldError messages={state.fieldErrors?.yearsExperience} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="currentEmployer">Current employer</Label>
              <Input id="currentEmployer" name="currentEmployer" placeholder="Zoho" />
              <FieldError messages={state.fieldErrors?.currentEmployer} />
            </div>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Submitting..." : "Submit for verification"}
        </Button>
        <FormStatus status={state.status} message={state.message} />
        {state.status === "success" ? (
          <Button variant="link" render={<Link href={ROUTES.dashboard} />}>
            Go to dashboard
          </Button>
        ) : null}
      </div>
    </form>
  );
}
