"use client";

import {
  ArrowRight,
  Atom,
  BadgeCheck,
  BrainCircuit,
  Clapperboard,
  Clock,
  Layers,
  PenTool,
  Search,
  Smartphone,
  Terminal,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { PreferredTierBadge, TrustBadges } from "@/components/shared/trust-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { MOCK_PROJECTS, SKILL_FILTERS, type MockProject, type SkillFilter } from "@/lib/mock-data";
import { formatINR } from "@/lib/money";
import { BUDGET_TYPE_LABELS } from "@/lib/validators/projects";

/** `₹15,000 – ₹30,000`, or the same range quoted per hour. */
function budgetLabel(project: MockProject): string {
  const range = `${formatINR(project.budgetMinPaise)} – ${formatINR(project.budgetMaxPaise)}`;
  return project.budgetType === "HOURLY" ? `${range} / hour` : range;
}

function haystack(project: MockProject): string {
  return [project.title, project.summary, project.category, ...project.skills]
    .join(" ")
    .toLowerCase();
}

/**
 * Each skill pill carries its own colour so the row reads as a legend rather
 * than seven identical buttons.
 */
const SKILL_META: Record<SkillFilter, { icon: LucideIcon; idle: string; active: string }> = {
  React: {
    icon: Atom,
    idle: "border-indigo-500/25 bg-indigo-500/10 text-indigo-700 hover:bg-indigo-500/20 dark:text-indigo-300",
    active: "border-indigo-500/60 bg-indigo-500/25 text-indigo-800 ring-1 ring-indigo-500/40 dark:text-indigo-200",
  },
  Python: {
    icon: Terminal,
    idle: "border-sky-500/25 bg-sky-500/10 text-sky-700 hover:bg-sky-500/20 dark:text-sky-300",
    active: "border-sky-500/60 bg-sky-500/25 text-sky-800 ring-1 ring-sky-500/40 dark:text-sky-200",
  },
  "UI/UX": {
    icon: PenTool,
    idle: "border-violet-500/25 bg-violet-500/10 text-violet-700 hover:bg-violet-500/20 dark:text-violet-300",
    active: "border-violet-500/60 bg-violet-500/25 text-violet-800 ring-1 ring-violet-500/40 dark:text-violet-200",
  },
  "Video Editing": {
    icon: Clapperboard,
    idle: "border-fuchsia-500/25 bg-fuchsia-500/10 text-fuchsia-700 hover:bg-fuchsia-500/20 dark:text-fuchsia-300",
    active: "border-fuchsia-500/60 bg-fuchsia-500/25 text-fuchsia-800 ring-1 ring-fuchsia-500/40 dark:text-fuchsia-200",
  },
  "App Dev": {
    icon: Smartphone,
    idle: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-300",
    active: "border-emerald-500/60 bg-emerald-500/25 text-emerald-800 ring-1 ring-emerald-500/40 dark:text-emerald-200",
  },
  Flutter: {
    icon: Layers,
    idle: "border-cyan-500/25 bg-cyan-500/10 text-cyan-700 hover:bg-cyan-500/20 dark:text-cyan-300",
    active: "border-cyan-500/60 bg-cyan-500/25 text-cyan-800 ring-1 ring-cyan-500/40 dark:text-cyan-200",
  },
  "AI/ML": {
    icon: BrainCircuit,
    idle: "border-amber-500/25 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300",
    active: "border-amber-500/60 bg-amber-500/25 text-amber-800 ring-1 ring-amber-500/40 dark:text-amber-200",
  },
};

/** Deterministic, so the server and client agree on the same avatar colour. */
const CLIENT_GRADIENTS = [
  "from-indigo-500 to-violet-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-600",
  "from-fuchsia-500 to-pink-600",
] as const;

function clientGradient(name: string): string {
  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + char.charCodeAt(0)) % 9973;
  }
  return CLIENT_GRADIENTS[hash % CLIENT_GRADIENTS.length];
}

function clientInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

/**
 * The interactive half of the landing page: a skill search over the public job
 * feed. It is a client component because the filter has to respond as the
 * visitor types, while the hero copy around it stays server-rendered.
 */
