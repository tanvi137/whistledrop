import { Router } from "express";
import { createReport } from "../controllers/report.controller.js";

const router = Router();

router.post("/", createReport);

export default router;
