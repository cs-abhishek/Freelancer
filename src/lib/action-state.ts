import { z } from "zod";

/**
 * The single result type every Server Action returns, so `useActionState` can
 * render both form-level and field-level errors without `any`.
 */
export interface ActionState {
  status: "idle" | "success" | "error";
  /** Form-level message shown above the form. */
  message?: string;
  /** Field name -> messages, keyed by the Zod path. */
  fieldErrors?: Record<string, string[]>;
}

export const IDLE_ACTION_STATE: ActionState = { status: "idle" };

export function actionSuccess(message?: string): ActionState {
  return { status: "success", message };
}

export function actionError(message: string, fieldErrors?: Record<string, string[]>): ActionState {
  return { status: "error", message, fieldErrors };
}

/** Flattens Zod issues into `ActionState["fieldErrors"]`. */
export function toFieldErrors(error: z.ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    const messages = fieldErrors[key] ?? [];
    messages.push(issue.message);
    fieldErrors[key] = messages;
  }

  return fieldErrors;
}
