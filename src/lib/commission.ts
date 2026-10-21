import type { FreelancerTier, VerificationStatus } from "@prisma/client";

import { CAMPUS_COMMISSION_BPS, DEFAULT_COMMISSION_BPS } from "@/lib/constants";

/**
 * Commission policy for the marketplace.
 *
 * The standard take rate is 10%. Verified Campus Talent pays 5%, which is the
 * acquisition wedge for the Indian student segment. The rate is resolved at
 * release time from the freelancer's verification state rather than stored on
 * the project, so a tier upgrade applies to the next milestone.
 */

export interface CommissionPolicyInput {
  tier?: FreelancerTier | null;
  verificationStatus?: VerificationStatus | null;
  /** Standard rate override — pass `env.PLATFORM_COMMISSION_BPS` from the server. */
  standardBps?: number;
}

/** True when the freelancer earns the discounted campus rate. */
export function isCampusDiscountEligible(input: CommissionPolicyInput): boolean {
  return input.tier === "CAMPUS_TALENT" && input.verificationStatus === "VERIFIED";
}

/**
 * Resolves the commission in basis points for a given freelancer.
 * The discounted rate can never exceed the standard rate.
 */
export function resolveCommissionBps(input: CommissionPolicyInput = {}): number {
  const standardBps = input.standardBps ?? DEFAULT_COMMISSION_BPS;

  if (!isCampusDiscountEligible(input)) return standardBps;

  return Math.min(CAMPUS_COMMISSION_BPS, standardBps);
}

/** Human-readable take rate, e.g. `"5%"`. */
export function formatCommission(bps: number): string {
  const percent = bps / 100;
  return `${Number.isInteger(percent) ? percent : percent.toFixed(2)}%`;
}
