export const MOCK_USERS = [
  { id: 1, name: "Super Admin", email: "super@learnova.com", password: "super123", role: "superuser" },
  { id: 2, name: "John Instructor", email: "a", password: "admin123", role: "admin" },
  { id: 3, name: "Jane Learner", email: "jane@learnova.com", password: "learn123", role: "learner" }
];

export const MOCK_COURSES = [
  { id: 1, title: 'Advanced React Patterns', duration: '4.5h', lessons: 5, enrolled: 1200, status: 'PUBLISHED', rating: 4.8 },
  { id: 2, title: 'Introduction to WebGL', duration: '2h', lessons: 8, enrolled: 850, status: 'PUBLISHED', rating: 4.5 },
  { id: 3, title: 'Design Systems Architecture', duration: '6h', lessons: 12, enrolled: 2100, status: 'PUBLISHED', rating: 4.9 },
  { id: 4, title: 'CSS Animations Mastery', duration: '3h', lessons: 6, enrolled: 0, status: 'DRAFT', rating: 0 },
];

export const MOCK_LESSONS = [
  { id: 1, courseId: 1, title: 'Compound Components', type: 'video', status: 'completed' },
  { id: 2, courseId: 1, title: 'Render Props vs Hooks', type: 'video', status: 'in-progress' },
  { id: 3, courseId: 1, title: 'Custom Contexts', type: 'text', status: 'not-started' },
];

export const MOCK_QUIZZES = [
  { id: 1, courseId: 1, title: 'React Core Concepts', questionsCount: 4 }
];
