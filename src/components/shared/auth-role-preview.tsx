"use client";

import { Building2, type LucideIcon, Rocket, ShieldCheck } from "lucide-react";
import { useState } from "react";

type RoleKey = "freelancer" | "client";

interface RolePreview {
  key: RoleKey;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  blurb: string;
  benefits: readonly string[];
  active: string;
  idle: string;
  tile: string;
}

/**
 * The two sides of the marketplace, previewed on the auth canvas. Selecting a
 * card reveals what that side actually gets, so a visitor knows which door they
 * are walking through before they hand over a phone number.
 */
const ROLE_PREVIEWS: readonly RolePreview[] = [
  {
    key: "freelancer",
    icon: Rocket,
    eyebrow: "For freelancers",
    title: "Paid the same day, in rupees",
    blurb: "Escrow is funded before you start, and approved milestones settle straight to UPI.",
    benefits: [
      "5% commission for verified campus talent",
      "Instant UPI payout with zero forex fees",
      "Client money visibly locked before work begins",
    ],
    active: "border-violet-500/40 bg-violet-500/10 ring-1 ring-violet-500/30",
    idle: "border-border/70 bg-background/50 hover:border-violet-500/30",
    tile: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
  },
  {
    key: "client",
    icon: Building2,
    eyebrow: "For clients",
    title: "Never chase a refund again",
    blurb: "Your money sits in INR escrow until you approve each deliverable, then the paperwork files itself.",
    benefits: [
      "100% milestone safety inside Indian escrow",
      "Automatic GST invoices and TDS deduction",
      "Verified IIT/NIT students and senior professionals",
    ],
    active: "border-indigo-500/40 bg-indigo-500/10 ring-1 ring-indigo-500/30",
    idle: "border-border/70 bg-background/50 hover:border-indigo-500/30",
    tile: "bg-indigo-500/15 text-indigo-600 dark:text-indigo-300",
  },
];

export function AuthRolePreview() {
  const [selected, setSelected] = useState<RoleKey>("freelancer");

  return (
    <div className="flex flex-col gap-3">
      {ROLE_PREVIEWS.map((role) => {
        const isSelected = role.key === selected;
        const Icon = role.icon;

        return (
          <button
            key={role.key}
            type="button"
            aria-pressed={isSelected}
            onClick={() => setSelected(role.key)}
            className={`flex flex-col gap-3 rounded-2xl border p-4 text-left backdrop-blur-md transition-all duration-300 ${
              isSelected ? role.active : role.idle
            }`}
          >
            <div className="flex items-start gap-3">
              <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl ${role.tile}`}>
                <Icon className="size-4" />
              </span>
              <div className="flex flex-col gap-0.5">
                <span className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground uppercase">
                  {role.eyebrow}
                </span>
                <span className="font-heading text-sm font-semibold">{role.title}</span>
                <span className="text-xs text-muted-foreground">{role.blurb}</span>
              </div>
            </div>

            <ul className="flex flex-col gap-1.5">
              {role.benefits.map((benefit) => (
                <li
                  key={benefit}
                  className={`flex items-start gap-2 text-xs text-muted-foreground transition-opacity duration-300 ${
                    isSelected ? "opacity-100" : "opacity-50"
                  }`}
                >
                  <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                  {benefit}
                </li>
              ))}
            </ul>
          </button>
        );
      })}
    </div>
  );
}
