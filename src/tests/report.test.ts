import "dotenv/config";
import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Report submission", () => {
  it("should reject a report with invalid data", async () => {
    const response = await request(app)
      .post("/api/reports")
      .send({
        category: "INVALID",
        description: "Short",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid report data");
  });

  it("should reject a report with a missing description", async () => {
    const response = await request(app)
      .post("/api/reports")
      .send({
        category: "TECHNICAL",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
