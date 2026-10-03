import "dotenv/config";
import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Health endpoint", () => {
  it("should return API health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("WhistleDrop API is running");
  });
});
