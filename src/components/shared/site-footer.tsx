import Link from "next/link";

import { APP_NAME, APP_TAGLINE, ROUTES } from "@/lib/constants";

const COLUMNS = [
  {
    heading: "Marketplace",
    links: [
      { href: ROUTES.projects, label: "Browse projects" },
      { href: ROUTES.gigs, label: "Browse gigs" },
      { href: ROUTES.talent, label: "Hire talent" },
    ],
  },
  {
    heading: "For freelancers",
    links: [
      { href: `${ROUTES.home}#campus`, label: "Campus Hub" },
      { href: ROUTES.register, label: "Create a profile" },
      { href: ROUTES.login, label: "Sign in" },
    ],
  },
  {
    heading: "Trust & money",
    links: [
      { href: `${ROUTES.home}#why-escrow`, label: "Why INR escrow?" },
      { href: `${ROUTES.home}#dashboards`, label: "Escrow & payouts" },
      { href: ROUTES.escrow, label: "Settlement desk" },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-2">
          <span className="font-heading text-sm font-semibold">{APP_NAME}</span>
          <p className="text-xs text-muted-foreground">{APP_TAGLINE}</p>
          <p className="text-xs text-muted-foreground">
            Amounts are stored as whole paise, so commission and TDS arithmetic never drifts.
          </p>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.heading} className="flex flex-col gap-2">
            <span className="text-xs font-semibold">{column.heading}</span>
            <ul className="flex flex-col gap-1.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 text-xs text-muted-foreground">
          Escrow, TDS and GST handling in this build runs against a mock payment rail.
        </div>
      </div>
    </footer>
  );
}
