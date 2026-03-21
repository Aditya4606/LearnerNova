import prisma from "../config/db.js";

export const createLesson = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { title, type, content, duration, allowDownload, description, responsible } = req.body;

    // Get the current highest order to append
    const lastLesson = await prisma.lesson.findFirst({
      where: { courseId },
      orderBy: { order: 'desc' }
    });
    const order = lastLesson ? lastLesson.order + 1 : 0;

    const lesson = await prisma.lesson.create({
      data: {
        title,
        type,
        content: req.file ? `/uploads/${req.file.filename}` : content,
        duration,
        allowDownload: typeof allowDownload === 'string' ? allowDownload === 'true' : !!allowDownload,
        description,
        responsible,
        order,
        courseId
      }
    });

    // Update course lesson count
    await prisma.course.update({
      where: { id: courseId },
      data: { lessonsCount: { increment: 1 } }
    });

    res.status(201).json(lesson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getLessons = async (req, res) => {
  try {
    const { courseId } = req.params;
    const lessons = await prisma.lesson.findMany({
      where: { courseId },
      include: { attachments: true },
      orderBy: { order: 'asc' }
    });
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, type, content, duration, allowDownload, description, responsible, order } = req.body;

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        title,
        type,
        content: req.file ? `/uploads/${req.file.filename}` : content,
        duration,
        allowDownload: typeof allowDownload === 'string' ? allowDownload === 'true' : !!allowDownload,
        description,
        responsible,
        order: order ? parseInt(order) : undefined
      }
    });

    res.json(lesson);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    
    const lesson = await prisma.lesson.findUnique({ where: { id } });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    await prisma.lesson.delete({ where: { id } });

    // Update course lesson count
    await prisma.course.update({
      where: { id: lesson.courseId },
      data: { lessonsCount: { decrement: 1 } }
    });

    res.json({ message: "Lesson deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addAttachment = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { title, type, url } = req.body;

    const attachment = await prisma.attachment.create({
      data: {
        title,
        type,
        url: req.file ? `/uploads/${req.file.filename}` : url,
        lessonId
      }
    });

    res.status(201).json(attachment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteAttachment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.attachment.delete({ where: { id } });
    res.json({ message: "Attachment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
