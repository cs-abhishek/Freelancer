/** Inline validation message for a single form field. */
export function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) return null;
  return <p className="text-xs text-destructive">{messages[0]}</p>;
}

/** Form-level banner: the outcome of the last submit. */
export function FormStatus({ status, message }: { status: string; message?: string }) {
  if (status === "idle" || !message) return null;
  return (
    <p className={status === "error" ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>
      {message}
    </p>
  );
}
