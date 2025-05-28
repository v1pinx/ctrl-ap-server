import express from "express";

import {
  createCourse,
  deleteCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
} from "../controllers/courseController.js";
import { authenticateToken, requireAdmin } from "./../middleware/auth.js";

const courseRoutes = express.Router();

courseRoutes.get("/", getAllCourses);
courseRoutes.get("/:id", getCourseById);
courseRoutes.post("/", authenticateToken, requireAdmin, createCourse);
courseRoutes.put("/:id", authenticateToken, requireAdmin, updateCourse);
courseRoutes.delete("/:id", authenticateToken, requireAdmin, deleteCourse);

export default courseRoutes;
