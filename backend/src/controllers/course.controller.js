import prisma from "../config/db.js";

export const getCourses = async (req, res) => {
  try {
    const { role, id } = req.user;
    const userId = parseInt(id);
    const whereClause = role === 'INSTRUCTOR' ? { createdBy: userId } : {};

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          instructor: { select: { username: true, email: true } }
        }
      }),
      prisma.course.count({ where: whereClause })
    ]);

    res.json({
      courses,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalCourses: total
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { title } = req.body;
    const userId = parseInt(req.user.id);

    if (!title || title.trim() === '') {
      return res.status(400).json({ message: "Course title is required" });
    }

    const course = await prisma.course.create({
      data: {
        title,
        createdBy: userId,
        tags: ["New"]
      }
    });

    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const { title, description, isPublished, tags, views, duration, lessonsCount, website, imageUrl, price, visibility, accessRule } = req.body;
    const { role } = req.user;
    const userId = parseInt(req.user.id);

    const existing = await prisma.course.findUnique({ where: { id: courseId } });
    if (!existing) return res.status(404).json({ message: "Course not found" });

    if (role !== 'ADMIN' && existing.createdBy !== userId) {
      return res.status(403).json({ message: "Not authorized to edit this course" });
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data: { title, description, isPublished, tags, views, duration, lessonsCount, website, imageUrl, price, visibility, accessRule }
    });

    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: { select: { username: true, id: true } },
        lessons: {
          orderBy: { order: 'asc' },
          include: { attachments: true }
        },
        quizzes: {
          include: { questions: true }
        }
      }
    });

    if (!course) return res.status(404).json({ message: "Course not found" });

    // Increment views asynchronously only for learners
    if (req.user && req.user.role === 'LEARNER') {
      prisma.course.update({
        where: { id: courseId },
        data: { views: { increment: 1 } }
      }).catch(err => console.error("Failed to update course views:", err));
    }

    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addLesson = async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const { title, type, content } = req.body;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { lessons: true }
    });

    if (!course) return res.status(404).json({ message: "Course not found" });

    const lesson = await prisma.lesson.create({
      data: {
        title,
        type,
        content,
        courseId,
        order: course.lessons.length
      }
    });

    await prisma.course.update({
      where: { id: courseId },
      data: { lessonsCount: course.lessons.length + 1 }
    });

    res.status(201).json(lesson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addQuiz = async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const { title } = req.body;

    const quiz = await prisma.quiz.create({
      data: { title, courseId }
    });

    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
