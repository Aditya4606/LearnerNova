import prisma from "../config/db.js";

export const getQuizzesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const quizzes = await prisma.quiz.findMany({
      where: { courseId },
      include: { questions: true },
      orderBy: { createdAt: "asc" },
    });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await prisma.quiz.findUnique({
      where: { id },
      include: { questions: true },
    });
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createQuiz = async (req, res) => {
  try {
    const { title, courseId } = req.body;
    if (!title || !courseId) {
      return res.status(400).json({ message: "Title and courseId are required" });
    }
    const quiz = await prisma.quiz.create({
      data: { title, courseId },
      include: { questions: true },
    });
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, rewards } = req.body;
    const quiz = await prisma.quiz.update({
      where: { id },
      data: { title, rewards },
      include: { questions: true },
    });
    res.json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    // Delete all questions first
    await prisma.question.deleteMany({ where: { quizId: id } });
    await prisma.quiz.delete({ where: { id } });
    res.json({ message: "Quiz deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Question CRUD
export const addQuestion = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { text, options, answer } = req.body;
    const question = await prisma.question.create({
      data: { text: text || "New Question", options: options || [], answer: answer || 0, quizId },
    });
    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, options, answer } = req.body;
    const question = await prisma.question.update({
      where: { id },
      data: { text, options, answer },
    });
    res.json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.question.delete({ where: { id } });
    res.json({ message: "Question deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
