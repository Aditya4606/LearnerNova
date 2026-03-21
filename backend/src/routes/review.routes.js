import { Router } from "express";
import { protect } from "../middlewares/authmiddleware.js";
import { addReview, getReviewsForCourse } from "../controllers/review.controller.js";

const router = Router();

// Public route to get all reviews for a course
router.get("/:courseId", getReviewsForCourse);

// Protected route to add a review, requires being enrolled
router.post("/:courseId", protect, addReview);

export default router;
