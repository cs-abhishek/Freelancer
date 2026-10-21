import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BookGigForm } from "@/components/forms/book-gig-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants";
import { requireUser } from "@/lib/dal";
import { formatINR } from "@/lib/money";
import { getGigById } from "@/server/db/projects";

export const metadata: Metadata = { title: "Gig" };

export default async function GigDetailPage({ params }: PageProps<"/gigs/[id]">) {
  const { id } = await params;
  const user = await requireUser();

  const gig = await getGigById(id);
  if (!gig) notFound();

  const isOwner = gig.freelancerId === user.id;
  // An unpublished gig stays reachable for its owner only.
  if (!gig.isActive && !isOwner) notFound();

  const canBook = user.role === "CLIENT" && !isOwner;

  return (
    <>
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{gig.category}</Badge>
          {gig.skills.map((skill) => (
            <Badge key={skill} variant="ghost">
              {skill}
            </Badge>
          ))}
          {gig.isActive ? null : <Badge variant="outline">Paused</Badge>}
        </div>
        <h1 className="text-xl font-semibold tracking-tight">{gig.title}</h1>
        <p className="text-sm text-muted-foreground">
          By {gig.freelancer.name ?? "a freelancer"} · {gig.deliveryDays} day delivery ·{" "}
          {gig.revisionsIncluded} revisions
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>What you get</CardTitle>
          <CardDescription>Fixed price, delivered in {gig.deliveryDays} days.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm whitespace-pre-wrap">{gig.description}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{formatINR(gig.pricePaise)}</CardTitle>
          <CardDescription>
            {canBook
              ? "Booking opens a project with the amount held in escrow until you approve delivery."
              : "Only clients can book a gig. Switch to a client account to hire."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {canBook ? (
            <BookGigForm gigId={gig.id} pricePaise={gig.pricePaise} />
          ) : (
            <Button variant="outline" render={<Link href={ROUTES.gigs} />}>
              Browse other gigs
            </Button>
          )}
        </CardContent>
      </Card>
    </>
  );
}
