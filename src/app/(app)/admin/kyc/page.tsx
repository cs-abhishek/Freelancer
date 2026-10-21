import type { Metadata } from "next";

import { reviewKycDocumentAction } from "@/actions/auth";
import { EmptyState } from "@/components/empty-state";
import { ActionButton } from "@/components/forms/action-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/dal";
import { listPendingKycDocuments } from "@/server/db/users";

export const metadata: Metadata = { title: "KYC review" };

export default async function KycReviewPage() {
  await requireRole("ADMIN");
  const documents = await listPendingKycDocuments();

  return (
    <>
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold tracking-tight">KYC review queue</h1>
        <p className="text-sm text-muted-foreground">
          {documents.length} proofs awaiting a decision
        </p>
      </header>

      {documents.length === 0 ? (
        <EmptyState
          title="Queue is clear"
          description="New student emails, college IDs and PAN records will appear here."
        />
      ) : (
        <section className="flex flex-col gap-3">
          {documents.map((document) => (
            <Card key={document.id} size="sm">
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{document.type.replace(/_/g, " ")}</Badge>
                  <Badge variant="outline">{document.user.role}</Badge>
                </div>
                <CardTitle>{document.user.name ?? document.user.email ?? "Unknown user"}</CardTitle>
                <CardDescription>
                  {document.documentNumber ?? "No reference supplied"} · submitted{" "}
                  {document.createdAt.toLocaleDateString("en-IN")}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <ActionButton
                  action={reviewKycDocumentAction}
                  fields={{ documentId: document.id, status: "VERIFIED" }}
                  label="Verify"
                  pendingLabel="Saving..."
                  size="sm"
                />
                <ActionButton
                  action={reviewKycDocumentAction}
                  fields={{ documentId: document.id, status: "REJECTED" }}
                  label="Reject"
                  pendingLabel="Saving..."
                  variant="destructive"
                  size="sm"
                />
              </CardContent>
            </Card>
          ))}
        </section>
      )}
    </>
  );
}
