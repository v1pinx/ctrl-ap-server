import express from "express";

import {
  applyForAdmission,
  getAdmissions,
} from "../controllers/admissionController.js";
import { authenticateToken } from "./../middleware/auth.js";

const admissionRoutes = express.Router();

admissionRoutes.post("/apply", authenticateToken, applyForAdmission);
admissionRoutes.get("/", authenticateToken, getAdmissions);

export default admissionRoutes;
