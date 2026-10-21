import type { Metadata } from "next";
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  FileText,
  GraduationCap,
  IndianRupee,
  Landmark,
  Lock,
  Percent,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";

import { MarketplaceExplorer } from "@/components/shared/marketplace-explorer";
import { Avatar, AvatarFallback, AvatarImage, AvatarGroup } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CAMPUS_COMMISSION_BPS, DEFAULT_COMMISSION_BPS, ROUTES } from "@/lib/constants";
import { formatINR } from "@/lib/money";

export const metadata: Metadata = {
  title: {
    absolute: "Hire verified Indian students and working pros — UPI escrow protected",
  },
  description:
    "India's zero-friction freelance marketplace: INR budgets, milestone escrow, TDS and GST handled, and same-day UPI payouts. Zero forex fees.",
};

/** Illustrative portraits for the social-proof stack. */
const SOCIAL_PROOF_AVATARS = [
  { seed: "Ananya Iyer", initials: "AI" },
  { seed: "Rohit Deshmukh", initials: "RD" },
  { seed: "Meera Nair", initials: "MN" },
  { seed: "Karthik Reddy", initials: "KR" },
  { seed: "Simran Kaur", initials: "SK" },
] as const;

function portrait(seed: string): string {
  const params = new URLSearchParams({
    seed,
    backgroundColor: "e0e7ff,ede9fe,d1fae5,fef3c7,dbeafe",
  });
  return `https://api.dicebear.com/9.x/notionists/svg?${params.toString()}`;
}

const HERO_STATS = [
  {
    icon: Percent,
    label: "Standard commission",
    value: `${DEFAULT_COMMISSION_BPS / 100}%`,
    body: "One flat take rate on every released milestone. No subscriptions, no listing fees.",
    bar: "via-indigo-500",
    glow: "bg-indigo-500/10",
    iconClass: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300",
    valueClass: "text-indigo-600 dark:text-indigo-300",
  },
  {
    icon: GraduationCap,
    label: "Verified campus talent",
    value: `${CAMPUS_COMMISSION_BPS / 100}%`,
    body: "Colleges verified on .edu.in or .ac.in pay half the standard take rate.",
    bar: "via-violet-500",
    glow: "bg-violet-500/10",
    iconClass: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
    valueClass: "text-violet-600 dark:text-violet-300",
  },
  {
    icon: IndianRupee,
    label: "Forex fees on payouts",
    value: "₹0",
    body: "Rupees in, rupees out over UPI. No conversion spread quietly eating the invoice.",
    bar: "via-emerald-500",
    glow: "bg-emerald-500/10",
    iconClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
    valueClass: "text-emerald-600 dark:text-emerald-400",
  },
] as const;

const ESCROW_REASONS = [
  {
    icon: Lock,
    title: "Client money is locked, not promised",
    body: "The client funds the milestone before work starts. The freelancer can see the balance sitting in escrow, so neither side is relying on goodwill.",
    iconClass: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300",
    bar: "via-indigo-500",
  },
  {
    icon: IndianRupee,
    title: "Every number is in rupees",
    body: "Budgets, bids, commission and payouts are all denominated in INR and stored as whole paise. No conversion, no forex markup, no rounding drift.",
    iconClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300",
    bar: "via-emerald-500",
  },
  {
    icon: FileText,
    title: "GST invoices and TDS, automatically",
    body: "Commission carries 18% GST and payouts withhold TDS under 194J or 194C. Both are recorded on the ledger at the moment a milestone is released.",
    iconClass: "bg-blue-500/15 text-blue-600 dark:text-blue-300",
    bar: "via-blue-500",
  },
  {
    icon: Zap,
    title: "Payouts straight to UPI",
    body: "Approved milestones settle to the freelancer's UPI ID through a split payout, so the money arrives the same day instead of after a week.",
    iconClass: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
    bar: "via-amber-500",
  },
] as const;

