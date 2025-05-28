import express from "express";
import cors from "cors";
import { configDotenv } from "dotenv";
import { authRoutes } from "./routes/auth.js";
import courseRoutes from "./routes/courses.js";
import admissionRoutes from "./routes/admissions.js";
import studentRoutes from "./routes/students.js";
import adminRoutes from "./routes/admin.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";

configDotenv();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 100,
//   message: {
//     success: false,
//     error: "Too many requests from this IP, please try again later.",
//   },
// });
// app.use(limiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - ${req.ip}`);
  next();
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Admission Portal API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/admissions", admissionRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info(`Admission Portal API server running on port ${PORT}`);
});
