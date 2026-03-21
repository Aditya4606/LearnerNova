import express from "express";
import {
  getQuizzesByCourse,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from "../controllers/quiz.controller.js";
import { protect, isAdmin } from "../middlewares/authmiddleware.js";

const router = express.Router();

router.get("/course/:courseId", protect, getQuizzesByCourse);
router.get("/:id", protect, getQuizById);
router.post("/", protect, isAdmin, createQuiz);
router.put("/:id", protect, isAdmin, updateQuiz);
router.delete("/:id", protect, isAdmin, deleteQuiz);

// Questions
router.post("/:quizId/questions", protect, isAdmin, addQuestion);
router.put("/questions/:id", protect, isAdmin, updateQuestion);
router.delete("/questions/:id", protect, isAdmin, deleteQuestion);

export default router;
