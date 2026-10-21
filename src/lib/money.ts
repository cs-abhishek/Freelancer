/**
 * Money utilities.
 *
 * Every monetary value in this application is an integer count of **paise**
 * (1 INR = 100 paise). Floats are never used for money, so that escrow,
 * commission and refund arithmetic stays exact.
 */

/** Number of paise in one rupee. */
export const PAISE_PER_RUPEE = 100;

/**
 * Prisma maps `Int` to a signed 32-bit Postgres integer, so a single monetary
 * column tops out at ~Rs 2.14 crore. `assertPaise` enforces this at the
 * boundary instead of letting the database throw an opaque overflow error.
 */
export const MAX_PAISE = 2_147_483_647;

/** Currency used across the marketplace. */
export const CURRENCY = "INR";

/** True when `value` is a safe, in-range integer number of paise. */
export function isValidPaise(value: number): boolean {
  return (
    Number.isInteger(value) && value >= -MAX_PAISE && value <= MAX_PAISE
  );
}

/** Throws when `value` is not a safe integer number of paise. */
export function assertPaise(value: number, label = "amount"): number {
  if (!isValidPaise(value)) {
    throw new RangeError(
      `${label} must be a whole number of paise between 0 and ${MAX_PAISE} (received ${value}).`,
    );
  }
  return value;
}

/**
 * Converts a rupee amount to paise.
 * Uses rounding to absorb the float error inherent in rupee literals
 * (e.g. `499.99 * 100 === 49998.999999999993`).
 */
export function rupeesToPaise(rupees: number): number {
  if (!Number.isFinite(rupees)) {
    throw new TypeError(`Cannot convert non-finite rupee value: ${rupees}`);
  }
  return Math.round(rupees * PAISE_PER_RUPEE);
}

/** Converts paise to a rupee number. Prefer `formatINR` for display. */
export function paiseToRupees(paise: number): number {
  return paise / PAISE_PER_RUPEE;
}

/** Formats paise as a human-readable INR string, e.g. `Rs 1,25,000.50`. */
export function formatINR(paise: number, options?: { showPaise?: boolean }): string {
  const showPaise = options?.showPaise ?? paise % PAISE_PER_RUPEE !== 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: showPaise ? 2 : 0,
    maximumFractionDigits: showPaise ? 2 : 0,
  }).format(paiseToRupees(paise));
}

/** Applies a basis-point rate to paise. 100 bps = 1.00%. */
export function applyBps(amountPaise: number, bps: number): number {
  assertPaise(amountPaise);
  if (!Number.isInteger(bps) || bps < 0 || bps > 10_000) {
    throw new RangeError(`bps must be an integer between 0 and 10000 (received ${bps}).`);
  }
  return Math.round((amountPaise * bps) / 10_000);
}

export interface CommissionBreakdown {
  /** What the client is charged, in paise. */
  grossPaise: number;
  /** Platform commission, in paise. */
  commissionPaise: number;
  /** What the freelancer receives, in paise. */
  netPaise: number;
}

/**
 * Splits a gross escrow amount into platform commission and freelancer payout.
 * Rounding is applied to the commission; the freelancer keeps the remainder so
 * that `commissionPaise + netPaise === grossPaise` always holds.
 */
export function splitCommission(grossPaise: number, commissionBps: number): CommissionBreakdown {
  assertPaise(grossPaise, "grossPaise");
  const commissionPaise = applyBps(grossPaise, commissionBps);
  return {
    grossPaise,
    commissionPaise,
    netPaise: grossPaise - commissionPaise,
  };
}
