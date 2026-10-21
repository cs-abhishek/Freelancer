import type {
  BudgetType,
  FreelancerTier,
  PreferredTier,
  VerificationStatus,
} from "@prisma/client";

/**
 * Demo content for the public marketing surfaces.
 *
 * The marketplace shell has to look populated before a single project is in the
 * database, so the landing feed and the talent directory read from these typed
 * fixtures rather than from Prisma. Amounts stay in paise, exactly like real
 * rows, so the same formatters work on both.
 */

/** Skill chips shown above the job feed. */
export const SKILL_FILTERS = [
  "React",
  "Python",
  "UI/UX",
  "Video Editing",
  "App Dev",
  "Flutter",
  "AI/ML",
] as const;
export type SkillFilter = (typeof SKILL_FILTERS)[number];

export interface MockProject {
  id: string;
  title: string;
  summary: string;
  category: string;
  skills: string[];
  budgetType: BudgetType;
  budgetMinPaise: number;
  budgetMaxPaise: number;
  preferredTier: PreferredTier;
  proposalCount: number;
  postedLabel: string;
  clientName: string;
  clientCity: string;
  escrowVerified: boolean;
  gstInvoice: boolean;
}

export const MOCK_PROJECTS: readonly MockProject[] = [
  {
    id: "mp_razorpay_checkout",
    title: "Build a Razorpay checkout flow for our D2C store",
    summary:
      "Need a developer to wire Razorpay orders, webhooks and refunds into an existing Next.js storefront. Existing design is ready.",
    category: "Web Development",
    skills: ["React", "Node.js", "Razorpay"],
    budgetType: "FIXED",
    budgetMinPaise: 2_500_000,
    budgetMaxPaise: 4_500_000,
    preferredTier: "ANY",
    proposalCount: 12,
    postedLabel: "2 hours ago",
    clientName: "Sharma Naturals",
    clientCity: "Jaipur",
    escrowVerified: true,
    gstInvoice: true,
  },
  {
    id: "mp_fintech_onboarding",
    title: "Redesign the onboarding screens for our fintech app",
    summary:
      "11 screens, KYC step included. Want an end-to-end redesign plus a Figma design system we can hand to engineering.",
    category: "UI/UX Design",
    skills: ["Figma", "UI/UX", "Design System"],
    budgetType: "FIXED",
    budgetMinPaise: 3_000_000,
    budgetMaxPaise: 6_000_000,
    preferredTier: "PRO_ONLY",
    proposalCount: 7,
    postedLabel: "5 hours ago",
    clientName: "Paycircle",
    clientCity: "Bengaluru",
    escrowVerified: true,
    gstInvoice: true,
  },
  {
    id: "mp_gst_reconciliation",
    title: "Python data pipeline for GST invoice reconciliation",
    summary:
      "Monthly GSTR-2B reconciliation currently takes our CA four days. Looking for a script that ingests portals exports and flags mismatches.",
    category: "Data & Analytics",
    skills: ["Python", "Pandas", "PostgreSQL"],
    budgetType: "FIXED",
    budgetMinPaise: 4_000_000,
    budgetMaxPaise: 8_000_000,
    preferredTier: "ANY",
    proposalCount: 4,
    postedLabel: "Yesterday",
    clientName: "LedgerKart",
    clientCity: "Pune",
    escrowVerified: true,
    gstInvoice: false,
  },
  {
    id: "mp_reels_editor",
    title: "Edit 20 short-form reels a month for our skincare brand",
    summary:
      "Ongoing work. Raw footage arrives weekly; we need hooks, captions and thumbnails in an Indian D2C tone of voice.",
    category: "Video & Animation",
    skills: ["Video Editing", "Premiere Pro", "After Effects"],
    budgetType: "HOURLY",
    budgetMinPaise: 60_000,
    budgetMaxPaise: 120_000,
    preferredTier: "STUDENT_ONLY",
    proposalCount: 31,
    postedLabel: "1 day ago",
    clientName: "GlowRoute",
    clientCity: "Mumbai",
    escrowVerified: true,
    gstInvoice: false,
  },
  {
    id: "mp_attendance_app",
    title: "Flutter app for a college attendance tracker",
    summary:
      "Offline-first attendance app with a biometric check-in and a faculty dashboard. College pilot starts next semester.",
    category: "Mobile Development",
    skills: ["Flutter", "App Development", "Firebase"],
    budgetType: "FIXED",
    budgetMinPaise: 1_500_000,
    budgetMaxPaise: 3_000_000,
    preferredTier: "STUDENT_ONLY",
    proposalCount: 24,
    postedLabel: "3 hours ago",
    clientName: "Vidyalaya Labs",
    clientCity: "Coimbatore",
    escrowVerified: false,
    gstInvoice: false,
  },
  {
    id: "mp_logistics_dashboard",
    title: "React dashboard for a logistics control tower",
    summary:
      "Live shipment view over our existing REST API: filters, exception queue and a daily dispatch summary. TypeScript required.",
    category: "Web Development",
    skills: ["React", "TypeScript", "Tailwind CSS"],
    budgetType: "FIXED",
    budgetMinPaise: 6_000_000,
    budgetMaxPaise: 12_000_000,
    preferredTier: "PRO_ONLY",
    proposalCount: 6,
    postedLabel: "6 hours ago",
    clientName: "FleetMile",
    clientCity: "Gurugram",
    escrowVerified: true,
    gstInvoice: true,
  },
  {
    id: "mp_resume_model",
    title: "Train a resume-parsing model on 5,000 PDFs",
    summary:
      "Extract skills, employers and tenure from Indian-format resumes. Labeled sample provided; evaluation set already built.",
    category: "AI & Machine Learning",
    skills: ["Python", "NLP", "PyTorch"],
    budgetType: "FIXED",
    budgetMinPaise: 8_000_000,
    budgetMaxPaise: 15_000_000,
    preferredTier: "PRO_ONLY",
    proposalCount: 3,
    postedLabel: "12 hours ago",
    clientName: "HireSense",
    clientCity: "Hyderabad",
    escrowVerified: true,
    gstInvoice: true,
  },
  {
    id: "mp_campus_fest_brand",
    title: "Landing page and brand kit for our campus fest",
    summary:
      "Sponsor-facing landing page, poster templates and a social kit. Fast turnaround — the fest goes live in three weeks.",
    category: "Graphic Design",
    skills: ["Figma", "Branding", "Canva"],
    budgetType: "FIXED",
    budgetMinPaise: 800_000,
    budgetMaxPaise: 1_500_000,
    preferredTier: "STUDENT_ONLY",
    proposalCount: 18,
    postedLabel: "4 hours ago",
    clientName: "Fest Committee",
    clientCity: "Mumbai",
    escrowVerified: false,
    gstInvoice: false,
  },
  {
    id: "mp_k8s_migration",
    title: "Kubernetes migration for our payments API",
    summary:
      "Move 9 services off a single VM onto EKS with autoscaling, secrets management and a staging environment.",
    category: "DevOps & Cloud",
    skills: ["Kubernetes", "AWS", "Terraform"],
    budgetType: "HOURLY",
    budgetMinPaise: 150_000,
    budgetMaxPaise: 250_000,
    preferredTier: "PRO_ONLY",
    proposalCount: 5,
    postedLabel: "1 day ago",
    clientName: "Stackfleet",
    clientCity: "Noida",
    escrowVerified: true,
    gstInvoice: true,
  },
  {
    id: "mp_ayurveda_content",
    title: "SEO and content plan for a D2C ayurveda brand",
    summary:
      "Keyword research, a three-month editorial calendar and 12 pillar articles aimed at Indian search intent.",
    category: "Digital Marketing",
    skills: ["SEO", "Content Writing", "Analytics"],
    budgetType: "FIXED",
    budgetMinPaise: 2_000_000,
    budgetMaxPaise: 3_500_000,
    preferredTier: "ANY",
    proposalCount: 9,
    postedLabel: "2 days ago",
    clientName: "HerbCraft",
    clientCity: "Ahmedabad",
    escrowVerified: true,
    gstInvoice: false,
  },
];

