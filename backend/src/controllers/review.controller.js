import prisma from "../config/db.js";

// Fetch reviews for a specific course
export const getReviewsForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { courseId },
      include: {
        user: { select: { id: true, username: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add a new review for a course
export const addReview = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;
    const { id: userId } = req.user;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // 1. Check if the course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // 2. Check if the user is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    if (!enrollment) {
      return res.status(403).json({ message: "You must be enrolled in this course to leave a review." });
    }

    // 3. Check if the user has already reviewed the course
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this course." });
    }

    // 4. Create the review
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        userId,
        courseId
      },
      include: {
        user: { select: { id: true, username: true } }
      }
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
