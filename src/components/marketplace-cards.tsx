import { Clock, RefreshCw, Users } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { formatINR } from "@/lib/money";
import type { GigCard, ProjectCard } from "@/server/db/projects";

/** Budgets are optional, so the label has to handle either end being absent. */
export function budgetLabel(min: number | null, max: number | null): string {
  if (min !== null && max !== null) return `${formatINR(min)} – ${formatINR(max)}`;
  if (min !== null) return `From ${formatINR(min)}`;
  if (max !== null) return `Up to ${formatINR(max)}`;
  return "Budget not set";
}

function postedOn(date: Date): string {
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function ProjectCardItem({ project }: { project: ProjectCard }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{project.category}</Badge>
          <Badge variant="outline">
            {project.engagementModel === "BIDDING" ? "Bidding" : "Instant book"}
          </Badge>
        </div>
        <CardTitle>
          <Link href={`${ROUTES.projects}/${project.id}`} className="hover:underline">
            {project.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-3">{project.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-xs text-muted-foreground">
        <p className="text-sm font-medium text-foreground">
          {budgetLabel(project.budgetMinPaise, project.budgetMaxPaise)}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" />
            {project._count.bids} proposals
          </span>
          {project.deadline ? (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              Due {postedOn(project.deadline)}
            </span>
          ) : null}
        </div>
        <p>Posted by {project.client.name ?? "a client"}</p>
      </CardContent>
    </Card>
  );
}

export function GigCardItem({ gig }: { gig: GigCard }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{gig.category}</Badge>
          {gig.skills.slice(0, 2).map((skill) => (
            <Badge key={skill} variant="ghost">
              {skill}
            </Badge>
          ))}
        </div>
        <CardTitle>
          <Link href={`${ROUTES.gigs}/${gig.id}`} className="hover:underline">
            {gig.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-3">{gig.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-xs text-muted-foreground">
        <p className="text-sm font-medium text-foreground">{formatINR(gig.pricePaise)}</p>
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {gig.deliveryDays} day delivery
          </span>
          <span className="inline-flex items-center gap-1">
            <RefreshCw className="size-3.5" />
            {gig.revisionsIncluded} revisions
          </span>
        </div>
        <p>By {gig.freelancer.name ?? "a freelancer"}</p>
      </CardContent>
    </Card>
  );
}
