import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <Badge variant="outline">404</Badge>
      <h1 className="text-xl font-semibold tracking-tight">This page does not exist</h1>
      <p className="text-sm text-muted-foreground">
        The link may be broken, or the project or gig may have been removed.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button render={<Link href={ROUTES.home} />}>Back to homepage</Button>
        <Button variant="outline" render={<Link href={ROUTES.projects} />}>
          Browse projects
        </Button>
      </div>
    </div>
  );
}
