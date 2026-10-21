"use client";

import { useActionState } from "react";
import Link from "next/link";

import { completeClientOnboardingAction } from "@/actions/auth";
import { FieldError, FormStatus } from "@/components/forms/field-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IDLE_ACTION_STATE } from "@/lib/action-state";
import { ROUTES } from "@/lib/constants";

const COMPANY_TYPES = [
  { value: "STARTUP", label: "Startup" },
  { value: "SMB", label: "Small or medium business" },
  { value: "CREATOR", label: "Creator" },
  { value: "INDIVIDUAL", label: "Individual" },
] as const;

/**
 * Billing details drive the GST invoice: `placeOfSupply` decides CGST+SGST
 * versus IGST, so it is collected up front.
 */
export function ClientOnboardingForm() {
  const [state, formAction, isPending] = useActionState(
    completeClientOnboardingAction,
    IDLE_ACTION_STATE,
  );

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="companyName">Company name</Label>
          <Input id="companyName" name="companyName" placeholder="Chai Point Pvt Ltd" />
          <FieldError messages={state.fieldErrors?.companyName} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="companyType">Company type</Label>
          <select
            id="companyType"
            name="companyType"
            defaultValue="STARTUP"
            className="border-input bg-background h-8 rounded-lg border px-2 text-sm"
          >
            {COMPANY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <FieldError messages={state.fieldErrors?.companyType} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="gstin">GSTIN</Label>
          <Input id="gstin" name="gstin" placeholder="29ABCDE1234F1Z5" autoComplete="off" />
          <FieldError messages={state.fieldErrors?.gstin} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="placeOfSupply">Place of supply</Label>
          <Input id="placeOfSupply" name="placeOfSupply" placeholder="Karnataka" />
          <FieldError messages={state.fieldErrors?.placeOfSupply} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="billingName">Billing name</Label>
        <Input id="billingName" name="billingName" placeholder="Accounts payable" />
        <FieldError messages={state.fieldErrors?.billingName} />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="billingAddress">Billing address</Label>
        <Input id="billingAddress" name="billingAddress" placeholder="4th floor, Indiranagar" />
        <FieldError messages={state.fieldErrors?.billingAddress} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-2">
          <Label htmlFor="billingCity">City</Label>
          <Input id="billingCity" name="billingCity" placeholder="Bengaluru" />
          <FieldError messages={state.fieldErrors?.billingCity} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="billingState">State</Label>
          <Input id="billingState" name="billingState" placeholder="Karnataka" />
          <FieldError messages={state.fieldErrors?.billingState} />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="billingPincode">Pincode</Label>
          <Input
            id="billingPincode"
            name="billingPincode"
            inputMode="numeric"
            placeholder="560038"
            aria-invalid={state.fieldErrors?.billingPincode ? true : undefined}
          />
          <FieldError messages={state.fieldErrors?.billingPincode} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save billing details"}
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
