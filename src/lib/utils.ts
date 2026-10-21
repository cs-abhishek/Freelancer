import { formatDistanceToNow } from "date-fns";

export { cn } from "cn";

/**
 * `formatINR` lives in `money.ts`, which owns everything about paise. It is
 * re-exported here so components can import their formatters from one module.
 */
export { formatINR } from "@/lib/money";

/** "3 days ago" for feeds. Falls back to the date when the value is unusable. */
export function timeAgo(value: Date | string | number, now = new Date()): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "just now";

  return formatDistanceToNow(date, { addSuffix: true, includeSeconds: false });
}

/** Truncates to a whole-word preview for card layouts. */
export function excerpt(value: string, maxLength = 160): string {
  const text = value.trim();
  if (text.length <= maxLength) return text;

  const cut = text.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(" ");
  return `${lastSpace > 0 ? cut.slice(0, lastSpace) : cut}...`;
}

/**
 * URL segment for a project title. Kept deterministic and ASCII-only so links
 * stay stable across locales.
 */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}
