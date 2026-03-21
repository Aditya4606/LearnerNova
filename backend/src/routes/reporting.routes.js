import express from "express";
import { getReportingData } from "../controllers/reporting.controller.js";
import { protect, isAdmin } from "../middlewares/authmiddleware.js";

const router = express.Router();

router.get("/", protect, isAdmin, getReportingData);

export default router;
