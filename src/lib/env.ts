import { z } from "zod";

/**
 * Runtime validation of environment variables.
 *
 * Only the values that the app genuinely cannot boot without are required.
 * Optional integrations (OAuth, SMTP, Razorpay) are validated for shape but
 * may be absent, so the scaffold runs with nothing but a database and a secret.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // --- Database ---
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // --- Auth.js ---
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
  AUTH_URL: z.string().optional(),
  AUTH_TRUST_HOST: z.string().optional(),

  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  AUTH_GITHUB_ID: z.string().optional(),
  AUTH_GITHUB_SECRET: z.string().optional(),

  EMAIL_SERVER: z.string().optional(),
  EMAIL_FROM: z.string().optional(),

  // --- Payments ---
  PAYMENT_PROVIDER: z.enum(["mock", "razorpay"]).default("mock"),
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  RAZORPAY_ACCOUNT_NUMBER: z.string().optional(),

  // --- Marketplace economics ---
  PLATFORM_COMMISSION_BPS: z.coerce.number().int().min(0).max(10_000).default(1000),
});

export type Env = z.infer<typeof envSchema>;

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("\n");
  throw new Error(
    `Invalid environment configuration:\n${issues}\n\nCopy .env.example to .env and fill in the values.`,
  );
}

export const env: Env = parsed.data;

/** True when Google OAuth credentials are present. */
export const hasGoogleOAuth = Boolean(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET);
/** True when GitHub OAuth credentials are present. */
export const hasGitHubOAuth = Boolean(env.AUTH_GITHUB_ID && env.AUTH_GITHUB_SECRET);
/** True when an SMTP server is configured for magic-link emails. */
export const hasEmailProvider = Boolean(env.EMAIL_SERVER && env.EMAIL_FROM);
