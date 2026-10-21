import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { requireUser } from "@/lib/dal";
import { formatINR } from "@/lib/money";
import { getClientProfile, getFreelancerProfile, listKycDocumentsForUser } from "@/server/db/users";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();

  const [freelancerProfile, clientProfile, kycDocuments] = await Promise.all([
    user.role === "FREELANCER" ? getFreelancerProfile(user.id) : Promise.resolve(null),
    getClientProfile(user.id),
    listKycDocumentsForUser(user.id),
  ]);

  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Your account, profile and verification.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Signed in as {user.role.toLowerCase()}.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
          <Field label="Name" value={user.name ?? "Not set"} />
          <Field label="Email" value={user.email ?? "Not set"} />
          <Field label="Mobile" value={user.phone ?? "Not set"} />
          <Field label="Joined" value={user.createdAt.toLocaleDateString("en-IN")} />
        </CardContent>
      </Card>

      {freelancerProfile ? (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {freelancerProfile.tier === "CAMPUS_TALENT" ? "Campus talent" : "Professional"}
              </Badge>
              <Badge variant="outline">{freelancerProfile.verificationStatus}</Badge>
            </div>
            <CardTitle>{freelancerProfile.headline ?? "Freelancer profile"}</CardTitle>
            <CardDescription>{freelancerProfile.city ?? "City not set"}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            {freelancerProfile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {freelancerProfile.skills.map((skill) => (
                  <Badge key={skill} variant="ghost">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : null}
            <div className="grid gap-2 sm:grid-cols-2">
              <Field
                label="Hourly rate"
                value={
                  freelancerProfile.hourlyRatePaise
                    ? formatINR(freelancerProfile.hourlyRatePaise)
                    : "Not set"
                }
              />
              <Field label="UPI handle" value={freelancerProfile.upiId ?? "Not set"} />
            </div>
          </CardContent>
        </Card>
      ) : null}

      {clientProfile ? (
        <Card>
          <CardHeader>
            <Badge variant="outline">{clientProfile.companyType}</Badge>
            <CardTitle>{clientProfile.companyName ?? "Billing profile"}</CardTitle>
            <CardDescription>Used on your GST invoices.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm sm:grid-cols-2">
            <Field label="GSTIN" value={clientProfile.gstin ?? "Not set"} />
            <Field label="Place of supply" value={clientProfile.placeOfSupply ?? "Not set"} />
            <Field label="Billing city" value={clientProfile.billingCity ?? "Not set"} />
            <Field label="Pincode" value={clientProfile.billingPincode ?? "Not set"} />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Verification</CardTitle>
          <CardDescription>
            Proofs submitted for review. An admin approves them from the KYC queue.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {kycDocuments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing submitted yet.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {kycDocuments.map((document) => (
                <li
                  key={document.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm"
                >
                  <span>{document.type.replace(/_/g, " ")}</span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {document.reviewNote ? document.reviewNote : null}
                    <Badge variant="outline">{document.status}</Badge>
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div>
            <Button variant="outline" size="sm" render={<Link href={ROUTES.onboarding} />}>
              {freelancerProfile || clientProfile ? "Update profile" : "Complete onboarding"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
