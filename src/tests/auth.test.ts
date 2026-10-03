import "dotenv/config";
import { describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("Moderator authentication", () => {
  it("should reject invalid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "moderator@whistledrop.local",
        password: "WrongPassword123",
      });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid credentials");
  });

  it("should reject login when credentials are missing", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "moderator@whistledrop.local",
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it("should successfully login with valid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "moderator@whistledrop.local",
        password: process.env.MODERATOR_PASSWORD || "TestModeratorPassword",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
    expect(response.body.data.moderator.email).toBe(
      "moderator@whistledrop.local"
    );
  });
});
