import { Landmark, Plus, Sparkles, Users } from "lucide-react";
import Link from "next/link";

import { MetricCard } from "@/components/dashboard/metric-card";
import { EmptyState } from "@/components/empty-state";
import { ProjectForm } from "@/components/forms/project-form";
import { ProjectCardItem } from "@/components/marketplace-cards";
import { RoleSwitcher } from "@/components/shared/role-switcher";
import { VerificationBadge } from "@/components/shared/trust-badges";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { formatINR } from "@/lib/money";
import { listBidsForClient } from "@/server/db/bids";
import { countActiveMilestonesForClient, listEscrowsForClient } from "@/server/db/escrow";
import { listProjectsByClient } from "@/server/db/projects";
import { getClientProfile } from "@/server/db/users";

/** The client workspace: money held, work in flight, and the brief form. */
export async function ClientDashboard({ userId }: { userId: string }) {
  const [projects, escrows, bids, activeMilestones, profile] = await Promise.all([
    listProjectsByClient(userId),
    listEscrowsForClient(userId),
    listBidsForClient(userId),
    countActiveMilestonesForClient(userId),
    getClientProfile(userId),
  ]);

  const escrowBalancePaise = escrows.reduce((total, escrow) => total + escrow.balancePaise, 0);
  const openCount = projects.filter((project) => project.status === "OPEN").length;
  const fundedCount = escrows.filter((escrow) => escrow.balancePaise > 0).length;

  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Your hiring desk</h1>
          <p className="text-sm text-muted-foreground">
            {openCount} open · {projects.length} total · {bids.length} proposals received
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RoleSwitcher />
          <Button render={<a href="#post-project" />}>
            <Plus />
            Post a project
          </Button>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={Landmark}
          label="Escrow balance"
          value={formatINR(escrowBalancePaise)}
          hint={`Across ${fundedCount} funded ${fundedCount === 1 ? "project" : "projects"}`}
        />
        <MetricCard
          icon={Sparkles}
          label="Active milestones"
          value={String(activeMilestones)}
          hint="Funded, in progress or awaiting review"
        />
        <MetricCard
          icon={Users}
          label="Proposals received"
          value={String(bids.length)}
          hint="Across all your projects"
        />
        <MetricCard
          label="Verification status"
          value={
            <VerificationBadge status={profile?.verificationStatus ?? "UNVERIFIED"} />
          }
          hint={
            profile?.isPaymentVerified
              ? "Payment method verified"
              : "Fund escrow once to verify your payment method"
          }
        />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Your projects</h2>
          <Button variant="ghost" size="sm" render={<Link href={ROUTES.projects} />}>
            Browse the board
          </Button>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            title="No projects yet"
            description="Post your first brief and proposals will start arriving."
            action={
              <Button render={<a href="#post-project" />}>
                <Plus />
                Post a project
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCardItem key={project.id} project={project} />
            ))}
          </div>
        )}
      </section>

      <section id="post-project" className="flex flex-col gap-3 scroll-mt-20">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold">Post a new project</h2>
          <p className="text-xs text-muted-foreground">
            Budgets are entered in rupees and stored as whole paise. You can fund the milestone
            into escrow as soon as a proposal is accepted.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Brief the work</CardTitle>
            <CardDescription>
              Choose who should apply, the pricing model, and the skills you need.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectForm />
          </CardContent>
        </Card>
      </section>
    </>
  );
}