const TIERS = [
  {
    icon: GraduationCap,
    name: "Verified Campus Talent",
    price: `${CAMPUS_COMMISSION_BPS / 100}% commission`,
    points: [
      "College email on .edu.in / .ac.in, or a reviewed college ID",
      "GitHub or portfolio link checked by our team",
      "Half the standard take rate on every engagement",
    ],
    iconClass: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
    badgeVariant: "campus",
    bar: "via-violet-500",
  },
  {
    icon: Briefcase,
    name: "Verified Working Professionals",
    price: `${DEFAULT_COMMISSION_BPS / 100}% commission`,
    points: [
      "Work history and LinkedIn confirmed",
      "PAN verified for TDS reporting",
      "Higher escrow limits on long-running contracts",
    ],
    iconClass: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
    badgeVariant: "senior",
    bar: "via-amber-500",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="relative isolate">
        {/* Ambient mesh + hairline grid, so the hero never reads as a black void. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-[-10%] -top-40 -z-10 h-[34rem] bg-mesh-brand blur-3xl"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-[-10%] -top-24 -z-10 h-[30rem] bg-grid-pattern opacity-60"
        />

        <div className="grid items-center gap-12 pt-4 lg:grid-cols-[1.05fr_minmax(0,0.95fr)]">
          {/* ------------------------------ left ------------------------------ */}
          <div className="flex flex-col items-start gap-6">
            <span className="inline-flex rounded-full bg-linear-to-r from-indigo-500 via-violet-500 to-emerald-500 p-px shadow-glow-brand">
              <span className="inline-flex items-center gap-2 rounded-full bg-background/90 px-3.5 py-1.5 text-xs font-medium backdrop-blur">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
                </span>
                🇮🇳 Built for Indian Students, Working Pros &amp; Growing Businesses
              </span>
            </span>

            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl lg:text-5xl lg:leading-[1.08]">
              Hire verified Indian students and top working pros.{" "}
              <span className="text-gradient-money">
                Zero forex fees, 100% UPI escrow protection.
              </span>
            </h1>

            <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
              Post a brief and compare proposals in rupees, or instant-book a packaged gig. The
              client funds each milestone into escrow first, and it is released to the freelancer
              only after the deliverable is approved — with TDS and GST recorded on the way out.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                variant="brand"
                className="h-11 rounded-xl px-5 text-sm"
                render={<Link href={ROUTES.projectNew} />}
              >
                Post a Project
                <ArrowRight />
              </Button>
              <Button
                size="lg"
                variant="glass"
                className="h-11 rounded-xl px-5 text-sm"
                render={<Link href={ROUTES.register} />}
              >
                <Rocket />
                Join as Freelancer
              </Button>
              <Button
                size="lg"
                variant="link"
                className="h-11 px-1 text-sm"
                render={<Link href={ROUTES.talent} />}
              >
                Browse verified talent
                <ArrowRight />
              </Button>
            </div>

            {/* ------------------------- social proof ------------------------- */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
              <AvatarGroup>
                {SOCIAL_PROOF_AVATARS.map((person) => (
                  <Avatar key={person.seed} size="lg">
                    <AvatarImage src={portrait(person.seed)} alt="" />
                    <AvatarFallback>{person.initials}</AvatarFallback>
                  </Avatar>
                ))}
              </AvatarGroup>

              <div className="flex flex-col gap-1">
                <span className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map((index) => (
                    <Star key={index} className="size-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
                    4.9
                  </span>
                  <span className="ml-1 text-xs text-muted-foreground">average hire rating</span>
                </span>
                <p className="max-w-md text-xs text-muted-foreground">
                  Trusted by{" "}
                  <span className="font-semibold text-foreground">12,400+</span> verified
                  IIT/NIT/Tier-1 students, software engineers &amp;{" "}
                  <span className="font-semibold text-foreground">1,800+</span> Indian D2C/SaaS
                  brands
                </p>
              </div>
            </div>
          </div>

          {/* ------------------------------ right ----------------------------- */}
          <div className="relative">
            <span
              aria-hidden
              className="pointer-events-none absolute -inset-8 -z-10 rounded-[3rem] bg-mesh-brand opacity-70 blur-3xl"
            />

            <div className="glass-panel relative rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                    <ShieldCheck className="size-4" />
                  </span>
                  <div>
                    <p className="font-heading text-xs font-semibold">
                      Live INR Escrow &amp; Instant Payout
                    </p>
                    <p className="text-[0.65rem] text-muted-foreground">
                      Razorpay Route · settlement live
                    </p>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[0.6rem] font-semibold tracking-wide text-emerald-600 uppercase dark:text-emerald-400">
                  <span className="size-1.5 animate-pulse-dot rounded-full bg-emerald-500" />
                  Live
                </span>
              </div>

              <div className="mt-4 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[0.6rem] font-semibold tracking-wider text-muted-foreground uppercase">
                    Milestone 2
                  </span>
                  <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[0.6rem] font-semibold text-emerald-600 dark:text-emerald-400">
                    Funded
                  </span>
                </div>

                <p className="mt-1.5 font-heading text-sm font-semibold">
                  Razorpay Checkout Integration - Milestone 2
                </p>

                <div className="mt-3 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[0.65rem] text-muted-foreground">Held in UPI escrow</p>
                    <p className="font-heading text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                      ₹35,000
                    </p>
                  </div>
                  <p className="text-right text-[0.65rem] leading-relaxed text-muted-foreground">
                    GlowRoute
                    <br />
                    Mumbai
                  </p>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-emerald-500/15">
                  <div className="h-full w-full rounded-full bg-linear-to-r from-emerald-500 via-emerald-400 to-cyan-400" />
                </div>
                <div className="mt-2 flex justify-between text-[0.6rem] text-muted-foreground">
                  <span>Funded 12 Oct</span>
                  <span>Releases on approval</span>
                </div>
              </div>

              <dl className="mt-3 flex flex-col gap-1.5 border-t border-emerald-500/15 pt-3 text-[0.65rem]">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Gross milestone</dt>
                  <dd className="font-heading font-semibold">{formatINR(3_500_000)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Payout to freelancer</dt>
                  <dd className="font-heading font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatINR(3_325_000)}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Floating payout receipt */}
            <div className="animate-float-slow relative z-10 mx-3 -mt-3 rounded-xl border border-emerald-500/30 bg-white/80 p-3 shadow-xl backdrop-blur-xl dark:bg-slate-900/80 sm:mx-8">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-glow-money">
                  <Zap className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold">⚡ Instant Payout Released</p>
                  <p className="text-[0.7rem] text-muted-foreground">
                    <span className="font-heading font-bold text-emerald-600 dark:text-emerald-400">
                      {formatINR(3_325_000)}
                    </span>{" "}
                    credited to{" "}
                    <span className="font-medium text-foreground">upi@okaxis</span> in 4 seconds
                  </p>
                  <p className="mt-0.5 text-[0.6rem] text-muted-foreground">
                    Zero forex fee · ₹1,750 campus fee (5%)
                  </p>
                </div>
              </div>
            </div>

            {/* Floating verified-freelancer profile */}
            <div className="animate-float relative z-20 mx-1 -mt-2 flex items-center gap-3 rounded-xl border border-violet-500/25 bg-white/80 p-3 shadow-xl backdrop-blur-xl dark:bg-slate-900/80 sm:mx-2">
              <Avatar size="lg">
                <AvatarImage src={portrait("Ananya Iyer")} alt="" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="truncate text-xs font-semibold">Ananya Iyer</p>
                  <BadgeCheck className="size-3.5 shrink-0 text-emerald-500" />
                </div>
                <p className="truncate text-[0.65rem] font-medium text-violet-600 dark:text-violet-300">
                  Verified Campus Star • 5% Fee Tier
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {["React", "TypeScript", "Tailwind"].map((skill) => (
                    <span
                      key={skill}
                      className="rounded-md border border-foreground/10 bg-foreground/5 px-1.5 py-0.5 text-[0.6rem] text-muted-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------- stat cards ---------------------------- */}
        <dl className="grid w-full gap-4 pt-10 sm:grid-cols-3">
          {HERO_STATS.map((stat) => (
            <div
              key={stat.label}
              className="relative overflow-hidden rounded-2xl border bg-white/70 p-4 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-500/30 dark:bg-slate-900/60"
            >
              <span
                aria-hidden
                className={`pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent ${stat.bar} to-transparent`}
              />
              <span
                aria-hidden
                className={`pointer-events-none absolute -top-12 -right-8 size-24 rounded-full ${stat.glow} blur-2xl`}
              />
              <span
                className={`inline-flex size-9 items-center justify-center rounded-xl ${stat.iconClass}`}
              >
                <stat.icon className="size-4" />
              </span>
              <dt className="mt-3 text-xs text-muted-foreground">{stat.label}</dt>
              <dd>
                <span className={`font-heading text-2xl font-bold ${stat.valueClass}`}>
                  {stat.value}
                </span>
                <span className="mt-1 block text-[0.7rem] leading-relaxed text-muted-foreground">
                  {stat.body}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <MarketplaceExplorer />

      <section id="why-escrow" className="flex flex-col gap-5 scroll-mt-20">
        <div className="flex flex-col gap-2">
          <Badge variant="money">
            <ShieldCheck />
            Why INR escrow?
          </Badge>
          <h2 className="text-2xl font-semibold tracking-tight">
            The trust layer Indian freelancing has been missing
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Global marketplaces settle in dollars and leave Indian freelancers waiting on payouts.
            This one holds the money in rupees, in escrow, and moves it over UPI.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {ESCROW_REASONS.map((reason) => (
            <Card
              key={reason.title}
              className="group/card relative overflow-hidden bg-white/70 ring-1 ring-slate-200/80 transition-all duration-300 hover:-translate-y-1 hover:ring-indigo-500/30 dark:bg-slate-900/60 dark:ring-white/10"
            >
              <span
                aria-hidden
                className={`pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent ${reason.bar} to-transparent`}
              />
              <CardHeader>
                <span
                  className={`inline-flex size-9 items-center justify-center rounded-xl ${reason.iconClass}`}
                >
                  <reason.icon className="size-4" />
                </span>
                <CardTitle>{reason.title}</CardTitle>
                <CardDescription>{reason.body}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section id="campus" className="flex flex-col gap-5 scroll-mt-20">
        <div className="flex flex-col gap-2">
          <Badge variant="campus">
            <GraduationCap />
            Campus Hub
          </Badge>
          <h2 className="text-2xl font-semibold tracking-tight">
            Two verification tiers, one marketplace
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Students get their first paid engagements at half the standard commission. Businesses
            get a verified, accountable counterparty either way.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {TIERS.map((tier) => (
            <Card
              key={tier.name}
              className="group/card relative overflow-hidden bg-white/70 ring-1 ring-slate-200/80 transition-all duration-300 hover:-translate-y-1 hover:ring-violet-500/30 dark:bg-slate-900/60 dark:ring-white/10"
            >
              <span
                aria-hidden
                className={`pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent ${tier.bar} to-transparent`}
              />
              <CardHeader>
                <span
                  className={`inline-flex size-9 items-center justify-center rounded-xl ${tier.iconClass}`}
                >
                  <tier.icon className="size-4" />
                </span>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription>
                  <Badge variant={tier.badgeVariant}>{tier.price}</Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-2 text-xs text-muted-foreground">
                  {tier.points.map((point) => (
                    <li key={point} className="flex items-start gap-2">
                      <BadgeCheck className="mt-0.5 size-3.5 shrink-0 text-violet-500" />
                      {point}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="dashboards" className="flex flex-col gap-5 scroll-mt-20">
        <div className="flex flex-col gap-2">
          <Badge variant="open">
            <TrendingUp />
            Workspaces
          </Badge>
          <h2 className="text-2xl font-semibold tracking-tight">
            One dashboard per side of the deal
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Both workspaces show escrow held in rupees, milestones in flight and the state of your
            verification.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="group/card relative overflow-hidden bg-white/70 ring-1 ring-slate-200/80 transition-all duration-300 hover:-translate-y-1 hover:ring-indigo-500/30 dark:bg-slate-900/60 dark:ring-white/10">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-indigo-500 to-transparent"
            />
            <CardHeader>
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-300">
                <Landmark className="size-4" />
              </span>
              <CardTitle>Client workspace</CardTitle>
              <CardDescription>
                Post briefs, review proposals and fund milestones into escrow.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-xs text-muted-foreground">
              <p className="font-heading text-2xl font-bold text-indigo-600 dark:text-indigo-300">
                {formatINR(4_500_000)}
              </p>
              <p>Currently held in your escrow accounts</p>
              <Button
                variant="outline"
                className="w-fit transition-colors hover:border-indigo-500/40 hover:text-indigo-600 dark:hover:text-indigo-300"
                render={<Link href={ROUTES.clientDashboard} />}
              >
                Open hiring desk
                <ArrowRight />
              </Button>
            </CardContent>
          </Card>

          <Card className="group/card relative overflow-hidden bg-white/70 ring-1 ring-slate-200/80 transition-all duration-300 hover:-translate-y-1 hover:ring-emerald-500/30 dark:bg-slate-900/60 dark:ring-white/10">
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-emerald-500 to-transparent"
            />
            <CardHeader>
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
                <IndianRupee className="size-4" />
              </span>
              <CardTitle>Freelancer workspace</CardTitle>
              <CardDescription>
                Find work, submit milestones and track UPI payouts and TDS.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-xs text-muted-foreground">
              <p className="font-heading text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatINR(1_250_000)}
              </p>
              <p>Secured in escrow on your active engagements</p>
              <Button
                variant="outline"
                className="w-fit transition-colors hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-300"
                render={<Link href={ROUTES.freelancerDashboard} />}
              >
                Open work desk
                <ArrowRight />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="relative isolate overflow-hidden rounded-3xl border bg-white/70 p-8 text-center dark:bg-slate-900/60">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-mesh-warm opacity-80"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-grid-pattern opacity-50"
        />
        <Sparkles className="mx-auto size-5 text-amber-500" />
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">
          Post your first brief in rupees, not dollars
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Fund the milestone, watch the escrow balance, release it when the work lands. The invoice
          and the TDS entry write themselves.
        </p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Button
            size="lg"
            variant="brand"
            className="h-11 rounded-xl px-5 text-sm"
            render={<Link href={ROUTES.projectNew} />}
          >
            Post a Project
            <ArrowRight />
          </Button>
          <Button
            size="lg"
            variant="glass"
            className="h-11 rounded-xl px-5 text-sm"
            render={<Link href={ROUTES.talent} />}
          >
            Browse verified talent
          </Button>
        </div>
      </section>
    </>
  );
}
