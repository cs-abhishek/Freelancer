"use client";

import { ArrowRight, CheckCircle2, Phone } from "lucide-react";
import { type KeyboardEvent, useActionState, useRef, useState } from "react";

import { requestOtpAction, signInWithOtpAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { IDLE_ACTION_STATE, type ActionState } from "@/lib/action-state";
import { OTP_LENGTH } from "@/lib/constants";

function fieldError(state: ActionState, field: string): string | undefined {
  return state.fieldErrors?.[field]?.[0];
}

const BOX_CLASS =
  "h-12 w-full min-w-0 rounded-xl border border-input bg-transparent text-center text-lg font-semibold outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50";

/**
 * Six single-character boxes backed by one hidden `code` field, so the Server
 * Action contract stays exactly as it was while the visitor gets the
 * paste-and-go OTP affordance they expect from a fintech app.
 */
function OtpCodeInput({ name, invalid }: { name: string; invalid?: boolean }) {
  const [digits, setDigits] = useState<string[]>(() => Array<string>(OTP_LENGTH).fill(""));
  const boxes = useRef<Array<HTMLInputElement | null>>([]);

  function focusAt(index: number) {
    const clamped = Math.min(Math.max(index, 0), OTP_LENGTH - 1);
    const node = boxes.current[clamped];
    node?.focus();
    node?.select();
  }

  /** Typing in one box advances; pasting a full code fills the remaining ones. */
  function handleChange(index: number, raw: string) {
    const cleaned = raw.replace(/\D/g, "");

    if (!cleaned) {
      setDigits((prev) => prev.map((digit, position) => (position === index ? "" : digit)));
      return;
    }

    const spread = cleaned.slice(0, OTP_LENGTH - index).split("");
    setDigits((prev) =>
      prev.map((digit, position) => {
        const offset = position - index;
        return offset >= 0 && offset < spread.length ? spread[offset] : digit;
      }),
    );
    focusAt(index + spread.length);
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index]) {
      event.preventDefault();
      setDigits((prev) => prev.map((digit, position) => (position === index - 1 ? "" : digit)));
      focusAt(index - 1);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusAt(index - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      focusAt(index + 1);
    }
  }

  return (
    <div className="flex items-center gap-2" role="group" aria-label={`${OTP_LENGTH}-digit code`}>
      <input type="hidden" name={name} value={digits.join("")} />
      {digits.map((digit, index) => (
        <input
          key={index}
          id={`${name}-${index}`}
          ref={(node) => {
            boxes.current[index] = node;
          }}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={OTP_LENGTH}
          value={digit}
          aria-label={`Digit ${index + 1}`}
          aria-invalid={invalid ? true : undefined}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          className={BOX_CLASS}
        />
      ))}
    </div>
  );
}

const INTENTS = [
  { key: "work", label: "I want to Work" },
  { key: "hire", label: "I want to Hire" },
] as const;
type Intent = (typeof INTENTS)[number]["key"];

/**
 * Two-step phone sign-in. The code request and the verification are separate
 * Server Actions, so both live in the same form and are attached to their own
 * submit button with `formAction`.
 */
export function OtpSignInForm() {
  const [intent, setIntent] = useState<Intent>("work");
  const [requestState, requestAction, isRequesting] = useActionState(
    requestOtpAction,
    IDLE_ACTION_STATE,
  );
  const [verifyState, verifyAction, isVerifying] = useActionState(
    signInWithOtpAction,
    IDLE_ACTION_STATE,
  );

  const phoneError = fieldError(requestState, "phone") ?? fieldError(verifyState, "phone");
  const codeError = fieldError(verifyState, "code");

  return (
    <form className="flex flex-col gap-5">
      <div
        role="group"
        aria-label="What do you want to do?"
        className="grid grid-cols-2 gap-1 rounded-xl border border-border/70 bg-muted/40 p-1"
      >
        {INTENTS.map((option) => {
          const isActive = option.key === intent;

          return (
            <button
              key={option.key}
              type="button"
              aria-pressed={isActive}
              onClick={() => setIntent(option.key)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                isActive
                  ? "bg-linear-to-r from-indigo-500 to-violet-600 text-white shadow-glow-brand"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Mobile number</Label>
        <div className="flex h-12 items-center overflow-hidden rounded-xl border border-input bg-transparent transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
          <span className="flex h-full shrink-0 items-center gap-1.5 border-r border-border bg-muted/40 px-3 text-sm font-medium">
            <span aria-hidden>🇮🇳</span>
            +91
          </span>
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="98765 43210"
            aria-invalid={phoneError ? true : undefined}
            required
            className="h-full w-full min-w-0 bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        {phoneError ? <p className="text-xs text-destructive">{phoneError}</p> : null}
      </div>

      <Button
        type="submit"
        formAction={requestAction}
        variant="outline"
        className="h-11 w-full rounded-xl"
        disabled={isRequesting}
      >
        <Phone />
        {isRequesting ? "Sending code..." : "Send 6-digit code"}
      </Button>

      <div className="flex flex-col gap-2">
        <Label htmlFor="code-0">6-digit code</Label>
        <OtpCodeInput name="code" invalid={Boolean(codeError)} />
        {codeError ? <p className="text-xs text-destructive">{codeError}</p> : null}
      </div>

      <Button
        type="submit"
        formAction={verifyAction}
        variant="brand"
        size="lg"
        className="h-11 w-full rounded-xl text-sm"
        disabled={isVerifying}
      >
        {isVerifying
          ? "Signing in..."
          : intent === "hire"
            ? "Verify and start hiring"
            : "Verify and start working"}
        <ArrowRight />
      </Button>

      {requestState.status === "success" && requestState.message ? (
        <p className="flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-700 dark:text-emerald-300">
          <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
          {requestState.message}
        </p>
      ) : null}

      {verifyState.status === "error" && verifyState.message ? (
        <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
          {verifyState.message}
        </p>
      ) : null}
    </form>
  );
}
