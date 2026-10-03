import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import reportRoutes from "./routes/report.routes.js";
import trackingRoutes from "./routes/tracking.routes.js";
import authRoutes from "./routes/auth.routes.js";
import moderatorRoutes from "./routes/moderator.routes.js";

const app = express();

app.use(helmet());
app.use(cors());

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
  })
);

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "WhistleDrop API is running",
  });
});

app.use("/api/reports", reportRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/moderator", moderatorRoutes);

export default app;