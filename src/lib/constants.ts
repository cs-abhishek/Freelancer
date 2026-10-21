/**
 * Application-wide constants that are not derived from the database schema.
 */

export const APP_NAME = "Freelancer";
export const APP_TAGLINE = "India's zero-friction freelance marketplace";
export const CURRENCY = "INR";
export const CURRENCY_SYMBOL = "\u20B9";
export const LOCALE = "en-IN";
export const DEFAULT_TIMEZONE = "Asia/Kolkata";

/** Default platform commission in basis points (1000 bps = 10%). */
export const DEFAULT_COMMISSION_BPS = 1000;

/**
 * Discounted commission for Verified Campus Talent (500 bps = 5%). The
 * marketplace's acquisition wedge is students, so their first engagements are
 * priced at half the standard take rate.
 */
export const CAMPUS_COMMISSION_BPS = 500;

/** Default TDS rate for professional / technical services, Section 194J (1000 bps = 10%). */
export const DEFAULT_TDS_BPS = 1000;

/** GST charged on the platform's own commission (1800 bps = 18%). */
export const GST_ON_COMMISSION_BPS = 1800;

/**
 * TDS sections relevant to Indian freelance payouts.
 * @see https://incometaxindia.gov.in
 */
export const TDS_SECTIONS = {
  /** Professional / technical services. */
  SECTION_194J: "194J",
  /** Payments to contractors. */
  SECTION_194C: "194C",
} as const;
export type TdsSection = (typeof TDS_SECTIONS)[keyof typeof TDS_SECTIONS];

/** Common GST slabs in basis points (1800 bps = 18%). */
export const GST_RATES_BPS = [0, 500, 1200, 1800, 2800] as const;

/** Length of the phone OTP we issue. */
export const OTP_LENGTH = 6;
/** How long an OTP stays valid. */
export const OTP_TTL_SECONDS = 300;

/**
 * Proposals a freelancer may send per calendar month before the marketplace
 * asks them to upgrade. Surfaced on the freelancer dashboard as "proposals left".
 */
export const MONTHLY_FREE_PROPOSALS = 15;

/** Route prefixes used for RBAC redirects. */
export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
  clientDashboard: "/client/dashboard",
  freelancerDashboard: "/freelancer/dashboard",
  projects: "/projects",
  projectNew: "/projects/new",
  gigs: "/gigs",
  bids: "/bids",
  escrow: "/escrow",
  settings: "/settings",
  onboarding: "/onboarding",
  /// Public marketing surfaces.
  talent: "/talent",
  campus: "/campus",
  whyEscrow: "/why-escrow",
} as const;

/** Accepted academic email suffixes for Verified Campus Talent. */
export const CAMPUS_EMAIL_SUFFIXES = [".edu.in", ".ac.in", ".edu", ".ac"] as const;

/** Job categories offered on the marketplace. */
export const PROJECT_CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Graphic Design",
  "Content Writing",
  "Digital Marketing",
  "Data & Analytics",
  "DevOps & Cloud",
  "Video & Animation",
  "AI & Machine Learning",
] as const;
export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];
