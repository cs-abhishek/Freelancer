import type { UserRole } from "@prisma/client";
import type { DefaultSession } from "next-auth";

/**
 * Augments the Auth.js types so RBAC claims are strongly typed everywhere
 * (`session.user.role`, `token.role`) instead of falling back to `any`.
 *
 * Note: the `JWT` interface is declared in `@auth/core/jwt`. `next-auth/jwt`
 * only re-exports it with `export *`, and TypeScript module augmentation does
 * not merge through a wildcard re-export, so the augmentation must target the
 * declaring module.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      phone: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    role: UserRole;
    phone?: string | null;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    phone: string | null;
  }
}
