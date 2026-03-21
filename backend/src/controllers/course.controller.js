import prisma from "../config/db.js";

export const getCourses = async (req, res) => {
  try {
    const { role, id } = req.user;
    
    // Admins see all courses, Instructors see only their own
    const whereClause = role === 'INSTRUCTOR' ? { createdBy: id } : {};
    
    const courses = await prisma.course.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        instructor: { select: { username: true, email: true } }
      }
    });
    
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createCourse = async (req, res) => {
  try {
    const { title } = req.body;
    const { id } = req.user;
    
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: "Course title is required" });
    }

    const course = await prisma.course.create({
      data: {
        title,
        createdBy: id,
        // Optional default tags
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
    const { id: courseId } = req.params;
    const { title, description, isPublished, tags, views, duration, lessonsCount, website, imageUrl, price, visibility, accessRule } = req.body;
    const { role, id: userId } = req.user;

    // Verify ownership or admin rights
    const existing = await prisma.course.findUnique({ where: { id: courseId } });
    if (!existing) return res.status(404).json({ message: "Course not found" });
    
    if (role !== 'ADMIN' && existing.createdBy !== userId) {
      return res.status(403).json({ message: "Not authorized to edit this course" });
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data: { 
        title, 
        description, 
        isPublished, 
        tags, 
        views, 
        duration, 
        lessonsCount,
        website,
        imageUrl,
        price,
        visibility,
        accessRule
      }
    });

    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: { select: { username: true, id: true } },
        lessons: {
          orderBy: { order: 'asc' },
          include: { attachments: true }
        },
        quizzes: {
          include: {
            questions: true
          }
        }
      }
    });

    if (!course) return res.status(404).json({ message: "Course not found" });
    
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addLesson = async (req, res) => {
  try {
    const { id: courseId } = req.params;
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
    const { id: courseId } = req.params;
    const { title } = req.body;

    const quiz = await prisma.quiz.create({
      data: {
        title,
        courseId
      }
    });

    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
