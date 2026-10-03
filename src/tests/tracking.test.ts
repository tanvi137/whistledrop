import "dotenv/config";
import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app.js";

const validCaseCode =
  "a71f519b27c2e0840dcd6f99965c279b7c7289b70f41baf0";

describe("Case tracking", () => {
  it("should return the report for a valid case code", async () => {
    const response = await request(app).get(
      `/api/tracking/${validCaseCode}`
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.report.status).toBe("RESOLVED");
    expect(response.body.data.report).not.toHaveProperty(
      "caseCodeHash"
    );
  });

  it("should return 404 for an unknown case code", async () => {
    const response = await request(app).get(
      "/api/tracking/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    );

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Report not found");
  });

  it("should reject an invalid case code format", async () => {
    const response = await request(app).get(
      "/api/tracking/invalid-code"
    );

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid case code");
  });
});
