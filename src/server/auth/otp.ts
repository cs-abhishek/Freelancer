import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

import { OTP_LENGTH, OTP_TTL_SECONDS } from "@/lib/constants";
import { env } from "@/lib/env";
import { normalizeIndianPhone } from "@/lib/validators/common";
import { prisma } from "@/server/db/client";

/** Maximum failed verification attempts before the code is burned. */
const MAX_ATTEMPTS = 5;

/**
 * Keyed hash of an OTP. The AUTH_SECRET acts as the pepper, so a leaked
 * database dump alone is not enough to recover a six-digit code offline.
 */
function hashCode(phone: string, code: string): string {
  return createHmac("sha256", env.AUTH_SECRET).update(`${phone}:${code}`).digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  const bufferA = Buffer.from(a, "hex");
  const bufferB = Buffer.from(b, "hex");
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}

export interface IssuedOtp {
  /** E.164 phone number the code was issued for. */
  phone: string;
  /** The plaintext code. Callers must deliver it and then drop it. */
  code: string;
  expiresAt: Date;
}

/**
 * Issues (and stores) a fresh OTP for a phone number, invalidating any
 * outstanding codes for that number.
 */
export async function issueOtp(rawPhone: string): Promise<IssuedOtp> {
  const phone = normalizeIndianPhone(rawPhone);
  const code = String(randomInt(0, 10 ** OTP_LENGTH)).padStart(OTP_LENGTH, "0");
  const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000);

  await prisma.$transaction([
    // Only the newest code may be valid.
    prisma.phoneOtp.updateMany({
      where: { phone, consumedAt: null },
      data: { consumedAt: new Date() },
    }),
    prisma.phoneOtp.create({
      data: { phone, codeHash: hashCode(phone, code), expires: expiresAt },
    }),
  ]);

  return { phone, code, expiresAt };
}

/**
 * Verifies a code. On success the code is consumed so it cannot be replayed.
 */
export async function verifyOtp(rawPhone: string, code: string): Promise<boolean> {
  const phone = normalizeIndianPhone(rawPhone);

  const record = await prisma.phoneOtp.findFirst({
    where: { phone, consumedAt: null },
    orderBy: { createdAt: "desc" },
  });

  if (!record || record.expires.getTime() < Date.now()) return false;

  if (record.attempts >= MAX_ATTEMPTS) {
    await prisma.phoneOtp.update({ where: { id: record.id }, data: { consumedAt: new Date() } });
    return false;
  }

  if (!safeEqualHex(record.codeHash, hashCode(phone, code))) {
    await prisma.phoneOtp.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    return false;
  }

  await prisma.phoneOtp.update({ where: { id: record.id }, data: { consumedAt: new Date() } });
  return true;
}

/**
 * Delivers an OTP. No SMS gateway is configured in the scaffold, so the code is
 * written to the server log instead. Swap this for an MSG91 / Gupshup / Twilio
 * call when the account is provisioned.
 */
export async function sendOtp(phone: string, code: string): Promise<void> {
  if (env.NODE_ENV === "production") {
    throw new Error(
      "No SMS provider is configured. Wire a gateway into sendOtp() before shipping OTP login to production.",
    );
  }
  console.info(`[dev-sms] OTP for ${phone} is ${code}`);
}
