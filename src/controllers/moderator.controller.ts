import type { Response } from "express";
import { prisma } from "../config/prisma.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

const validStatuses = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "RESOLVED",
  "DISMISSED",
] as const;

const allowedTransitions: Record<
  (typeof validStatuses)[number],
  readonly (typeof validStatuses)[number][]
> = {
  SUBMITTED: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["RESOLVED", "DISMISSED"],
  RESOLVED: [],
  DISMISSED: [],
};

const validCategories = [
  "SECURITY",
  "HARASSMENT",
  "CORRUPTION",
  "TECHNICAL",
  "OTHER",
] as const;

export async function getReports(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const { status, category } = req.query;

    if (
      status &&
      (typeof status !== "string" ||
        !validStatuses.includes(
          status as (typeof validStatuses)[number]
        ))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid status filter",
      });
    }

    if (
      category &&
      (typeof category !== "string" ||
        !validCategories.includes(
          category as (typeof validCategories)[number]
        ))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid category filter",
      });
    }

    const reports = await prisma.report.findMany({
      where: {
        ...(typeof status === "string"
          ? { status: status as (typeof validStatuses)[number] }
          : {}),
        ...(typeof category === "string"
          ? {
              category:
                category as (typeof validCategories)[number],
            }
          : {}),
      },
      select: {
        id: true,
        category: true,
        description: true,
        evidenceUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        closedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      data: {
        reports,
        count: reports.length,
      },
    });
  } catch (error) {
    console.error("Get reports error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve reports",
    });
  }
}

export async function getReportById(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const reportId = String(req.params.reportId ?? "");

    if (!reportId) {
      return res.status(400).json({
        success: false,
        message: "Report ID is required",
      });
    }

    const report = await prisma.report.findUnique({
      where: {
        id: reportId,
      },
      select: {
        id: true,
        category: true,
        description: true,
        evidenceUrl: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        closedAt: true,
        statusUpdates: {
          select: {
            id: true,
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
    console.error("Get report by ID error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve report",
    });
  }
}

export async function updateReportStatus(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const reportId = String(req.params.reportId ?? "");
    const { status, message } = req.body;

    if (!reportId) {
      return res.status(400).json({
        success: false,
        message: "Report ID is required",
      });
    }

    if (
      typeof status !== "string" ||
      !validStatuses.includes(
        status as (typeof validStatuses)[number]
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid report status",
      });
    }

    if (
      message !== undefined &&
      (typeof message !== "string" ||
        message.trim().length < 3 ||
        message.trim().length > 1000)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status update message must be between 3 and 1000 characters",
      });
    }

    const existingReport = await prisma.report.findUnique({
      where: {
        id: reportId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!existingReport) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    const currentStatus = existingReport.status;
    const nextStatus = status as (typeof validStatuses)[number];

    if (!allowedTransitions[currentStatus].includes(nextStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${currentStatus} to ${nextStatus}`,
      });
    }

    const closedAt =
      nextStatus === "RESOLVED" || nextStatus === "DISMISSED"
        ? new Date()
        : null;

    const report = await prisma.$transaction(async (tx) => {
      const updatedReport = await tx.report.update({
        where: {
          id: reportId,
        },
        data: {
          status: nextStatus,
          closedAt,
        },
        select: {
          id: true,
          category: true,
          status: true,
          updatedAt: true,
          closedAt: true,
        },
      });

      if (message?.trim()) {
        await tx.statusUpdate.create({
          data: {
            reportId,
            message: message.trim(),
          },
        });
      }

      return updatedReport;
    });

    return res.status(200).json({
      success: true,
      message: "Report status updated successfully",
      data: {
        report,
      },
    });
  } catch (error) {
    console.error("Update report status error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update report status",
    });
  }
}

export async function addStatusUpdate(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const reportId = String(req.params.reportId ?? "");
    const { message } = req.body;

    if (!reportId) {
      return res.status(400).json({
        success: false,
        message: "Report ID is required",
      });
    }

    if (
      typeof message !== "string" ||
      message.trim().length < 3 ||
      message.trim().length > 1000
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Message must be between 3 and 1000 characters",
      });
    }

    const report = await prisma.report.findUnique({
      where: {
        id: reportId,
      },
      select: {
        id: true,
        status: true,
      },
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    const statusUpdate = await prisma.statusUpdate.create({
      data: {
        reportId,
        message: message.trim(),
      },
      select: {
        id: true,
        message: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Status update added successfully",
      data: {
        statusUpdate,
      },
    });
  } catch (error) {
    console.error("Add status update error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to add status update",
    });
  }
}