export function MarketplaceExplorer({ projects = MOCK_PROJECTS }: { projects?: readonly MockProject[] }) {
  const [query, setQuery] = useState("");

  const indexed = useMemo(
    () => projects.map((project) => ({ project, text: haystack(project) })),
    [projects],
  );

  const needle = query.trim().toLowerCase();
  const results = needle ? indexed.filter((entry) => entry.text.includes(needle)) : indexed;

  const activeSkill = SKILL_FILTERS.find((skill) => skill.toLowerCase() === needle);

  return (
    <section id="browse" className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        {/* Search-as-you-type, with a submit affordance pinned to the right edge. */}
        <form
          className="group/field relative"
          onSubmit={(event) => event.preventDefault()}
          role="search"
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -inset-0.5 rounded-2xl bg-linear-to-r from-indigo-500/60 via-violet-500/50 to-emerald-500/50 opacity-0 blur-md transition-opacity duration-300 group-focus-within/field:opacity-100"
          />
          <div className="relative flex items-center gap-2 rounded-2xl border border-border bg-white/80 p-1.5 shadow-sm backdrop-blur transition-colors group-focus-within/field:border-indigo-500/50 dark:bg-slate-900/70">
            <Search className="pointer-events-none ml-2 size-4 shrink-0 text-muted-foreground" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search live briefs by skill — React, Python, UI/UX, Flutter, AI/ML"
              aria-label="Search projects by skill"
              className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <Button type="submit" size="sm" className="h-9 shrink-0 rounded-xl px-3.5">
              Search Briefs
            </Button>
          </div>
        </form>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted-foreground">Popular skills</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {SKILL_FILTERS.map((skill) => {
              const { icon: Icon, idle, active } = SKILL_META[skill];
              const isActive = activeSkill === skill;

              return (
                <button
                  key={skill}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setQuery(isActive ? "" : skill)}
                  className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring/50 ${
                    isActive ? active : idle
                  }`}
                >
                  <Icon className="size-3.5" />
                  {skill}
                </button>
              );
            })}
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="h-7 rounded-full px-2.5 text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {results.length} open {results.length === 1 ? "brief" : "briefs"}
        {activeSkill ? ` matching ${activeSkill}` : needle ? ` matching "${query.trim()}"` : ""}
      </p>

      {results.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No briefs match that search</CardTitle>
            <CardDescription>
              Try a broader skill such as React, Python or UI/UX, or clear the filter to see
              every open brief.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map(({ project }) => (
            <ProjectPreviewCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </section>
  );
}

function ProjectPreviewCard({ project }: { project: MockProject }) {
  return (
    <Card className="group/card relative h-full gap-0 bg-white py-0 ring-1 ring-slate-200/80 transition-all duration-300 hover:-translate-y-1 hover:ring-indigo-500/30 hover:shadow-[0_24px_50px_-28px_rgba(79,70,229,0.5)] dark:bg-slate-900/70 dark:ring-white/10 dark:backdrop-blur-xl dark:hover:ring-indigo-400/40">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-400/80 to-transparent opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-indigo-500/15 opacity-0 blur-3xl transition-opacity duration-500 group-hover/card:opacity-100"
      />

      <CardHeader className="pt-4 pb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <PreferredTierBadge tier={project.preferredTier} />
          <Badge variant="outline" className="border-foreground/10 text-muted-foreground">
            {project.category}
          </Badge>
        </div>
        <CardTitle className="mt-2 text-[0.95rem] leading-snug">{project.title}</CardTitle>
        <CardDescription className="line-clamp-2">{project.summary}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 text-xs text-muted-foreground">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 font-heading text-sm font-bold text-emerald-600 dark:text-emerald-400">
            {budgetLabel(project)}
          </span>
          <span className="shrink-0 text-[0.65rem] tracking-wide text-muted-foreground uppercase">
            {BUDGET_TYPE_LABELS[project.budgetType]}
          </span>
        </div>

        <TrustBadges escrowVerified={project.escrowVerified} gstInvoice={project.gstInvoice} />

        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <Users className="size-3.5" />
            {project.proposalCount} proposals
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {project.postedLabel}
          </span>
        </div>
      </CardContent>

      <CardFooter className="mt-auto justify-between gap-3 border-t border-foreground/5 bg-transparent px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={`relative flex size-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br ${clientGradient(
              project.clientName,
            )} text-[0.65rem] font-bold text-white shadow-sm`}
          >
            {clientInitials(project.clientName)}
            {project.escrowVerified ? (
              <span className="absolute -right-1 -bottom-1 flex size-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900">
                <BadgeCheck className="size-2.5 text-white" />
              </span>
            ) : null}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-foreground">{project.clientName}</p>
            <p className="truncate text-[0.65rem] text-muted-foreground">{project.clientCity}</p>
          </div>
        </div>

        <Button
          size="sm"
          variant="ghost"
          className="shrink-0 rounded-lg text-indigo-600 transition-colors hover:translate-x-0.5 hover:bg-indigo-500/10 hover:text-indigo-500 dark:text-indigo-300 dark:hover:bg-indigo-500/15"
          render={<Link href={ROUTES.register} />}
        >
          Bid Now
          <ArrowRight />
        </Button>
      </CardFooter>
    </Card>
  );
}
