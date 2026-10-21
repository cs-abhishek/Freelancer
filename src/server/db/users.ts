import "server-only";

import type {
  ClientProfile,
  FreelancerProfile,
  KycDocument,
  Prisma,
  User,
} from "@prisma/client";

import { normalizeIndianPhone } from "@/lib/validators/common";
import { prisma } from "@/server/db/client";

/**
 * Every read/write of the `User` table lives here. UI components and Server
 * Actions call these helpers instead of reaching for Prisma directly.
 */

export function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export function findUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export function findUserByPhone(rawPhone: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { phone: normalizeIndianPhone(rawPhone) } });
}

/**
 * OTP sign-in doubles as sign-up: the first successful verification of a phone
 * number creates the account. `upsert` keeps two concurrent verifications from
 * racing into a unique-constraint violation.
 *
 * Profile rows (`FreelancerProfile` / `ClientProfile`) are created later, when
 * the user completes onboarding.
 */
export function findOrCreateUserByPhone(rawPhone: string): Promise<User> {
  const phone = normalizeIndianPhone(rawPhone);
  const verifiedAt = new Date();

  return prisma.user.upsert({
    where: { phone },
    create: { phone, phoneVerified: verifiedAt },
    update: { phoneVerified: verifiedAt },
  });
}

/* -------------------------------- profiles -------------------------------- */

export function getFreelancerProfile(userId: string): Promise<FreelancerProfile | null> {
  return prisma.freelancerProfile.findUnique({ where: { userId } });
}

export function getClientProfile(userId: string): Promise<ClientProfile | null> {
  return prisma.clientProfile.findUnique({ where: { userId } });
}

/* ------------------------------- kyc review ------------------------------- */

export function listKycDocumentsForUser(userId: string): Promise<KycDocument[]> {
  return prisma.kycDocument.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

const kycQueueInclude = {
  user: { select: { id: true, name: true, email: true, role: true } },
} satisfies Prisma.KycDocumentInclude;

export type KycQueueItem = Prisma.KycDocumentGetPayload<{ include: typeof kycQueueInclude }>;

/** The admin review queue: proofs that are still awaiting a decision. */
export function listPendingKycDocuments(): Promise<KycQueueItem[]> {
  return prisma.kycDocument.findMany({
    where: { status: "PENDING" },
    include: kycQueueInclude,
    orderBy: { createdAt: "asc" },
  });
}
