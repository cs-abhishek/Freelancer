import { GraduationCap } from "lucide-react";
import Link from "next/link";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { APP_NAME, ROUTES } from "@/lib/constants";

/**
 * The public navigation. Deliberately free of session reads so the marketing
 * pages stay statically renderable — the signed-in shell lives in
 * `AppHeader`, which is only mounted inside `(app)`.
 */
const NAV_LINKS = [
  { href: ROUTES.projects, label: "Find Work" },
  { href: ROUTES.talent, label: "Hire Talent" },
  { href: `${ROUTES.home}#campus`, label: "Campus Hub (Students)" },
  { href: `${ROUTES.home}#why-escrow`, label: "Why INR Escrow?" },
] as const;

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      {/* Brand hairline, so the chrome carries the accent even when scrolled. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-500/60 to-transparent"
      />
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-2">
        <Link href={ROUTES.home} className="font-heading text-sm font-semibold text-gradient-brand">
          {APP_NAME}
        </Link>

        <nav className="ml-2 hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <Button key={link.href} variant="ghost" size="sm" render={<Link href={link.href} />}>
              {link.label}
            </Button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            size="sm"
            className="hidden rounded-lg sm:inline-flex"
            render={<Link href={ROUTES.projects} />}
          >
            Post a Project
          </Button>
          <Button
            variant="brand"
            size="sm"
            className="rounded-lg"
            render={<Link href={ROUTES.register} />}
          >
            Join as Freelancer
          </Button>
        </div>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto border-t px-3 py-1.5 lg:hidden">
        <GraduationCap className="size-4 shrink-0 text-muted-foreground" />
        {NAV_LINKS.map((link) => (
          <Button
            key={link.href}
            variant="ghost"
            size="sm"
            render={<Link href={link.href} />}
            className="shrink-0"
          >
            {link.label}
          </Button>
        ))}
      </nav>
    </header>
  );
}
