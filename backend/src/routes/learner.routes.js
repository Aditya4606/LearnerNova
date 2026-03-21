import express from "express";
import { getAllPublishedCourses, getMyEnrollments, enrollInCourse } from "../controllers/learner.controller.js";
import { protect } from "../middlewares/authmiddleware.js";

const router = express.Router();

// Public — browse all published courses
router.get("/courses", getAllPublishedCourses);

// Protected — user's enrollments
router.get("/enrollments", protect, getMyEnrollments);

// Protected — enroll in a course
router.post("/enroll/:courseId", protect, enrollInCourse);

export default router;
