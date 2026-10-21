import type { Metadata } from "next";

import { ProjectForm } from "@/components/forms/project-form";
import { requireRole } from "@/lib/dal";

export const metadata: Metadata = { title: "Post a project" };

export default async function NewProjectPage() {
  await requireRole("CLIENT");

  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">Post a project</h1>
        <p className="text-sm text-muted-foreground">
          Describe the work and let freelancers quote. Nothing is charged until you fund escrow.
        </p>
      </header>

      <ProjectForm />
    </>
  );
}
