import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import { ROUTES } from "@/lib/constants";
import { hasGitHubOAuth, hasGoogleOAuth } from "@/lib/env";

/**
 * The provider + RBAC half of the Auth.js configuration.
 *
 * It is deliberately free of Prisma and Node-only modules so that
 * `src/proxy.ts` (which runs before every matched request) can load it without
 * pulling the database client into the request hot path.
 */

/** Route prefixes that require a signed-in user. Evaluated as path segments, so `/projects` stays public while `/projects/new` does not. */
const PROTECTED_PREFIXES = [
  ROUTES.dashboard,
  ROUTES.bids,
  ROUTES.escrow,
  ROUTES.settings,
  ROUTES.onboarding,
  ROUTES.projectNew,
] as const;

const AUTH_PAGES = [ROUTES.login, ROUTES.register] as const;

function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix));
}

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: ROUTES.login },
  providers: [
    // Only register providers we actually have credentials for, otherwise the
    // sign-in page advertises buttons that cannot complete.
    ...(hasGoogleOAuth ? [Google] : []),
    ...(hasGitHubOAuth ? [GitHub] : []),
  ],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isSignedIn = Boolean(auth?.user);
      const { pathname } = nextUrl;

      if (isSignedIn && AUTH_PAGES.some((page) => matchesPrefix(pathname, page))) {
        return Response.redirect(new URL(ROUTES.dashboard, nextUrl));
      }

      return isProtectedPath(pathname) ? isSignedIn : true;
    },

    jwt({ token, user }) {
      // `user` is only present on the request that performs the sign-in; every
      // later request rehydrates from the token.
      if (user) {
        token.id = user.id ?? token.sub ?? "";
        token.role = user.role;
        token.phone = user.phone ?? null;
      }
      return token;
    },

    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.phone = token.phone;
      return session;
    },
  },
} satisfies NextAuthConfig;
