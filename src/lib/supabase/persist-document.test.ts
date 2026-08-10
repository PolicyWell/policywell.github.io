import { describe, expect, it } from "vitest";
import {
  buildPolicyDocumentStoragePath,
  guessDocumentType,
  isSupabaseAuthUserId,
  sanitizeStorageFilename,
} from "./persist-document";

describe("persist-document helpers", () => {
  it("accepts auth uuids and rejects demo ids", () => {
    expect(isSupabaseAuthUserId("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")).toBe(
      true,
    );
    expect(isSupabaseAuthUserId("user_alex")).toBe(false);
  });

  it("sanitizes filenames", () => {
    expect(sanitizeStorageFilename("../../evil.pdf")).toBe("evil.pdf");
    expect(sanitizeStorageFilename("Mutual of Omaha IUL.pdf")).toContain(
      "Mutual",
    );
  });

  it("builds the owner/case/document storage path", () => {
    const owner = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
    const caseId = "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22";
    const documentId = "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33";
    expect(
      buildPolicyDocumentStoragePath({
        ownerUserId: owner,
        caseId,
        documentId,
        filename: "policy.pdf",
      }),
    ).toBe(`${owner}/${caseId}/${documentId}/policy.pdf`);
  });

  it("guesses document types from filenames", () => {
    expect(guessDocumentType("Acme_InForce_Illustration.pdf")).toBe(
      "inforce_illustration",
    );
    expect(guessDocumentType("original-illustration.pdf")).toBe(
      "original_illustration",
    );
    expect(guessDocumentType("annual_statement_2024.pdf")).toBe(
      "annual_statement",
    );
    expect(guessDocumentType("notes.txt")).toBe("unknown");
  });
});
