import type { Metadata } from "next";
import { ArrowRight, GraduationCap, MapPin, Star, Users } from "lucide-react";
import Link from "next/link";

import { VerificationBadge } from "@/components/shared/trust-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { MOCK_TALENT, type MockTalent } from "@/lib/mock-data";
import { formatINR } from "@/lib/money";

export const metadata: Metadata = {
  title: "Hire verified Indian talent",
  description:
    "Browse verified campus talent and working professionals with rupee rates, ratings and escrow-backed engagements.",
};

/** Ratings are held in tenths so no float is ever stored; format only for display. */
function ratingLabel(tenths: number): string {
  return (tenths / 10).toFixed(1);
}

export default function TalentPage() {
  return (
    <>
      <section className="flex flex-col items-start gap-4">
        <Badge variant="outline">
          <GraduationCap />
          Verified talent directory
        </Badge>
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Hire verified students and working professionals, at rupee rates
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Every profile is reviewed before it is listed. Campus talent proves itself with a college
          email or ID, working professionals with work history and a PAN for TDS reporting.
        </p>
        <Button render={<Link href={ROUTES.projectNew} />}>
          Post a Project
          <ArrowRight />
        </Button>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_TALENT.map((freelancer) => (
          <TalentCard key={freelancer.id} freelancer={freelancer} />
        ))}
      </section>

      <section className="rounded-xl border p-6">
        <h2 className="font-heading text-base font-medium">How verification works</h2>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Submitting a campus email or ID, a PAN and a portfolio link opens a KYC case. Our team
          reviews it and marks the profile verified, rejected, or pending with a note. Escrow and
          payouts stay available while a case is pending, but only verified profiles carry the
          verification badge.
        </p>
      </section>
    </>
  );
}

function TalentCard({ freelancer }: { freelancer: MockTalent }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <VerificationBadge status={freelancer.verificationStatus} tier={freelancer.tier} />
        <CardTitle>{freelancer.name}</CardTitle>
        <CardDescription className="line-clamp-3">{freelancer.headline}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-2.5 text-xs text-muted-foreground">
        <p className="text-sm font-medium text-foreground">
          {formatINR(freelancer.hourlyRatePaise)} / hour
        </p>

        <div className="flex flex-wrap items-center gap-1.5">
          {freelancer.skills.map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <Star className="size-3.5" />
            {ratingLabel(freelancer.ratingTenths)} ({freelancer.ratingCount})
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" />
            {freelancer.completedProjects} projects
          </span>
        </div>

        <p className="inline-flex items-center gap-1">
          <MapPin className="size-3.5" />
          {freelancer.affiliation} · {freelancer.city}
        </p>
      </CardContent>
    </Card>
  );
}
