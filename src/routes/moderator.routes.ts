import { Router } from "express";
import { authenticateModerator } from "../middleware/auth.middleware.js";
import {
  getReports,
  getReportById,
  updateReportStatus,
  addStatusUpdate,
} from "../controllers/moderator.controller.js";

const router = Router();

router.use(authenticateModerator);

router.get("/reports", getReports);
router.get("/reports/:reportId", getReportById);

router.patch("/reports/:reportId/status", updateReportStatus);

router.post(
  "/reports/:reportId/updates",
  addStatusUpdate
);

export default router;
