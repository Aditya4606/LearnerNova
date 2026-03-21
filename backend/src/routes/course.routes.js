import express from "express";
import { getCourses, createCourse, updateCourse, getCourseById, addLesson, addQuiz } from "../controllers/course.controller.js";
import { protect } from "../middlewares/authmiddleware.js";

const router = express.Router();

router.get("/", protect, getCourses);
router.get("/:id", protect, getCourseById);
router.post("/", protect, createCourse);
router.put("/:id", protect, updateCourse);
router.post("/:id/lessons", protect, addLesson);
router.post("/:id/quizzes", protect, addQuiz);

export default router;
