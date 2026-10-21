import { LogOut } from "lucide-react";
import Link from "next/link";
import { connection } from "next/server";

import { signOutAction } from "@/actions/auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { getCurrentUser } from "@/lib/dal";

const NAV_LINKS = [
  { href: ROUTES.dashboard, label: "Dashboard" },
  { href: ROUTES.projects, label: "Projects" },
  { href: ROUTES.gigs, label: "Gigs" },
  { href: ROUTES.bids, label: "Proposals" },
  { href: ROUTES.escrow, label: "Escrow" },
  { href: ROUTES.settings, label: "Settings" },
] as const;

export async function AppHeader() {
  // Auth.js reads cookies and generates CSRF values, which are unstable during
  // prerendering. Declare the shell as request-time so static pages (the
  // marketing homepage) can still render it.
  await connection();

  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-4 py-2">
        <Link href={ROUTES.home} className="font-heading text-sm font-semibold">
          {APP_NAME}
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Button key={link.href} variant="ghost" size="sm" render={<Link href={link.href} />}>
              {link.label}
            </Button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {user?.role ? (
            <Badge variant="outline" className="hidden sm:inline-flex">
              {user.role}
            </Badge>
          ) : null}
          <ThemeToggle />
          {user ? (
            <form action={signOutAction}>
              <Button type="submit" variant="outline" size="sm">
                <LogOut />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </form>
          ) : (
            <Button size="sm" render={<Link href={ROUTES.login} />}>
              Sign in
            </Button>
          )}
        </div>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto border-t px-3 py-1.5 md:hidden">
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
