import crypto from "node:crypto";

export function generateCaseCode(): string {
  return crypto.randomBytes(24).toString("hex");
}

export function hashCaseCode(caseCode: string): string {
  return crypto
    .createHash("sha256")
    .update(caseCode)
    .digest("hex");
}