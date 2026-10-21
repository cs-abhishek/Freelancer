import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { decideBidAction, withdrawBidAction } from "@/actions/bids";
import { releaseMilestoneAction, submitMilestoneAction } from "@/actions/escrow";
import { ActionButton } from "@/components/forms/action-button";
import { BidForm } from "@/components/forms/bid-form";
import { AdminRefundForm } from "@/components/forms/escrow-admin-forms";
import { FundEscrowForm } from "@/components/forms/fund-escrow-form";
import { MilestonePlanForm } from "@/components/forms/milestone-plan-form";
import { budgetLabel } from "@/components/marketplace-cards";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/lib/constants";
import { requireUser } from "@/lib/dal";
import { formatINR } from "@/lib/money";
import { getBidOnProject, listBidsForProject } from "@/server/db/bids";
import { getEscrowByProjectId } from "@/server/db/escrow";
import { getProjectById } from "@/server/db/projects";

export const metadata: Metadata = { title: "Project" };

function formatDay(date: Date): string {
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default async function ProjectDetailPage({ params }: PageProps<"/projects/[id]">) {
  const { id } = await params;
  const user = await requireUser();

  const project = await getProjectById(id);
  if (!project) notFound();

  const isOwner = project.clientId === user.id;
  const isAssigned = project.assignedFreelancerId === user.id;
  const isAdmin = user.role === "ADMIN";
  const canSeeMoney = isOwner || isAssigned || isAdmin;

  const [escrow, bids, myBid] = await Promise.all([
    canSeeMoney ? getEscrowByProjectId(project.id) : Promise.resolve(null),
    isOwner || isAdmin ? listBidsForProject(project.id) : Promise.resolve([]),
    user.role === "FREELANCER" ? getBidOnProject(project.id, user.id) : Promise.resolve(null),
  ]);

  const canBid =
    user.role === "FREELANCER" &&
    !isOwner &&
    !isAssigned &&
    myBid === null &&
    project.status === "OPEN" &&
    project.engagementModel === "BIDDING";

  const milestoneTotal = project.milestones.reduce(
    (total, milestone) => total + milestone.amountPaise,
    0,
  );

  return (
    <>
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{project.category}</Badge>
          <Badge variant="outline">
            {project.engagementModel === "BIDDING" ? "Bidding" : "Instant book"}
          </Badge>
          <Badge variant="outline">{project.status.replace(/_/g, " ")}</Badge>
        </div>
        <h1 className="text-xl font-semibold tracking-tight">{project.title}</h1>
        <p className="text-sm text-muted-foreground">
          {budgetLabel(project.budgetMinPaise, project.budgetMaxPaise)} ·{" "}
          {project._count.bids} proposals
          {project.deadline ? ` · due ${formatDay(project.deadline)}` : ""}
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Brief</CardTitle>
          <CardDescription>Posted by {project.client.name ?? "a client"}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm whitespace-pre-wrap">{project.description}</p>
          {project.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {project.skills.map((skill) => (
                <Badge key={skill} variant="ghost">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {canBid ? (
        <Card>
          <CardHeader>
            <CardTitle>Send a proposal</CardTitle>
            <CardDescription>Quote your price, timeline and approach.</CardDescription>
          </CardHeader>
          <CardContent>
            <BidForm projectId={project.id} suggestedAmountPaise={project.budgetMaxPaise ?? undefined} />
          </CardContent>
        </Card>
      ) : null}

      {myBid ? (
        <Card>
          <CardHeader>
            <CardTitle>Your proposal</CardTitle>
            <CardDescription>
              {formatINR(myBid.amountPaise)} · {myBid.deliveryDays} days
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm whitespace-pre-wrap">{myBid.coverLetter}</p>
            <div className="flex items-center gap-3">
              <Badge variant="outline">{myBid.status}</Badge>
              {myBid.status === "PENDING" || myBid.status === "SHORTLISTED" ? (
                <ActionButton
                  action={withdrawBidAction}
                  fields={{ bidId: myBid.id }}
                  label="Withdraw"
                  pendingLabel="Withdrawing..."
                  variant="outline"
                  size="sm"
                />
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {isOwner || isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Proposals ({bids.length})</CardTitle>
            <CardDescription>Shortlist, hire or decline the freelancers who applied.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {bids.length === 0 ? (
              <p className="text-sm text-muted-foreground">No proposals yet.</p>
            ) : (
              bids.map((bid) => (
                <div key={bid.id} className="flex flex-col gap-3 rounded-lg border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">
                        {bid.freelancer.name ?? "Freelancer"}
                      </span>
                      {bid.freelancer.freelancerProfile ? (
                        <>
                          <Badge variant="outline">
                            {bid.freelancer.freelancerProfile.tier === "CAMPUS_TALENT"
                              ? "Campus"
                              : "Professional"}
                          </Badge>
                          <Badge variant="secondary">
                            {bid.freelancer.freelancerProfile.verificationStatus}
                          </Badge>
                        </>
                      ) : null}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatINR(bid.amountPaise)} · {bid.deliveryDays} days ·{" "}
                      <Badge variant="outline">{bid.status}</Badge>
                    </div>
                  </div>

                  <p className="text-sm whitespace-pre-wrap text-muted-foreground">
                    {bid.coverLetter}
                  </p>

                  {isOwner && (bid.status === "PENDING" || bid.status === "SHORTLISTED") ? (
                    <div className="flex flex-wrap gap-2">
                      {bid.status === "PENDING" ? (
                        <ActionButton
                          action={decideBidAction}
                          fields={{ bidId: bid.id, decision: "SHORTLISTED" }}
                          label="Shortlist"
                          variant="outline"
                          size="sm"
                        />
                      ) : null}
                      {project.status === "OPEN" ? (
                        <ActionButton
                          action={decideBidAction}
                          fields={{ bidId: bid.id, decision: "ACCEPTED" }}
                          label="Hire"
                          size="sm"
                        />
                      ) : null}
                      <ActionButton
                        action={decideBidAction}
                        fields={{ bidId: bid.id, decision: "REJECTED" }}
                        label="Decline"
                        variant="destructive"
                        size="sm"
                      />
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      ) : null}

      {canSeeMoney ? (
        <Card>
          <CardHeader>
            <CardTitle>Escrow and milestones</CardTitle>
            <CardDescription>
              Funds are held against milestones and released one at a time.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {escrow ? (
              <div className="grid gap-3 sm:grid-cols-3">
                <Stat label="Funded" value={formatINR(escrow.fundedPaise)} />
                <Stat label="Balance in escrow" value={formatINR(escrow.balancePaise)} />
                <Stat label="Released" value={formatINR(escrow.releasedPaise)} />
                <Stat label="Platform commission" value={formatINR(escrow.commissionPaise)} />
                <Stat label="TDS withheld" value={formatINR(escrow.tdsWithheldPaise)} />
                <Stat label="GST on commission" value={formatINR(escrow.gstCollectedPaise)} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No escrow account has been opened for this project yet.
              </p>
            )}

            {isOwner ? (
              <>
                <Separator />
                <FundEscrowForm
                  projectId={project.id}
                  outstandingRupees={
                    milestoneTotal > (escrow?.fundedPaise ?? 0)
                      ? String((milestoneTotal - (escrow?.fundedPaise ?? 0)) / 100)
                      : undefined
                  }
                />
              </>
            ) : null}

            <Separator />

            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold">Milestone plan</h3>

              {project.milestones.length === 0 ? (
                isOwner ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Fund the escrow account, then split the work into milestones.
                    </p>
                    <MilestonePlanForm projectId={project.id} />
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    The client has not published a milestone plan yet.
                  </p>
                )
              ) : (
                <ol className="flex flex-col gap-2">
                  {project.milestones.map((milestone) => (
                    <li
                      key={milestone.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">
                          {milestone.position}. {milestone.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatINR(milestone.amountPaise)}
                          {milestone.dueAt ? ` · due ${formatDay(milestone.dueAt)}` : ""}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{milestone.status}</Badge>

                        {isAssigned &&
                        (milestone.status === "PENDING" ||
                          milestone.status === "FUNDED" ||
                          milestone.status === "IN_PROGRESS") ? (
                          <ActionButton
                            action={submitMilestoneAction}
                            fields={{ milestoneId: milestone.id }}
                            label="Mark delivered"
                            pendingLabel="Submitting..."
                            size="sm"
                          />
                        ) : null}

                        {isOwner &&
                        (milestone.status === "SUBMITTED" || milestone.status === "APPROVED") ? (
                          <ActionButton
                            action={releaseMilestoneAction}
                            fields={{ milestoneId: milestone.id }}
                            label={`Release ${formatINR(milestone.amountPaise)}`}
                            pendingLabel="Releasing..."
                            size="sm"
                          />
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>

            {isAdmin && escrow ? (
              <>
                <Separator />
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold">Ops: refund to the client</h3>
                  <AdminRefundForm projectId={project.id} />
                </div>
              </>
            ) : null}

            <p className="text-xs text-muted-foreground">
              Full ledger and payout history live on the{" "}
              <Link href={ROUTES.escrow} className="underline">
                escrow page
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      ) : null}

      {isAssigned ? (
        <p className="text-sm text-muted-foreground">
          You are the freelancer on this project.{" "}
          <Button variant="link" render={<Link href={ROUTES.bids} />}>
            See all your proposals
          </Button>
        </p>
      ) : null}
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
