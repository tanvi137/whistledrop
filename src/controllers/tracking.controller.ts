import type { Request, Response } from "express";
import { prisma } from "../config/prisma.js";
import { hashCaseCode } from "../utils/case-code.js";

export async function getReportByCaseCode(
  req: Request,
  res: Response
) {
  try {
    const caseCode = String(req.params.caseCode ?? "");

    if (caseCode.length !== 48) {
      return res.status(400).json({
        success: false,
        message: "Invalid case code",
      });
    }

    const caseCodeHash = hashCaseCode(caseCode);

    const report = await prisma.report.findUnique({
      where: {
        caseCodeHash,
      },
      select: {
        id: true,
        category: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        closedAt: true,
        statusUpdates: {
          select: {
            message: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        report,
      },
    });
  } catch (error) {
    console.error("Get report error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve report",
    });
  }
}