export interface MockTalent {
  id: string;
  name: string;
  tier: FreelancerTier;
  verificationStatus: VerificationStatus;
  headline: string;
  skills: string[];
  hourlyRatePaise: number;
  /** Average rating in tenths (48 renders as 4.8) so no float is ever stored. */
  ratingTenths: number;
  ratingCount: number;
  completedProjects: number;
  /** College for campus talent, employer for working professionals. */
  affiliation: string;
  city: string;
}

export const MOCK_TALENT: readonly MockTalent[] = [
  {
    id: "mt_ananya",
    name: "Ananya Iyer",
    tier: "CAMPUS_TALENT",
    verificationStatus: "VERIFIED",
    headline: "Final-year CS student shipping production React dashboards",
    skills: ["React", "TypeScript", "Tailwind CSS"],
    hourlyRatePaise: 45_000,
    ratingTenths: 48,
    ratingCount: 26,
    completedProjects: 14,
    affiliation: "VIT Vellore",
    city: "Chennai",
  },
  {
    id: "mt_rohit",
    name: "Rohit Deshmukh",
    tier: "WORKING_PROFESSIONAL",
    verificationStatus: "VERIFIED",
    headline: "Ex-Razorpay backend engineer, payments and webhooks",
    skills: ["Node.js", "PostgreSQL", "Razorpay"],
    hourlyRatePaise: 180_000,
    ratingTenths: 49,
    ratingCount: 63,
    completedProjects: 51,
    affiliation: "Fintech, 7 yrs",
    city: "Pune",
  },
  {
    id: "mt_meera",
    name: "Meera Nair",
    tier: "CAMPUS_TALENT",
    verificationStatus: "VERIFIED",
    headline: "Design student — UI/UX, design systems, Figma libraries",
    skills: ["Figma", "UI/UX", "Design System"],
    hourlyRatePaise: 40_000,
    ratingTenths: 47,
    ratingCount: 19,
    completedProjects: 11,
    affiliation: "NID Ahmedabad",
    city: "Kochi",
  },
  {
    id: "mt_karthik",
    name: "Karthik Reddy",
    tier: "CAMPUS_TALENT",
    verificationStatus: "PENDING",
    headline: "Flutter developer building offline-first campus apps",
    skills: ["Flutter", "App Development", "Firebase"],
    hourlyRatePaise: 35_000,
    ratingTenths: 45,
    ratingCount: 8,
    completedProjects: 5,
    affiliation: "IIIT Hyderabad",
    city: "Hyderabad",
  },
  {
    id: "mt_simran",
    name: "Simran Kaur",
    tier: "WORKING_PROFESSIONAL",
    verificationStatus: "VERIFIED",
    headline: "Short-form video editor for D2C and creator brands",
    skills: ["Video Editing", "Premiere Pro", "After Effects"],
    hourlyRatePaise: 90_000,
    ratingTenths: 49,
    ratingCount: 74,
    completedProjects: 88,
    affiliation: "Freelance, 5 yrs",
    city: "Chandigarh",
  },
  {
    id: "mt_arjun",
    name: "Arjun Menon",
    tier: "WORKING_PROFESSIONAL",
    verificationStatus: "VERIFIED",
    headline: "Data engineer — Python pipelines, GST and finance data",
    skills: ["Python", "Pandas", "PostgreSQL"],
    hourlyRatePaise: 150_000,
    ratingTenths: 48,
    ratingCount: 41,
    completedProjects: 33,
    affiliation: "Analytics, 6 yrs",
    city: "Bengaluru",
  },
];
