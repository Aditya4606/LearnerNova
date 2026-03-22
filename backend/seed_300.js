import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting massive database seeding...');

  const BATCH_SIZE = 100;

  // --- 1. SEED USERS ---
  console.log('⏳ Seeding Users...');
  const defaultPassword = await bcrypt.hash('Password@123', 10);
  
  // We need Admin, Instructors, and Learners.
  // 1 Admin, 50 Instructors, 250 Learners = 301 Users
  const usersData = [];
  usersData.push({
    email: 'admin@learnova.com',
    username: 'AdminSuper',
    password: defaultPassword,
    role: 'ADMIN',
  });
  
  for (let i = 0; i < 50; i++) {
    usersData.push({
      email: faker.internet.email(),
      username: faker.internet.username(),
      password: defaultPassword,
      role: 'INSTRUCTOR',
    });
  }

  for (let i = 0; i < 250; i++) {
    usersData.push({
      email: faker.internet.email(),
      username: faker.internet.username(),
      password: defaultPassword,
      role: 'LEARNER',
    });
  }

  // Use createMany for users
  await prisma.user.createMany({
    data: usersData,
    skipDuplicates: true,
  });

  const allInstructors = await prisma.user.findMany({ where: { role: 'INSTRUCTOR' } });
  const allLearners = await prisma.user.findMany({ where: { role: 'LEARNER' } });

  // --- 2. SEED COURSES ---
  console.log('⏳ Seeding Courses...');
  const coursesData = [];
  const tagsList = ['React', 'Python', 'AI', 'Business', 'Design', 'Marketing', 'Data Science', 'Backend', 'DevOps', 'Mobile'];
  
  for (let i = 0; i < 300; i++) {
    const instructor = faker.helpers.arrayElement(allInstructors);
    coursesData.push({
      title: `${faker.company.catchPhraseAdjective()} ${faker.company.catchPhraseNoun()} with ${faker.hacker.noun()}`,
      description: faker.lorem.paragraphs(2),
      isPublished: faker.datatype.boolean({ probability: 0.8 }),
      createdBy: instructor.id,
      duration: `${faker.number.int({ min: 1, max: 40 })}h`,
      lessonsCount: faker.number.int({ min: 5, max: 25 }),
      tags: faker.helpers.arrayElements(tagsList, { min: 1, max: 3 }),
      views: faker.number.int({ min: 0, max: 5000 }),
      imageUrl: null,
      website: faker.internet.url(),
      price: faker.helpers.arrayElement([0, 99, 149, 299, 499, 999]),
      visibility: faker.helpers.arrayElement(['everyone', 'signed_in']),
      accessRule: faker.helpers.arrayElement(['open', 'payment']),
    });
  }

  await prisma.course.createMany({
    data: coursesData,
    skipDuplicates: true,
  });

  const allCourses = await prisma.course.findMany();

  // --- 3. SEED LESSONS ---
  console.log('⏳ Seeding Lessons...');
  const lessonsData = [];
  for (const course of allCourses) {
    const numLessons = faker.number.int({ min: 1, max: 3 }); // Keep it small per course to avoid huge DB size, ~600-900 total
    for (let i = 0; i < numLessons; i++) {
      lessonsData.push({
        title: `Lesson ${i + 1}: ${faker.lorem.words(3)}`,
        content: faker.helpers.arrayElement([
          'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          null,
          'https://vimeo.com/148751763'
        ]),
        type: faker.helpers.arrayElement(['VIDEO', 'DOCUMENT']),
        order: i,
        courseId: course.id,
        description: faker.lorem.paragraph(),
        duration: `${faker.number.int({ min: 5, max: 60 })}m`,
        allowDownload: faker.datatype.boolean(),
      });
    }
  }

  // Batch insert lessons
  for (let i = 0; i < lessonsData.length; i += BATCH_SIZE) {
    await prisma.lesson.createMany({
      data: lessonsData.slice(i, i + BATCH_SIZE),
      skipDuplicates: true,
    });
  }

  // --- 4. SEED QUIZZES & QUESTIONS ---
  console.log('⏳ Seeding Quizzes and Questions...');
  for (const course of allCourses.slice(0, 50)) { // Add quizzes to 50 courses to save time
    const quiz = await prisma.quiz.create({
      data: {
        title: `Module Assessment: ${course.title}`,
        courseId: course.id,
        rewards: { first: 10, second: 7, third: 4, others: 1 },
      }
    });

    const questionsData = [];
    for (let i = 0; i < 3; i++) {
        questionsData.push({
            text: faker.lorem.sentence() + '?',
            options: [faker.lorem.word(), faker.lorem.word(), faker.lorem.word(), faker.lorem.word()],
            answer: faker.number.int({ min: 0, max: 3 }),
            quizId: quiz.id
        });
    }
    await prisma.question.createMany({ data: questionsData });
  }

  const allQuizzes = await prisma.quiz.findMany();

  // --- 5. SEED ENROLLMENTS ---
  console.log('⏳ Seeding Enrollments...');
  const enrollmentsData = [];
  const enrollmentKeys = new Set();
  
  for (let i = 0; i < 300; i++) {
    const learner = faker.helpers.arrayElement(allLearners);
    const course = faker.helpers.arrayElement(allCourses);
    const key = `${learner.id}-${course.id}`;

    if (!enrollmentKeys.has(key)) {
      enrollmentKeys.add(key);
      const isCompleted = faker.datatype.boolean();
      enrollmentsData.push({
        userId: learner.id,
        courseId: course.id,
        progress: isCompleted ? 100 : faker.number.int({ min: 0, max: 99 }),
        status: isCompleted ? 'completed' : 'in_progress',
        timeSpent: faker.number.int({ min: 0, max: 600 }),
        startedAt: faker.date.past(),
        completedAt: isCompleted ? faker.date.recent() : null,
      });
    }
  }

  // Batch insert enrollments
  for (let i = 0; i < enrollmentsData.length; i += BATCH_SIZE) {
    await prisma.enrollment.createMany({
      data: enrollmentsData.slice(i, i + BATCH_SIZE),
      skipDuplicates: true,
    });
  }

  // --- 6. SEED REVIEWS ---
  console.log('⏳ Seeding Reviews...');
  const reviewsData = [];
  const reviewKeys = new Set();

  for (let i = 0; i < 300; i++) {
    const learner = faker.helpers.arrayElement(allLearners);
    const course = faker.helpers.arrayElement(allCourses);
    const key = `${learner.id}-${course.id}`;

    if (!reviewKeys.has(key)) {
      reviewKeys.add(key);
      reviewsData.push({
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.sentences(2),
        userId: learner.id,
        courseId: course.id,
      });
    }
  }

  for (let i = 0; i < reviewsData.length; i += BATCH_SIZE) {
    await prisma.review.createMany({
      data: reviewsData.slice(i, i + BATCH_SIZE),
      skipDuplicates: true,
    });
  }

  // --- 7. SEED QUIZ ATTEMPTS ---
  console.log('⏳ Seeding Quiz Attempts...');
  const quizAttemptsData = [];
  for (let i = 0; i < 300; i++) {
    if (allQuizzes.length === 0) break;
    const learner = faker.helpers.arrayElement(allLearners);
    const quiz = faker.helpers.arrayElement(allQuizzes);
    quizAttemptsData.push({
      userId: learner.id,
      quizId: quiz.id,
      score: faker.number.int({ min: 0, max: 30 }),
      total: 30,
      attemptNo: faker.number.int({ min: 1, max: 3 }),
    });
  }

  for (let i = 0; i < quizAttemptsData.length; i += BATCH_SIZE) {
    await prisma.quizAttempt.createMany({
      data: quizAttemptsData.slice(i, i + BATCH_SIZE),
      skipDuplicates: true,
    });
  }

  console.log('🎉 Database successfully seeded with 300+ fake records across all tables!');
  console.log('Login credentials:');
  console.log('Admin User: admin@learnova.com / Password@123');
  console.log('Any other user password: Password@123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
