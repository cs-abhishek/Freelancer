"use server";

import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { type ActionState, actionError, actionSuccess, toFieldErrors } from "@/lib/action-state";
import { signIn, signOut } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";
import { env, hasDemoLogin, hasGitHubOAuth, hasGoogleOAuth } from "@/lib/env";
import { rupeesToPaise } from "@/lib/money";
import { requireRole, requireUser } from "@/lib/dal";
import {
  clientOnboardingSchema,
  freelancerOnboardingSchema,
  kycReviewSchema,
  otpRequestSchema,
  otpVerifySchema,
} from "@/lib/validators/auth";
import { issueOtp, sendOtp } from "@/server/auth/otp";
import { prisma } from "@/server/db/client";

/** Empty optional text inputs arrive as `""`; the database wants `null`. */
function orNull(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function orNullInt(value: string | undefined): number | null {
  const trimmed = value?.trim();
  return trimmed ? Number.parseInt(trimmed, 10) : null;
}

/* ---------------------------------- OTP ----------------------------------- */

export async function requestOtpAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = otpRequestSchema.safeParse({ phone: formData.get("phone") });

  if (!parsed.success) {
    return actionError("Enter a valid mobile number.", toFieldErrors(parsed.error));
  }

  const { phone, code } = await issueOtp(parsed.data.phone);
  await sendOtp(phone, code);

  // No SMS gateway is configured in development (`sendOtp` logs instead), so
  // the code is surfaced here to keep the flow testable. Never in production.
  const message =
    env.NODE_ENV === "production"
      ? `We sent a 6-digit code to ${phone}.`
      : `Dev mode: no SMS gateway configured. Your code is ${code}.`;

  return actionSuccess(message);
}

export async function signInWithOtpAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = otpVerifySchema.safeParse({
    phone: formData.get("phone"),
    code: formData.get("code"),
  });

  if (!parsed.success) {
    return actionError("Check the code you entered.", toFieldErrors(parsed.error));
  }

  try {
    await signIn("phone-otp", {
      phone: parsed.data.phone,
      code: parsed.data.code,
      redirectTo: ROUTES.dashboard,
    });
  } catch (error) {
    // `signIn` signals a successful redirect by throwing NEXT_REDIRECT, so only
    // genuine auth failures may be swallowed here. Credentials providers report
    // a bad code as a `CredentialsSignin` error.
    if (error instanceof AuthError) {
      return actionError("That code is invalid or has expired. Request a new one.");
    }
    throw error;
  }

  return actionSuccess();
}

export async function signInWithDemoAction(formData: FormData): Promise<void> {
  if (!hasDemoLogin) {
    redirect(ROUTES.login);
  }

  try {
    await signIn("demo-login", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: ROUTES.dashboard,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`${ROUTES.login}?error=demo`);
    }
    throw error;
  }
}

/**
 * Starts an OAuth sign-in. The providers are only registered when their
 * credentials are present, so the buttons that call this are conditional too.
 */
export async function signInWithProviderAction(formData: FormData): Promise<void> {
  const provider = String(formData.get("provider") ?? "");

  if (provider === "google" && hasGoogleOAuth) {
    await signIn("google", { redirectTo: ROUTES.dashboard });
    return;
  }

  if (provider === "github" && hasGitHubOAuth) {
    await signIn("github", { redirectTo: ROUTES.dashboard });
    return;
  }

  redirect(ROUTES.login);
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: ROUTES.home });
}

/* ------------------------------- onboarding ------------------------------- */

export async function completeFreelancerOnboardingAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = freelancerOnboardingSchema.safeParse({
    tier: formData.get("tier"),
    headline: formData.get("headline"),
    bio: formData.get("bio") ?? undefined,
    city: formData.get("city") ?? undefined,
    skills: formData.getAll("skills"),
    hourlyRateRupees: formData.get("hourlyRateRupees") ?? undefined,
    collegeName: formData.get("collegeName") ?? undefined,
    graduationYear: formData.get("graduationYear") ?? undefined,
    campusEmail: formData.get("campusEmail") ?? undefined,
    yearsExperience: formData.get("yearsExperience") ?? undefined,
    currentEmployer: formData.get("currentEmployer") ?? undefined,
    upiId: formData.get("upiId") ?? undefined,
    panNumber: formData.get("panNumber") ?? undefined,
  });

  if (!parsed.success) {
    return actionError("Please fix the highlighted fields.", toFieldErrors(parsed.error));
  }

  const data = parsed.data;
  const hourlyRateRupees = data.hourlyRateRupees?.trim();
  const panNumber = orNull(data.panNumber);
  const campusEmail = orNull(data.campusEmail);

  await prisma.$transaction(async (tx) => {
    // Onboarding is where a user picks a side of the marketplace, so the role
    // is set here rather than trusted from the sign-in payload.
    await tx.user.update({
      where: { id: user.id },
      data: { role: "FREELANCER" },
    });

    await tx.freelancerProfile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        tier: data.tier,
        headline: data.headline,
        bio: orNull(data.bio),
        city: orNull(data.city),
        skills: data.skills,
        hourlyRatePaise: hourlyRateRupees ? rupeesToPaise(Number(hourlyRateRupees)) : null,
        collegeName: orNull(data.collegeName),
        graduationYear: orNullInt(data.graduationYear),
        campusEmail,
        yearsExperience: orNullInt(data.yearsExperience),
        currentEmployer: orNull(data.currentEmployer),
        upiId: orNull(data.upiId),
        verificationStatus: "PENDING",
      },
      update: {
        tier: data.tier,
        headline: data.headline,
        bio: orNull(data.bio),
        city: orNull(data.city),
        skills: data.skills,
        hourlyRatePaise: hourlyRateRupees ? rupeesToPaise(Number(hourlyRateRupees)) : null,
        collegeName: orNull(data.collegeName),
        graduationYear: orNullInt(data.graduationYear),
        campusEmail,
        yearsExperience: orNullInt(data.yearsExperience),
        currentEmployer: orNull(data.currentEmployer),
        upiId: orNull(data.upiId),
      },
    });

    // Submitted proofs go to the admin review queue.
    if (campusEmail) {
      await tx.kycDocument.create({
        data: { userId: user.id, type: "STUDENT_EMAIL", documentNumber: campusEmail },
      });
    }

    if (panNumber) {
      await tx.kycDocument.create({
        data: { userId: user.id, type: "PAN", documentNumber: panNumber },
      });
    }
  });

  revalidatePath(ROUTES.dashboard);
  revalidatePath(ROUTES.settings);

  return actionSuccess("Profile submitted for verification.");
}

export async function completeClientOnboardingAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = clientOnboardingSchema.safeParse({
    companyName: formData.get("companyName") ?? undefined,
    companyType: formData.get("companyType"),
    gstin: formData.get("gstin") ?? undefined,
    billingName: formData.get("billingName") ?? undefined,
    billingAddress: formData.get("billingAddress") ?? undefined,
    billingCity: formData.get("billingCity") ?? undefined,
    billingState: formData.get("billingState") ?? undefined,
    billingPincode: formData.get("billingPincode") ?? undefined,
    placeOfSupply: formData.get("placeOfSupply") ?? undefined,
  });

  if (!parsed.success) {
    return actionError("Please fix the highlighted fields.", toFieldErrors(parsed.error));
  }

  const data = parsed.data;

  const profile = {
    companyName: orNull(data.companyName),
    companyType: data.companyType,
    gstin: orNull(data.gstin),
    billingName: orNull(data.billingName),
    billingAddress: orNull(data.billingAddress),
    billingCity: orNull(data.billingCity),
    billingState: orNull(data.billingState),
    billingPincode: orNull(data.billingPincode),
    placeOfSupply: orNull(data.placeOfSupply),
  };

  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { role: "CLIENT" } }),
    prisma.clientProfile.upsert({
      where: { userId: user.id },
      create: { userId: user.id, ...profile },
      update: profile,
    }),
  ]);

  revalidatePath(ROUTES.dashboard);
  revalidatePath(ROUTES.settings);

  return actionSuccess("Billing details saved.");
}

/* ------------------------------- kyc review ------------------------------- */

export async function reviewKycDocumentAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireRole("ADMIN");

  const parsed = kycReviewSchema.safeParse({
    documentId: formData.get("documentId"),
    status: formData.get("status"),
    note: formData.get("note") ?? undefined,
  });

  if (!parsed.success) {
    return actionError("Choose an outcome.", toFieldErrors(parsed.error));
  }

  const { documentId, status, note } = parsed.data;

  const document = await prisma.kycDocument.update({
    where: { id: documentId },
    data: {
      status,
      reviewNote: orNull(note),
      reviewedById: admin.id,
      reviewedAt: new Date(),
    },
  });

  // A verified document proves the freelancer's tier, so the profile follows.
  if (status === "VERIFIED") {
    await prisma.freelancerProfile.updateMany({
      where: { userId: document.userId },
      data: { verificationStatus: "VERIFIED", verifiedAt: new Date() },
    });
  }

  revalidatePath("/admin/kyc");

  return actionSuccess("Review saved.");
}
