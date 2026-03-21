import express from "express";
import { getUsers, updateUserRole } from "../controllers/user.controller.js";
import { protect, isAdmin } from "../middlewares/authmiddleware.js";

const router = express.Router();

router.get("/", protect, isAdmin, getUsers);
router.put("/:id/role", protect, isAdmin, updateUserRole);

export default router;
