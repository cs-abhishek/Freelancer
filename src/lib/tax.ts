import { applyBps, assertPaise } from "@/lib/money";

/**
 * Splits one released milestone into the four buckets that Indian marketplace
 * payouts need. All arithmetic stays in paise integers.
 *
 * - `commissionPaise`      platform fee, deducted from the gross milestone amount
 * - `gstOnCommissionPaise` GST the platform charges the client on top of its fee
 * - `tdsPaise`             tax withheld at source on the freelancer's payout
 * - `payoutPaise`          what actually reaches the freelancer's UPI/bank
 *
 * The freelancer's payout is rounded last and absorbs any rounding remainder,
 * so `payoutPaise + commissionPaise + tdsPaise === grossPaise` always holds.
 */
export interface ReleaseBreakdown {
  grossPaise: number;
  commissionPaise: number;
  gstOnCommissionPaise: number;
  tdsPaise: number;
  payoutPaise: number;
}

export interface ReleaseRates {
  /** Platform commission in basis points. */
  commissionBps: number;
  /** GST on the platform commission in basis points. */
  gstBps: number;
  /** TDS in basis points, e.g. 1000 for Section 194J. */
  tdsBps: number;
}

export function computeReleaseBreakdown(
  grossPaise: number,
  rates: ReleaseRates,
): ReleaseBreakdown {
  assertPaise(grossPaise, "grossPaise");

  const commissionPaise = applyBps(grossPaise, rates.commissionBps);
  const gstOnCommissionPaise = applyBps(commissionPaise, rates.gstBps);

  // TDS applies to what the platform pays the freelancer (gross less our fee).
  const taxablePaise = grossPaise - commissionPaise;
  const tdsPaise = applyBps(taxablePaise, rates.tdsBps);

  return {
    grossPaise,
    commissionPaise,
    gstOnCommissionPaise,
    tdsPaise,
    payoutPaise: grossPaise - commissionPaise - tdsPaise,
  };
}
