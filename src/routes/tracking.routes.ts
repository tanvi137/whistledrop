import { Router } from "express";
import { getReportByCaseCode } from "../controllers/tracking.controller.js";

const router = Router();

router.get("/:caseCode", getReportByCaseCode);

export default router;