import type { ReactNode } from "react";
import { BadgeCheck, Quote, Star } from "lucide-react";
import Link from "next/link";

import { AuthRolePreview } from "@/components/shared/auth-role-preview";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { APP_NAME, APP_TAGLINE, ROUTES } from "@/lib/constants";

/** Illustrative portraits — initials double as the fallback while they load. */
function portrait(seed: string): string {
  const params = new URLSearchParams({
    seed,
    backgroundColor: "e0e7ff,ede9fe,d1fae5,fef3c7,dbeafe",
  });
  return `https://api.dicebear.com/9.x/notionists/svg?${params.toString()}`;
}

const TESTIMONIALS = [
  {
    quote:
      "We released a milestone on a Sunday and the developer had the money before our chai arrived. The GST invoice was already sitting in the ledger.",
    name: "Priya Sharma",
    role: "Founder, Sharma Naturals · Jaipur",
    initials: "PS",
  },
  {
    quote:
      "I billed ₹45,000 from my hostel in my third year. The 5% campus fee meant I kept almost all of it, and nothing got lost in conversion.",
    name: "Ananya Iyer",
    role: "Verified Campus Star · IIT Bombay",
    initials: "AI",
  },
] as const;

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col lg:grid lg:grid-cols-[1.05fr_minmax(0,0.95fr)]">
      {/* ------------------------------- left ------------------------------- */}
      <aside className="relative isolate hidden flex-col justify-between gap-10 overflow-hidden bg-mesh-brand p-10 lg:flex xl:p-12">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-grid-pattern opacity-50"
        />

        <Link href={ROUTES.home} className="flex flex-col gap-1">
          <span className="font-heading text-base font-semibold text-gradient-brand">{APP_NAME}</span>
          <span className="text-xs text-muted-foreground">{APP_TAGLINE}</span>
        </Link>

        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-3">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[0.7rem] font-semibold text-emerald-700 dark:text-emerald-300">
              <span className="size-1.5 animate-pulse-dot rounded-full bg-emerald-500" />
              ₹0 forex fees · instant UPI payouts
            </span>
            <h1 className="max-w-md text-2xl font-semibold tracking-tight text-balance xl:text-3xl">
              India&apos;s escrow-protected marketplace for{" "}
              <span className="text-gradient-money">serious work</span>.
            </h1>
          </div>

          <AuthRolePreview />
        </div>

        <div className="grid gap-3 xl:grid-cols-2">
          {TESTIMONIALS.map((item) => (
            <figure
              key={item.name}
              className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/60 p-4 backdrop-blur-md"
            >
              <Quote className="size-4 text-indigo-500" />
              <blockquote className="text-xs text-muted-foreground">{item.quote}</blockquote>
              <figcaption className="mt-auto flex items-center gap-2.5">
                <Avatar>
                  <AvatarImage src={portrait(item.name)} alt="" />
                  <AvatarFallback>{item.initials}</AvatarFallback>
                </Avatar>
                <span className="flex flex-col">
                  <span className="text-xs font-semibold">{item.name}</span>
                  <span className="text-[0.65rem] text-muted-foreground">{item.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="flex items-center gap-2 text-[0.65rem] text-muted-foreground">
          <span className="flex items-center gap-1">
            {[0, 1, 2, 3, 4].map((index) => (
              <Star key={index} className="size-3 fill-amber-400 text-amber-400" />
            ))}
          </span>
          <span className="font-semibold text-amber-600 dark:text-amber-400">4.9</span>
          <span>average hire rating across 12,400+ verified freelancers</span>
          <BadgeCheck className="ml-1 size-3.5 text-emerald-500" />
        </div>
      </aside>

      {/* ------------------------------- right ------------------------------ */}
      <main className="relative isolate flex flex-1 flex-col items-center justify-center gap-6 p-6">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-80 bg-mesh-ambient opacity-70 blur-3xl lg:hidden"
        />

        <Link href={ROUTES.home} className="flex flex-col items-center gap-0.5 text-center lg:hidden">
          <span className="font-heading text-base font-semibold">{APP_NAME}</span>
          <span className="text-xs text-muted-foreground">{APP_TAGLINE}</span>
        </Link>

        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
