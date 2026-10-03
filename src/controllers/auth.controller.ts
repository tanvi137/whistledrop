import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import {
  comparePassword,
  generateToken,
} from "../utils/auth.js";

export async function moderatorLogin(
  req: Request,
  res: Response
) {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const moderator = await prisma.moderator.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    });

    if (!moderator) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const passwordMatches = await comparePassword(
      password,
      moderator.passwordHash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(moderator.id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        moderator: {
          id: moderator.id,
          email: moderator.email,
        },
      },
    });
  } catch (error) {
    console.error("Moderator login error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to login",
    });
  }
}
