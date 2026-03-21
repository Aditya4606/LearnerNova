import prisma from "../config/db.js";

export const getQuizzesByCourse = async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
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
    const id = parseInt(req.params.id);
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
      data: { title, courseId: parseInt(courseId) },
      include: { questions: true },
    });
    res.status(201).json(quiz);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
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
    const id = parseInt(req.params.id);
    // onDelete: Cascade on Question handles child deletion automatically
    await prisma.quiz.delete({ where: { id } });
    res.json({ message: "Quiz deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Question CRUD
export const addQuestion = async (req, res) => {
  try {
    const quizId = parseInt(req.params.quizId);
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
    const id = parseInt(req.params.id);
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
    const id = parseInt(req.params.id);
    await prisma.question.delete({ where: { id } });
    res.json({ message: "Question deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const submitQuiz = async (req, res) => {
  try {
    const quizId = parseInt(req.params.id);
    const { answers } = req.body;
    const userId = parseInt(req.user.id);

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: true },
    });

    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const attemptsCount = await prisma.quizAttempt.count({
      where: { userId, quizId },
    });

    if (attemptsCount >= 4) {
      return res.status(400).json({ message: "Maximum 4 attempts allowed for this quiz" });
    }

    const attemptNo = attemptsCount + 1;
    let pointsPerQuestion = 1;

    if (quiz.rewards) {
      if (attemptNo === 1) pointsPerQuestion = quiz.rewards.first || 10;
      else if (attemptNo === 2) pointsPerQuestion = quiz.rewards.second || 7;
      else if (attemptNo === 3) pointsPerQuestion = quiz.rewards.third || 4;
      else pointsPerQuestion = quiz.rewards.fourth || 2;
    }

    let correctAnswersCount = 0;
    quiz.questions.forEach(q => {
      const userAnswer = answers.find(a => parseInt(a.questionId) === q.id);
      if (userAnswer && userAnswer.selectedOption === q.answer) {
        correctAnswersCount++;
      }
    });

    const score = correctAnswersCount * pointsPerQuestion;
    const total = quiz.questions.length * pointsPerQuestion;

    const attempt = await prisma.quizAttempt.create({
      data: { userId, quizId, score, total, attemptNo }
    });

    res.json({
      score,
      total,
      attemptNo: attempt.attemptNo,
      remainingAttempts: 4 - (attemptsCount + 1)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getQuizAttempts = async (req, res) => {
  try {
    const quizId = parseInt(req.params.id);
    const userId = parseInt(req.user.id);

    const attempts = await prisma.quizAttempt.findMany({
      where: { userId, quizId },
      orderBy: { createdAt: 'desc' },
    });

    let bestScore = 0;
    let bestAttempt = null;
    
    if (attempts.length > 0) {
      bestAttempt = attempts.reduce((best, current) => current.score > best.score ? current : best, attempts[0]);
      bestScore = bestAttempt.score;
    }

    res.json({ attempts, bestScore, bestAttempt, maxAttempts: 4 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
