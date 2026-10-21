import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

import { signInWithProviderAction } from "@/actions/auth";
import { OtpSignInForm } from "@/components/forms/otp-sign-in-form";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { hasGitHubOAuth, hasGoogleOAuth } from "@/lib/env";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="glass-panel flex flex-col gap-5 rounded-2xl p-6">
      <div className="flex flex-col gap-2.5">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[0.7rem] font-semibold text-emerald-700 dark:text-emerald-300">
          <ShieldCheck className="size-3.5" />
          UPI escrow verified
        </span>
        <h1 className="font-heading text-xl font-semibold tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          Enter your mobile number and we will send a one-time code.
        </p>
      </div>

      <OtpSignInForm />

      {hasGoogleOAuth || hasGitHubOAuth ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-[0.65rem] tracking-wider text-muted-foreground uppercase">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          {hasGoogleOAuth ? (
            <form action={signInWithProviderAction}>
              <input type="hidden" name="provider" value="google" />
              <Button type="submit" variant="outline" className="h-11 w-full rounded-xl">
                Continue with Google
              </Button>
            </form>
          ) : null}

          {hasGitHubOAuth ? (
            <form action={signInWithProviderAction}>
              <input type="hidden" name="provider" value="github" />
              <Button type="submit" variant="outline" className="h-11 w-full rounded-xl">
                Continue with GitHub
              </Button>
            </form>
          ) : null}
        </div>
      ) : null}

      <p className="text-xs text-muted-foreground">
        No account yet?{" "}
        <Link
          href={ROUTES.register}
          className="font-medium text-primary underline underline-offset-4"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
