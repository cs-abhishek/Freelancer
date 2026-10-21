import type { Metadata } from "next";
import { connection } from "next/server";

import { ClientDashboard } from "@/components/dashboard/client-dashboard";
import { requireRole } from "@/lib/dal";

export const metadata: Metadata = { title: "Hiring desk" };

/**
 * This segment reads the session (via `requireRole`) and therefore can never
 * produce a shell that is safe to prefetch. Declaring it as a blocking route
 * is the documented opt-out for session-reading pages under `cacheComponents`.
 */
export const instant = false;

export default async function ClientDashboardPage() {
  // The session read touches cookies and Auth.js CSRF state, which are unstable
  // during prerendering. Declare the route as request-time.
  await connection();

  const user = await requireRole("CLIENT");

  return <ClientDashboard userId={user.id} />;
}
