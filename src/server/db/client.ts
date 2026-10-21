import "server-only";

import { PrismaClient } from "@prisma/client";

import { env } from "@/lib/env";

/**
 * A single PrismaClient per process.
 *
 * Next.js hot-reloads modules in development, which would otherwise open a new
 * connection pool on every reload until Postgres refuses new connections.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
