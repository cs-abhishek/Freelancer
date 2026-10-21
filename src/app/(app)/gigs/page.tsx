import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { GigCardItem } from "@/components/marketplace-cards";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PROJECT_CATEGORIES, ROUTES, type ProjectCategory } from "@/lib/constants";
import { requireUser } from "@/lib/dal";
import { listActiveGigs } from "@/server/db/projects";

export const metadata: Metadata = { title: "Gigs" };

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isCategory(value: string | undefined): value is ProjectCategory {
  return value !== undefined && (PROJECT_CATEGORIES as readonly string[]).includes(value);
}

export default async function GigsPage({ searchParams }: PageProps<"/gigs">) {
  await requireUser();
  const raw = await searchParams;

  const category = firstParam(raw.category);
  const search = firstParam(raw.q);
  const page = Number.parseInt(firstParam(raw.page) ?? "1", 10);
  const currentPage = Number.isFinite(page) && page > 0 ? page : 1;

  const { items, total, pageSize } = await listActiveGigs({
    page: currentPage,
    pageSize: 12,
    category: isCategory(category) ? category : undefined,
    search,
  });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Packaged gigs</h1>
        <p className="text-sm text-muted-foreground">
          {total} fixed-price deliverables you can book instantly
        </p>
      </header>

      <form action={ROUTES.gigs} className="flex flex-wrap items-end gap-3">
        <div className="flex min-w-56 flex-1 flex-col gap-2">
          <Label htmlFor="q">Search</Label>
          <Input id="q" name="q" defaultValue={search ?? ""} placeholder="What do you need done?" />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            name="category"
            defaultValue={category ?? ""}
            className="border-input bg-background h-8 rounded-lg border px-2 text-sm"
          >
            <option value="">All categories</option>
            {PROJECT_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
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
          title="No gigs match that search"
          description="Freelancers publish packaged deliverables here for instant booking."
          action={<Button render={<Link href={ROUTES.projects} />}>Browse projects instead</Button>}
        />
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((gig) => (
            <GigCardItem key={gig.id} gig={gig} />
          ))}
        </section>
      )}

      {totalPages > 1 ? (
        <p className="text-xs text-muted-foreground">
          Page {currentPage} of {totalPages}
        </p>
      ) : null}
    </>
  );
}
