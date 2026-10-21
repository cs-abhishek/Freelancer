import "server-only";

import type { User, UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { findUserById } from "@/server/db/users";

/**
 * The Data Access Layer. `proxy.ts` already blocks anonymous traffic to
 * protected routes, but that is a redirect layer, not an authorization layer —
 * every Server Component / Server Action that touches private data must call
 * these helpers too.
 *
 * `cache()` dedupes the session read and the user lookup across a single
 * render pass.
 */

export const getSession = cache(() => auth());

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) return null;

  return findUserById(userId);
});

/** Redirects to the sign-in page when there is no session. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.login);
  return user;
}

/** Where a user of the given role belongs once they are signed in. */
export function dashboardForRole(role: UserRole): string {
  if (role === "FREELANCER") return ROUTES.freelancerDashboard;
  if (role === "CLIENT") return ROUTES.clientDashboard;
  return ROUTES.dashboard;
}

/** Redirects away unless the signed-in user holds one of the given roles. */
export async function requireRole(...allowed: readonly UserRole[]): Promise<User> {
  const user = await requireUser();
  if (!allowed.includes(user.role)) redirect(dashboardForRole(user.role));
  return user;
}
