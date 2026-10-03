import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { createReportSchema } from "../validators/report.validator.js";
import { generateCaseCode, hashCaseCode } from "../utils/case-code.js";

export async function createReport(req: Request, res: Response) {
  try {
    const validation = createReportSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid report data",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { category, description, evidenceUrl } = validation.data;

    const caseCode = generateCaseCode();
    const caseCodeHash = hashCaseCode(caseCode);

    const report = await prisma.report.create({
      data: {
        caseCodeHash,
        category,
        description,
        evidenceUrl: evidenceUrl ?? null,
      },
      select: {
        id: true,
        category: true,
        status: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Report submitted successfully",
      data: {
        caseCode,
        report,
      },
    });
  } catch (error) {
    console.error("Create report error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to submit report",
    });
  }
}
