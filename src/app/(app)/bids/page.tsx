import type { Metadata } from "next";
import Link from "next/link";

import { withdrawBidAction } from "@/actions/bids";
import { ActionButton } from "@/components/forms/action-button";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { requireUser } from "@/lib/dal";
import { formatINR } from "@/lib/money";
import { listBidsByFreelancer, listBidsForClient } from "@/server/db/bids";

export const metadata: Metadata = { title: "Proposals" };

export default async function BidsPage() {
  const user = await requireUser();

  if (user.role === "FREELANCER") return <FreelancerBids userId={user.id} />;

  return <ClientBids userId={user.id} />;
}

async function FreelancerBids({ userId }: { userId: string }) {
  const bids = await listBidsByFreelancer(userId);

  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Your proposals</h1>
        <p className="text-sm text-muted-foreground">{bids.length} proposals submitted</p>
      </header>

      {bids.length === 0 ? (
        <EmptyState
          title="No proposals yet"
          description="Bid on an open project and it will show up here."
          action={<Button render={<Link href={ROUTES.projects} />}>Browse projects</Button>}
        />
      ) : (
        <section className="flex flex-col gap-3">
          {bids.map((bid) => (
            <Card key={bid.id} size="sm">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{bid.status}</Badge>
                  <Badge variant="secondary">{bid.project.status.replace(/_/g, " ")}</Badge>
                </div>
                <CardTitle>
                  <Link href={`${ROUTES.projects}/${bid.projectId}`} className="hover:underline">
                    {bid.project.title}
                  </Link>
                </CardTitle>
                <CardDescription>
                  {formatINR(bid.amountPaise)} · {bid.deliveryDays} days
                </CardDescription>
              </CardHeader>
              {bid.status === "PENDING" || bid.status === "SHORTLISTED" ? (
                <CardContent>
                  <ActionButton
                    action={withdrawBidAction}
                    fields={{ bidId: bid.id }}
                    label="Withdraw"
                    pendingLabel="Withdrawing..."
                    variant="outline"
                    size="sm"
                  />
                </CardContent>
              ) : null}
            </Card>
          ))}
        </section>
      )}
    </>
  );
}

async function ClientBids({ userId }: { userId: string }) {
  const bids = await listBidsForClient(userId);

  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Proposals received</h1>
        <p className="text-sm text-muted-foreground">
          {bids.length} proposals across your projects
        </p>
      </header>

      {bids.length === 0 ? (
        <EmptyState
          title="No proposals yet"
          description="Post a project and freelancers will start quoting."
          action={<Button render={<Link href={ROUTES.projectNew} />}>Post a project</Button>}
        />
      ) : (
        <section className="flex flex-col gap-3">
          {bids.map((bid) => (
            <Card key={bid.id} size="sm">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{bid.status}</Badge>
                  {bid.freelancer.freelancerProfile ? (
                    <Badge variant="secondary">
                      {bid.freelancer.freelancerProfile.tier === "CAMPUS_TALENT"
                        ? "Campus"
                        : "Professional"}
                    </Badge>
                  ) : null}
                </div>
                <CardTitle>
                  <Link href={`${ROUTES.projects}/${bid.projectId}`} className="hover:underline">
                    {bid.project.title}
                  </Link>
                </CardTitle>
                <CardDescription>
                  {bid.freelancer.name ?? "A freelancer"} quoted {formatINR(bid.amountPaise)} for{" "}
                  {bid.deliveryDays} days
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  size="sm"
                  render={<Link href={`${ROUTES.projects}/${bid.projectId}`} />}
                >
                  Open project
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </>
  );
}
