import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/empty-state";
import { PayoutFailedForm, PayoutPaidForm } from "@/components/forms/escrow-admin-forms";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { requireUser } from "@/lib/dal";
import { formatINR } from "@/lib/money";
import {
  listEscrowsForClient,
  listEscrowsForFreelancer,
  listInvoicesForClient,
  listPayoutsForUser,
  listPendingPayouts,
} from "@/server/db/escrow";

export const metadata: Metadata = { title: "Escrow" };

export default async function EscrowPage() {
  const user = await requireUser();

  if (user.role === "ADMIN") return <AdminEscrow />;
  if (user.role === "FREELANCER") return <FreelancerEscrow userId={user.id} />;
  return <ClientEscrow userId={user.id} />;
}

async function ClientEscrow({ userId }: { userId: string }) {
  const [escrows, invoices] = await Promise.all([
    listEscrowsForClient(userId),
    listInvoicesForClient(userId),
  ]);

  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Escrow</h1>
        <p className="text-sm text-muted-foreground">
          {formatINR(escrows.reduce((total, escrow) => total + escrow.balancePaise, 0))} held across{" "}
          {escrows.length} projects
        </p>
      </header>

      {escrows.length === 0 ? (
        <EmptyState
          title="No escrow accounts yet"
          description="Fund a project's escrow when you hire a freelancer."
          action={<Button render={<Link href={ROUTES.projects} />}>View projects</Button>}
        />
      ) : (
        <section className="grid gap-4 sm:grid-cols-2">
          {escrows.map((escrow) => (
            <Card key={escrow.id} size="sm">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{escrow.status}</Badge>
                  <Badge variant="secondary">{escrow.provider}</Badge>
                </div>
                <CardTitle>
                  <Link
                    href={`${ROUTES.projects}/${escrow.project.id}`}
                    className="hover:underline"
                  >
                    {escrow.project.title}
                  </Link>
                </CardTitle>
                <CardDescription>In escrow {formatINR(escrow.balancePaise)}</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2 text-xs">
                <span className="text-muted-foreground">Funded</span>
                <span>{formatINR(escrow.fundedPaise)}</span>
                <span className="text-muted-foreground">Released</span>
                <span>{formatINR(escrow.releasedPaise)}</span>
                <span className="text-muted-foreground">Refunded</span>
                <span>{formatINR(escrow.refundedPaise)}</span>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">GST invoices</h2>
        {invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Invoices are generated as milestones are released.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {invoices.map((invoice) => (
              <li key={invoice.id}>
                <Card size="sm">
                  <CardContent className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium">{invoice.number}</span>
                    <span className="text-xs text-muted-foreground">
                      {invoice.issuedAt.toLocaleDateString("en-IN")} · {formatINR(invoice.totalPaise)}
                    </span>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

async function FreelancerEscrow({ userId }: { userId: string }) {
  const [escrows, payouts] = await Promise.all([
    listEscrowsForFreelancer(userId),
    listPayoutsForUser(userId),
  ]);

  const settled = payouts
    .filter((payout) => payout.status === "PAID")
    .reduce((total, payout) => total + payout.netPaise, 0);
  const pending = payouts
    .filter((payout) => payout.status === "PENDING" || payout.status === "PROCESSING")
    .reduce((total, payout) => total + payout.netPaise, 0);

  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Payouts</h1>
        <p className="text-sm text-muted-foreground">
          {formatINR(settled)} settled · {formatINR(pending)} in flight
        </p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Payout history</h2>
        {payouts.length === 0 ? (
          <EmptyState
            title="No payouts yet"
            description="Milestone releases show up here once the client approves your work."
            action={<Button render={<Link href={ROUTES.projects} />}>Find work</Button>}
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {payouts.map((payout) => (
              <li key={payout.id}>
                <Card size="sm">
                  <CardContent className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-medium">{formatINR(payout.netPaise)}</span>
                      <Badge variant="outline">{payout.status}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground sm:grid-cols-4">
                      <span>Gross {formatINR(payout.grossPaise)}</span>
                      <span>Commission {formatINR(payout.commissionPaise)}</span>
                      <span>
                        TDS {payout.tdsSection ? `${payout.tdsSection} ` : ""}
                        {formatINR(payout.tdsPaise)}
                      </span>
                      <span>{payout.utr ? `UTR ${payout.utr}` : "Awaiting settlement"}</span>
                    </div>
                    {payout.failureReason ? (
                      <p className="text-xs text-destructive">{payout.failureReason}</p>
                    ) : null}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">Engagements</h2>
        {escrows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No escrow-backed engagements yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {escrows.map((escrow) => (
              <li key={escrow.id}>
                <Card size="sm">
                  <CardContent className="flex flex-wrap items-center justify-between gap-2">
                    <Link
                      href={`${ROUTES.projects}/${escrow.project.id}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {escrow.project.title}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {formatINR(escrow.releasedPaise)} released
                    </span>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

async function AdminEscrow() {
  const payouts = await listPendingPayouts();

  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Settlement queue</h1>
        <p className="text-sm text-muted-foreground">
          {payouts.length} payouts awaiting a bank reference
        </p>
      </header>

      {payouts.length === 0 ? (
        <EmptyState
          title="Nothing to settle"
          description="Every payout has a bank reference or a failure reason."
          action={<Button render={<Link href="/admin/kyc" />}>Open KYC queue</Button>}
        />
      ) : (
        <section className="flex flex-col gap-3">
          {payouts.map((payout) => (
            <Card key={payout.id} size="sm">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{payout.status}</Badge>
                  <Badge variant="secondary">{payout.provider}</Badge>
                </div>
                <CardTitle>{formatINR(payout.netPaise)}</CardTitle>
                <CardDescription>
                  {payout.user.name ?? payout.user.email ?? "Freelancer"} ·{" "}
                  {payout.upiId ?? "no UPI handle on file"}
                  {payout.escrow ? ` · ${payout.escrow.project.title}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <span>Gross {formatINR(payout.grossPaise)}</span>
                  <span>Commission {formatINR(payout.commissionPaise)}</span>
                  <span>TDS {formatINR(payout.tdsPaise)}</span>
                </div>
                <PayoutPaidForm payoutId={payout.id} />
                <PayoutFailedForm payoutId={payout.id} />
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </>
  );
}
