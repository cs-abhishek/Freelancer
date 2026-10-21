import { GraduationCap, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";

/** Operations landing for ADMIN accounts. Redirected to from `/dashboard`. */
export function AdminDashboard() {
  return (
    <>
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Operations</h1>
        <p className="text-sm text-muted-foreground">Verify freelancers and settle payouts.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <ShieldCheck className="size-4 text-muted-foreground" />
            <CardTitle>KYC review queue</CardTitle>
            <CardDescription>
              Approve or reject submitted student emails, college IDs and PAN records.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" render={<Link href="/admin/kyc" />}>
              Open queue
            </Button>
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <GraduationCap className="size-4 text-muted-foreground" />
            <CardTitle>Escrow settlements</CardTitle>
            <CardDescription>
              Mark pending payouts as settled once the bank reference comes back.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" render={<Link href={ROUTES.escrow} />}>
              Open escrow
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
