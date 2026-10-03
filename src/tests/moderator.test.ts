import "dotenv/config";
import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app.js";

async function getModeratorToken(): Promise<string> {
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: "moderator@whistledrop.local",
      password: process.env.MODERATOR_PASSWORD || "TestModeratorPassword",
    });

  return response.body.data.token;
}

describe("Moderator API", () => {
  it("should reject requests without authentication", async () => {
    const response = await request(app).get(
      "/api/moderator/reports"
    );

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Authentication required"
    );
  });

  it("should reject an invalid JWT", async () => {
    const response = await request(app)
      .get("/api/moderator/reports")
      .set("Authorization", "Bearer invalid-token");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Invalid or expired authentication token"
    );
  });

  it("should allow an authenticated moderator to view reports", async () => {
    const token = await getModeratorToken();

    const response = await request(app)
      .get("/api/moderator/reports")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.reports)).toBe(true);
  });

  it("should reject an invalid status filter", async () => {
    const token = await getModeratorToken();

    const response = await request(app)
      .get("/api/moderator/reports?status=INVALID")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Invalid status filter"
    );
  });

  it("should reject an invalid category filter", async () => {
    const token = await getModeratorToken();

    const response = await request(app)
      .get("/api/moderator/reports?category=INVALID")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Invalid category filter"
    );
  });
});
