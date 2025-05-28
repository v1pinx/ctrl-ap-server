import express from "express";
import { getMyAdmissions, getProfile } from "../controllers/studentController.js";
import { authenticateToken } from "../middleware/auth.js";

const studentRoutes = express.Router();

studentRoutes.get("/profile", authenticateToken, getProfile);
studentRoutes.get("/admissions", authenticateToken, getMyAdmissions);

export default studentRoutes;