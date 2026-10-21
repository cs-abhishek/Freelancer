import type { Metadata } from "next";
import Link from "next/link";

import { ClientOnboardingForm } from "@/components/forms/client-onboarding-form";
import { FreelancerOnboardingForm } from "@/components/forms/freelancer-onboarding-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { requireUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Onboarding" };

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  await requireUser();
  const raw = await searchParams;
  const side = firstParam(raw.as);

  if (side === "freelancer" || side === "client") {
    const isFreelancer = side === "freelancer";

    return (
      <>
        <header className="flex flex-col gap-1">
          <Button
            variant="link"
            size="sm"
            className="self-start px-0"
            render={<Link href={ROUTES.onboarding} />}
          >
            Change side
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">
            {isFreelancer ? "Freelancer profile" : "Client billing details"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isFreelancer
              ? "Pick your tier and submit proof. Verification unlocks the badge clients filter by."
              : "These details drive the GST invoice you receive on every release."}
          </p>
        </header>

        {isFreelancer ? <FreelancerOnboardingForm /> : <ClientOnboardingForm />}
      </>
    );
  }

  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">How will you use the marketplace?</h1>
        <p className="text-sm text-muted-foreground">
          You can switch sides later, but your profile, verification and invoices follow the choice.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>I want to earn</CardTitle>
            <CardDescription>
              Freelancer: bid on projects, publish packaged gigs and get paid over UPI.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button render={<Link href={`${ROUTES.onboarding}?as=freelancer`} />}>
              Set up a freelancer profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>I want to hire</CardTitle>
            <CardDescription>
              Client: post briefs, compare proposals and hold funds safely in INR escrow.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              render={<Link href={`${ROUTES.onboarding}?as=client`} />}
            >
              Set up a client profile
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
