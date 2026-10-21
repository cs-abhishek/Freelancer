import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * One number per card, the way a money screen should read. `value` accepts a
 * node so a badge (the verification state) can sit where a figure normally does.
 */
export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: LucideIcon;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription className="inline-flex items-center gap-1.5">
          {Icon ? <Icon className="size-3.5" /> : null}
          {label}
        </CardDescription>
        <CardTitle className="text-lg">{value}</CardTitle>
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      </CardHeader>
    </Card>
  );
}
