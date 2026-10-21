import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { ProjectCardItem } from "@/components/marketplace-cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PROJECT_CATEGORIES, ROUTES } from "@/lib/constants";
import { requireUser } from "@/lib/dal";
import { ENGAGEMENT_MODELS, projectFiltersSchema } from "@/lib/validators/projects";
import { listOpenProjects } from "@/server/db/projects";

export const metadata: Metadata = { title: "Projects" };

/** A repeated search param arrives as an array; the first value wins. */
function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

interface AppliedFilters {
  q?: string;
  category?: string;
  engagementModel?: string;
}

function pageHref(page: number, applied: AppliedFilters): string {
  const params = new URLSearchParams();
  if (applied.q) params.set("q", applied.q);
  if (applied.category) params.set("category", applied.category);
  if (applied.engagementModel) params.set("engagementModel", applied.engagementModel);
  params.set("page", String(page));
  return `${ROUTES.projects}?${params.toString()}`;
}

export default async function ProjectsPage({ searchParams }: PageProps<"/projects">) {
  await requireUser();
  const raw = await searchParams;

  const parsed = projectFiltersSchema.safeParse({
    q: firstParam(raw.q),
    category: firstParam(raw.category),
    engagementModel: firstParam(raw.engagementModel),
    minBudgetRupees: firstParam(raw.minBudgetRupees),
    maxBudgetRupees: firstParam(raw.maxBudgetRupees),
    page: firstParam(raw.page),
    pageSize: firstParam(raw.pageSize),
  });

  // Bad query strings fall back to the defaults rather than throwing a 500.
  const filters = parsed.success ? parsed.data : projectFiltersSchema.parse({});
  const applied: AppliedFilters = {
    q: filters.q,
    category: filters.category,
    engagementModel: filters.engagementModel,
  };

  const { items, total, page, pageSize } = await listOpenProjects({
    page: filters.page,
    pageSize: filters.pageSize,
    category: filters.category,
    engagementModel: filters.engagementModel,
    search: filters.q,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Open projects</h1>
        <p className="text-sm text-muted-foreground">{total} projects accepting proposals</p>
      </header>

      <form action={ROUTES.projects} className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-56 flex-1 flex-col gap-2">
          <Label htmlFor="q">Search</Label>
          <Input
            id="q"
            name="q"
            defaultValue={applied.q ?? ""}
            placeholder="Title, description or skill"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            name="category"
            defaultValue={applied.category ?? ""}
            className="border-input bg-background h-8 rounded-lg border px-2 text-sm"
          >
            <option value="">All categories</option>
            {PROJECT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="engagementModel">Work model</Label>
          <select
            id="engagementModel"
            name="engagementModel"
            defaultValue={applied.engagementModel ?? ""}
            className="border-input bg-background h-8 rounded-lg border px-2 text-sm"
          >
            <option value="">Any</option>
            {ENGAGEMENT_MODELS.map((model) => (
              <option key={model} value={model}>
                {model === "BIDDING" ? "Bidding" : "Instant book"}
              </option>
            ))}
          </select>
        </div>

        <Button type="submit" variant="outline">
          <Search />
          Filter
        </Button>
      </form>

      {items.length === 0 ? (
        <EmptyState
          title="No projects match those filters"
          description="Try a broader search, or post the brief yourself."
          action={<Button render={<Link href={ROUTES.projectNew} />}>Post a project</Button>}
        />
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((project) => (
            <ProjectCardItem key={project.id} project={project} />
          ))}
        </section>
      )}

      {totalPages > 1 ? (
        <nav className="flex items-center justify-between gap-2">
          {page > 1 ? (
            <Button variant="outline" size="sm" render={<Link href={pageHref(page - 1, applied)} />}>
              Previous
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
          )}
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Button variant="outline" size="sm" render={<Link href={pageHref(page + 1, applied)} />}>
              Next
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          )}
        </nav>
      ) : null}
    </>
  );
}
