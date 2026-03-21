import prisma from "../config/db.js";

// GET /api/learner/courses?search=term
// Public — returns all published courses (with optional search)
export const getAllPublishedCourses = async (req, res) => {
  try {
    const { search } = req.query;

    const whereClause = {
      isPublished: true,
    };

    if (search && search.trim() !== '') {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ];
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        instructor: { select: { username: true, email: true } },
      },
    });

    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/learner/enrollments
// Protected — returns the logged-in user's enrollments with course data
export const getMyEnrollments = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            instructor: { select: { username: true } },
          },
        },
      },
    });

    res.json(enrollments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/learner/enroll/:courseId
// Protected — enroll the current user in a course
export const enrollInCourse = async (req, res) => {
  try {
    const { id: userId } = req.user;
    const { courseId } = req.params;

    // Check the course exists and is published
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (!course.isPublished) return res.status(400).json({ message: "Course is not published yet" });

    // Check if already enrolled
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId } },
    });
    if (existing) return res.status(400).json({ message: "Already enrolled" });

    // For paid courses, in a real app you'd verify payment first.
    // For now, we allow enrollment directly.
    const enrollment = await prisma.enrollment.create({
      data: { userId, courseId, progress: 0 },
    });

    res.status(201).json(enrollment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
