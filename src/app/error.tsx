"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/**
 * Root error boundary. Next.js 16 forwards the thrown value as `unknown` and
 * exposes recovery through `retry()` (previously `reset()`).
 */
export default function RootError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
        {error instanceof Error ? error.message : "An unexpected error occurred."}
      </p>
      <Button onClick={() => retry()}>Try again</Button>
    </div>
  );
}
