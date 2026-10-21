import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { dashboardForRole, requireUser } from "@/lib/dal";

export const metadata: Metadata = { title: "Dashboard" };

/**
 * Role router. `/dashboard` is a stable link target for the shell, so rather
 * than moving it, it forwards client and freelancer accounts to their own
 * workspace. Admins land on the operations desk here.
 */
export default async function DashboardPage() {
  const user = await requireUser();

  if (user.role === "ADMIN") return <AdminDashboard />;

  redirect(dashboardForRole(user.role));
}
