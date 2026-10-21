import type { Metadata } from "next";
import { connection } from "next/server";

import { FreelancerDashboard } from "@/components/dashboard/freelancer-dashboard";
import { requireRole } from "@/lib/dal";

export const metadata: Metadata = { title: "Work desk" };

/**
 * This segment reads the session (via `requireRole`) and therefore can never
 * produce a shell that is safe to prefetch. Declaring it as a blocking route
 * is the documented opt-out for session-reading pages under `cacheComponents`.
 */
export const instant = false;

export default async function FreelancerDashboardPage() {
  // The session read touches cookies and Auth.js CSRF state, which are unstable
  // during prerendering. Declare the route as request-time.
  await connection();

  const user = await requireRole("FREELANCER");

  return <FreelancerDashboard userId={user.id} />;
}
