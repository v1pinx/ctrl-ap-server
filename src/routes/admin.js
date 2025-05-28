import express from "express"
import { authenticateToken, requireAdmin } from "../middleware/auth.js";
import {
  getDashboard,
  getAllStudents,
  getAllAdmissions
} from "../controllers/adminController.js";

const adminRoutes = express.Router()

adminRoutes.get("/dashboard", authenticateToken, requireAdmin, getDashboard)
adminRoutes.get("/students", authenticateToken, requireAdmin, getAllStudents)
adminRoutes.get("/admissions", authenticateToken, requireAdmin, getAllAdmissions)

export default adminRoutes;