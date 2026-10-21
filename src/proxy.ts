import NextAuth from "next-auth";

import { authConfig } from "@/lib/auth.config";

/**
 * Next.js 16 renamed the `middleware` file convention to `proxy`. It runs
 * before every matched request, so the RBAC decisions live in the
 * `authorized` callback of `authConfig`.
 */
export default NextAuth(authConfig).auth;

export const config = {
  // Skip Next.js internals, the Auth.js API routes and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpe?g|svg|gif|webp|ico)$).*)"],
};
