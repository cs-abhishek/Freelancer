import { startOfMonth } from "date-fns";
import { Banknote, Landmark, Sparkles, Ticket } from "lucide-react";
import Link from "next/link";

import { MetricCard } from "@/components/dashboard/metric-card";
import { EmptyState } from "@/components/empty-state";
import { RoleSwitcher } from "@/components/shared/role-switcher";
import { VerificationBadge } from "@/components/shared/trust-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MONTHLY_FREE_PROPOSALS, ROUTES } from "@/lib/constants";
import { formatINR } from "@/lib/money";
import { listBidsByFreelancer } from "@/server/db/bids";
import {
  countActiveMilestonesForFreelancer,
  listEscrowsForFreelancer,
  listPayoutsForUser,
} from "@/server/db/escrow";
import { listProjectsForFreelancer } from "@/server/db/projects";
import { getFreelancerProfile } from "@/server/db/users";

/** The freelancer workspace: secured earnings, work in flight, payout readiness. */
export async function FreelancerDashboard({ userId }: { userId: string }) {
  const [bids, assigned, payouts, escrows, activeMilestones, profile] = await Promise.all([
    listBidsByFreelancer(userId),
    listProjectsForFreelancer(userId),
    listPayoutsForUser(userId),
    listEscrowsForFreelancer(userId),
    countActiveMilestonesForFreelancer(userId),
    getFreelancerProfile(userId),
  ]);

  const securedPaise = escrows.reduce((total, escrow) => total + escrow.balancePaise, 0);
  const paidOutPaise = payouts
    .filter((payout) => payout.status === "PAID")
    .reduce((total, payout) => total + payout.netPaise, 0);

  const monthStart = startOfMonth(new Date());
  const bidsThisMonth = bids.filter((bid) => bid.createdAt >= monthStart).length;
  const proposalsLeft = Math.max(0, MONTHLY_FREE_PROPOSALS - bidsThisMonth);

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Your work desk</h1>
          <p className="text-sm text-muted-foreground">
            {bids.length} proposals sent · {assigned.length} active engagements ·{" "}
            {formatINR(paidOutPaise)} paid out
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RoleSwitcher />
          <Button render={<Link href={ROUTES.projects} />}>Find work</Button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Landmark}
          label="Held in escrow"
          value={formatINR(securedPaise)}
          hint="Funded by clients, awaiting milestone release"
        />
        <MetricCard
          icon={Sparkles}
          label="Active milestones"
          value={String(activeMilestones)}
          hint="Funded, in progress or submitted"
        />
        <MetricCard
          icon={Ticket}
          label="Proposals left"
          value={`${proposalsLeft} / ${MONTHLY_FREE_PROPOSALS}`}
          hint={`${bidsThisMonth} sent this month`}
        />
        <MetricCard
          label="Verification status"
          value={
            <VerificationBadge
              status={profile?.verificationStatus ?? "UNVERIFIED"}
              tier={profile?.tier}
            />
          }
          hint={
            profile?.upiId
              ? `Payouts to ${profile.upiId}`
              : "Add a UPI ID to receive payouts"
          }
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Recent proposals</h2>
              <Button variant="ghost" size="sm" render={<Link href={ROUTES.bids} />}>
                All proposals
              </Button>
            </div>

            {bids.length === 0 ? (
              <EmptyState
                title="No proposals yet"
                description="Bid on an open project to get started."
                action={<Button render={<Link href={ROUTES.projects} />}>Browse projects</Button>}
              />
            ) : (
              <ul className="flex flex-col gap-2">
                {bids.slice(0, 6).map((bid) => (
                  <li
                    key={bid.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3"
                  >
                    <Link
                      href={`${ROUTES.projects}/${bid.projectId}`}
                      className="text-sm font-medium hover:underline"
                    >
                      {bid.project.title}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatINR(bid.amountPaise)}</span>
                      <Badge variant="outline">{bid.status}</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col gap-3 text-xs text-muted-foreground">
            <h2 className="text-sm font-semibold text-foreground">UPI wallet &amp; payouts</h2>
            <p className="inline-flex items-center gap-1.5">
              <Banknote className="size-3.5" />
              {profile?.upiId ? profile.upiId : "No UPI ID on file yet"}
            </p>
            <p>
              Released milestones settle to your UPI ID the same day. TDS is withheld under
              section 194J or 194C and reported against your PAN.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" render={<Link href={ROUTES.escrow} />}>
                Payout history
              </Button>
              <Button variant="ghost" size="sm" render={<Link href={ROUTES.settings} />}>
                Payout settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
