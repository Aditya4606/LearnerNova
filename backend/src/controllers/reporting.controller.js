import prisma from "../config/db.js";

export const getReportingData = async (req, res) => {
  try {
    const { role, id: userId } = req.user;

    // Build course filter - instructors only see their own courses
    const courseFilter = role === 'INSTRUCTOR' ? { createdBy: userId } : {};

    const enrollments = await prisma.enrollment.findMany({
      where: {
        course: courseFilter,
      },
      include: {
        user: { select: { id: true, username: true, email: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Compute summary stats
    const total = enrollments.length;
    const yetToStart = enrollments.filter((e) => e.status === "yet_to_start").length;
    const inProgress = enrollments.filter((e) => e.status === "in_progress").length;
    const completed = enrollments.filter((e) => e.status === "completed").length;

    res.json({
      stats: { total, yetToStart, inProgress, completed },
      enrollments: enrollments.map((e) => ({
        id: e.id,
        courseName: e.course.title,
        courseId: e.course.id,
        participantName: e.user.username,
        participantEmail: e.user.email,
        enrolledDate: e.createdAt,
        startDate: e.startedAt,
        timeSpent: e.timeSpent,
        completionPercentage: e.progress,
        completedDate: e.completedAt,
        status: e.status,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
