import { resolveDemoAuth, storageClientForAuth, supabaseForAuth } from "@/lib/v1/auth";
import { assertCaseAccess } from "@/lib/v1/case-queries";
import { jsonError, jsonOk } from "@/lib/v1/http";
import { LifeIllustrationIngestionService } from "@/lib/v1/life-illustration/LifeIllustrationIngestionService";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ caseId: string }> };

export async function POST(req: Request, context: RouteContext) {
  try {
    const { caseId } = await context.params;
    const auth = await resolveDemoAuth(req);
    const supabase = supabaseForAuth(auth);
    await assertCaseAccess(supabase, caseId, auth.userId);

    const contentType = req.headers.get("content-type") ?? "";
    let filename = "document.bin";
    let mimeType: string | null = null;
    let bytes: Buffer;
    let textOverride: string | undefined;

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (!(file instanceof File)) {
        return jsonError(new Error("file is required"), 400);
      }
      filename = file.name || filename;
      mimeType = file.type || null;
      bytes = Buffer.from(await file.arrayBuffer());
      const textField = form.get("text");
      if (typeof textField === "string" && textField.trim()) {
        textOverride = textField;
      }
    } else {
      const body = (await req.json()) as {
        filename?: string;
        mimeType?: string;
        contentBase64?: string;
        text?: string;
      };
      filename = body.filename?.trim() || filename;
      mimeType = body.mimeType ?? null;
      if (body.text) {
        textOverride = body.text;
        bytes = Buffer.from(body.text, "utf8");
        mimeType = mimeType ?? "text/plain";
      } else if (body.contentBase64) {
        bytes = Buffer.from(body.contentBase64, "base64");
      } else {
        return jsonError(
          new Error("Provide multipart file, contentBase64, or text"),
          400,
        );
      }
    }

    const service = new LifeIllustrationIngestionService(supabase);
    const result = await service.ingest({
      caseId,
      userId: auth.userId,
      filename,
      mimeType,
      bytes,
      textOverride,
      storageClient: storageClientForAuth(),
    });

    return jsonOk({
      caseId,
      documentId: result.documentId,
      ingestionId: result.ingestionId,
      storagePath: result.storagePath,
      documentType: result.documentType,
      policyId: result.policyId,
      steps: result.steps,
      funding: result.funding,
      extraction: result.extraction
        ? {
            carrier: result.extraction.carrier,
            product: result.extraction.product,
            insuredName: result.extraction.insuredName,
            monthlyPremium: result.extraction.monthlyPremium,
            annualPremium: result.extraction.annualPremium,
            noLapseAnnualPremium: result.extraction.noLapseAnnualPremium,
            guidelineMaximumLevelPremium:
              result.extraction.guidelineMaximumLevelPremium,
            ledgerRows: result.extraction.ledger.length,
            factCount: result.extraction.facts.length,
          }
        : null,
    });
  } catch (error) {
    return jsonError(error);
  }
}
