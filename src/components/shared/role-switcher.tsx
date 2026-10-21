"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const WORKSPACES = [
  { href: ROUTES.clientDashboard, label: "Hiring" },
  { href: ROUTES.freelancerDashboard, label: "Working" },
] as const;

/**
 * Segmented control for users who both hire and deliver. Both workspaces are
 * reachable from either side, so the switcher is a pair of links rather than a
 * modal role picker.
 */
export function RoleSwitcher({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-lg border border-border p-0.5",
        className,
      )}
    >
      {WORKSPACES.map((workspace) => {
        const active = pathname.startsWith(workspace.href);

        return (
          <Link
            key={workspace.href}
            href={workspace.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-[min(var(--radius-md),10px)] px-2.5 py-1 text-xs font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {workspace.label}
          </Link>
        );
      })}
    </div>
  );
}
