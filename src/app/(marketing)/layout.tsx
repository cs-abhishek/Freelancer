import type { ReactNode } from "react";

import { SiteFooter } from "@/components/shared/site-footer";
import { SiteNav } from "@/components/shared/site-nav";

/** Public shell: marketing chrome only, no session reads, no dashboard nav. */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <SiteNav />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-4 py-10">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
