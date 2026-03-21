import express from "express";
import { createLesson, getLessons, updateLesson, deleteLesson, addAttachment, deleteAttachment, markLessonComplete } from "../controllers/lesson.controller.js";
import { protect, isAdmin } from "../middlewares/authmiddleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = express.Router();

// Lesson routes
router.get("/course/:courseId", protect, getLessons);
router.post("/course/:courseId", protect, isAdmin, upload.single('file'), createLesson);
router.put("/:id", protect, isAdmin, upload.single('file'), updateLesson);
router.put("/:id/complete", protect, markLessonComplete);
router.delete("/:id", protect, isAdmin, deleteLesson);

// Attachment routes
router.post("/:lessonId/attachments", protect, isAdmin, upload.single('file'), addAttachment);
router.delete("/attachments/:id", protect, isAdmin, deleteAttachment);

export default router;
