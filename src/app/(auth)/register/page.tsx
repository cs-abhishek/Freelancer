import type { Metadata } from "next";
import { Building2, GraduationCap } from "lucide-react";
import Link from "next/link";

import { OtpSignInForm } from "@/components/forms/otp-sign-in-form";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <div className="glass-panel flex flex-col gap-5 rounded-2xl p-6">
      <div className="flex flex-col gap-2.5">
        <Badge variant="campus" className="h-6 w-fit px-2.5">
          <GraduationCap />
          Campus talent pays 5%
        </Badge>
        <h1 className="font-heading text-xl font-semibold tracking-tight">Create an account</h1>
        <p className="text-sm text-muted-foreground">
          Verify your mobile number to start. You choose whether you are hiring or freelancing on
          the next screen.
        </p>
      </div>

      <OtpSignInForm />

      <ul className="flex flex-col gap-2 border-t border-border/60 pt-4 text-xs text-muted-foreground">
        <li className="flex items-start gap-2">
          <GraduationCap className="mt-0.5 size-3.5 shrink-0 text-violet-500" />
          Freelancers verify as Campus Talent or as a Working Professional.
        </li>
        <li className="flex items-start gap-2">
          <Building2 className="mt-0.5 size-3.5 shrink-0 text-indigo-500" />
          Clients add company and GST billing details during onboarding.
        </li>
      </ul>

      <p className="text-xs text-muted-foreground">
        Already registered?{" "}
        <Link href={ROUTES.login} className="font-medium text-primary underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </div>
  );
}
