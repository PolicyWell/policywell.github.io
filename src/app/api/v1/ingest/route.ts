import { NextResponse } from "next/server";
import {
  ingestFileIntoWorkspace,
  workspaceFromRequest,
} from "@/lib/api-v1/workspace-store";
import {
  hasServiceRoleConfigured,
  persistDocumentWithServiceRole,
  resolveIngestOwnerUserId,
} from "@/lib/supabase/persist-document-server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const ws = workspaceFromRequest(req);
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "multipart field `file` is required" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // Prefer text extraction for demos; binary PDFs still get filename-based OCR stubs.
    const asText = buffer.toString("utf8");
    const looksBinary = asText.includes("\u0000");
    const rawText = looksBinary ? undefined : asText;

    const doc = ingestFileIntoWorkspace(
      ws,
      file.name || "upload.bin",
      rawText ?? "",
      file.type || undefined,
    );

    let live: {
      saved: boolean;
      documentId?: string;
      caseId?: string;
      ingestionId?: string;
      warning?: string;
      error?: string;
    } = { saved: false };

    if (!hasServiceRoleConfigured()) {
      live = {
        saved: false,
        warning:
          "SUPABASE_SERVICE_ROLE_KEY is not set — document kept in-memory only; site_stats was not updated.",
      };
    } else {
      const ownerUserId = resolveIngestOwnerUserId(req);
      if (!ownerUserId) {
        live = {
          saved: false,
          warning:
            "Set INGEST_OWNER_USER_ID or send X-PolicyWell-Owner-User-Id (auth.users UUID) to append to the live database.",
        };
      } else {
        const blob = new Blob([buffer], {
          type: file.type || "application/octet-stream",
        });
        const result = await persistDocumentWithServiceRole({
          ownerUserId,
          file: blob,
          filename: file.name || "upload.bin",
          mimeType: file.type || "application/octet-stream",
        });
        if (result.ok) {
          doc.id = result.documentId;
          live = {
            saved: true,
            documentId: result.documentId,
            caseId: result.caseId,
            ingestionId: result.ingestionId,
          };
        } else {
          live = { saved: false, error: result.error };
        }
      }
    }

    return NextResponse.json({
      ok: true,
      workspaceId: ws.id,
      live,
      document: {
        id: doc.id,
        filename: doc.filename,
        kind: doc.kind,
        confidence: doc.overallConfidence,
        verified: doc.verified,
        extraction: doc.extraction,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Ingest failed" },
      { status: 500 },
    );
  }
}
