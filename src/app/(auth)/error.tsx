"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export default function AuthError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-start gap-3 rounded-xl border p-4">
      <h2 className="text-sm font-semibold">Sign-in is temporarily unavailable</h2>
      <p className="text-xs text-muted-foreground">
        {error instanceof Error ? error.message : "An unexpected error occurred."}
      </p>
      <Button size="sm" onClick={() => retry()}>
        Try again
      </Button>
    </div>
  );
}
