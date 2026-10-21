import type { ReactNode } from "react";

import { AppHeader } from "@/components/app-header";

/** Shell for every signed-in route: `(app)/dashboard`, `(app)/projects`, ... */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-6">
        {children}
      </main>
    </div>
  );
}
