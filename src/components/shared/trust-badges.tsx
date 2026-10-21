import { BadgeCheck, Briefcase, FileText, GraduationCap, ShieldCheck } from "lucide-react";
import type { FreelancerTier, PreferredTier, VerificationStatus } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { PREFERRED_TIER_LABELS } from "@/lib/validators/projects";

/**
 * The trust vocabulary of the marketplace: what the buyer is protected by and
 * who the work is aimed at. Kept in one place so the landing feed, the public
 * cards and the dashboards all speak the same language.
 *
 * Badge variants are typed against the `Badge` primitive, which is why the map
 * below is `satisfies`-checked rather than free-form.
 */

const PREFERRED_TIER_BADGE = {
  ANY: { icon: ShieldCheck, variant: "open" },
  STUDENT_ONLY: { icon: GraduationCap, variant: "campus" },
  PRO_ONLY: { icon: Briefcase, variant: "senior" },
} as const satisfies Record<PreferredTier, { icon: typeof ShieldCheck; variant: string }>;

/** "Campus star friendly" / "Senior pro required" / "Open to all". */
export function PreferredTierBadge({ tier }: { tier: PreferredTier }) {
  const { icon: Icon, variant } = PREFERRED_TIER_BADGE[tier];

  return (
    <Badge variant={variant}>
      <Icon />
      {PREFERRED_TIER_LABELS[tier]}
    </Badge>
  );
}

/** Client-side money guarantees: escrow custody and a GST-compliant invoice. */
export function TrustBadges({
  escrowVerified,
  gstInvoice,
  className,
}: {
  escrowVerified: boolean;
  gstInvoice: boolean;
  className?: string;
}) {
  if (!escrowVerified && !gstInvoice) return null;

  return (
    <div className={className ?? "flex flex-wrap items-center gap-1.5"}>
      {escrowVerified ? (
        <Badge variant="money">
          <ShieldCheck />
          UPI escrow verified
        </Badge>
      ) : null}
      {gstInvoice ? (
        <Badge variant="invoice">
          <FileText />
          GST invoice available
        </Badge>
      ) : null}
    </div>
  );
}

const VERIFICATION_BADGE = {
  VERIFIED: { label: "Verified", variant: "money" },
  PENDING: { label: "Verification pending", variant: "secondary" },
  UNVERIFIED: { label: "Not verified yet", variant: "outline" },
  REJECTED: { label: "Verification rejected", variant: "destructive" },
} as const satisfies Record<VerificationStatus, { label: string; variant: string }>;

const TIER_LABEL: Record<FreelancerTier, string> = {
  CAMPUS_TALENT: "Campus talent",
  WORKING_PROFESSIONAL: "Working professional",
};

/** Tier plus KYC state, as one badge — the freelancer's headline trust signal. */
export function VerificationBadge({
  status,
  tier,
}: {
  status: VerificationStatus;
  tier?: FreelancerTier | null;
}) {
  const { label, variant } = VERIFICATION_BADGE[status];
  const text = tier ? `${label} · ${TIER_LABEL[tier]}` : label;

  return (
    <Badge variant={variant}>
      {status === "VERIFIED" ? <BadgeCheck /> : null}
      {text}
    </Badge>
  );
}
