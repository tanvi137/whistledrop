import { Router } from "express";
import { moderatorLogin } from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", moderatorLogin);

export default router;
