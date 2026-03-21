import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding ALL tables with comprehensive fake demo data...');

  // Reset all existing data starting from bottom-up foreign keys
  // Since we have Cascade deletes, deleting Users and Courses deletes almost everything
  await prisma.user.deleteMany({});
  await prisma.course.deleteMany({});
  
  const passwordHash = await bcrypt.hash('LearnerNova123!', 10);

  // 1. CREATE USERS
  console.log('Creating users...');
  
  const admin = await prisma.user.create({
    data: { email: 'admin@learnova.com', username: 'admin_user', password: passwordHash, role: 'ADMIN' },
  });

  const instructor1 = await prisma.user.create({
    data: { email: 'jane@learnova.com', username: 'jane_instructor', password: passwordHash, role: 'INSTRUCTOR' },
  });

  const instructor2 = await prisma.user.create({
    data: { email: 'john@learnova.com', username: 'john_code', password: passwordHash, role: 'INSTRUCTOR' },
  });

  const learner1 = await prisma.user.create({
    data: { email: 'alice@learnova.com', username: 'alice_learner', password: passwordHash, role: 'LEARNER' },
  });

  const learner2 = await prisma.user.create({
    data: { email: 'bob@learnova.com', username: 'bob_learner', password: passwordHash, role: 'LEARNER' },
  });

  const learner3 = await prisma.user.create({
    data: { email: 'charlie@learnova.com', username: 'charlie_learner', password: passwordHash, role: 'LEARNER' },
  });

  // 2. CREATE COURSES (with Lessons, Quizzes, Attachments)
  console.log('Creating courses, lessons, attachments, quizzes, and questions...');

  const course1 = await prisma.course.create({
    data: {
      title: 'Fullstack Web Development Bootcamp',
      description: 'Master frontend and backend with HTML, CSS, JS, Node, and React.',
      isPublished: true,
      createdBy: instructor1.id,
      duration: '40 hours',
      lessonsCount: 3,
      tags: ['Web Dev', 'React', 'NodeJS', 'Fullstack'],
      views: 1250,
      imageUrl: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&auto=format&fit=crop&q=60',
      price: 99.99,
      visibility: 'everyone',
      accessRule: 'open',
      lessons: {
        create: [
          {
            title: 'HTML & CSS Basics',
            type: 'video',
            content: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
            status: 'completed',
            order: 0,
            description: 'Learn the foundational building blocks of the web.',
            duration: '45:00',
            attachments: {
              create: [
                { title: 'HTML Cheatsheet', type: 'pdf', url: '/cheatsheets/html.pdf' }
              ]
            }
          },
          {
            title: 'JavaScript Fundamentals',
            type: 'text',
            content: '<h2>Variables and Functions</h2><p>JS makes your page interactive...</p>',
            status: 'completed',
            order: 1,
            description: 'Variables, loops, and functions.',
            duration: '60:00',
          },
          {
            title: 'Backend with Node & Express',
            type: 'video',
            content: 'https://www.youtube.com/watch?v=M7lc1UVf-VE',
            status: 'not-started',
            order: 2,
            description: 'Build your first API.',
            duration: '120:00',
          }
        ]
      },
      quizzes: {
        create: [
          {
            title: 'JavaScript Essentials Quiz',
            rewards: { points: 100, badge: 'JS Rookie' },
            questions: {
              create: [
                { text: 'Which keyword is used to declare a block-scoped variable?', options: ['var', 'let', 'def', 'int'], answer: 1 },
                { text: 'Which operator checks both value and type?', options: ['==', '=', '===', '!='], answer: 2 },
                { text: 'What does "DOM" stand for?', options: ['Data Object Model', 'Document Object Model', 'Document Objective Model', 'Data Oriented Module'], answer: 1 }
              ]
            }
          }
        ]
      }
    },
    include: { quizzes: { include: { questions: true } } }
  });

  const course2 = await prisma.course.create({
    data: {
      title: 'UI/UX Design Masterclass',
      description: 'Learn Figma, wireframing, color theory, and modern design principles.',
      isPublished: true,
      createdBy: instructor1.id,
      duration: '15 hours',
      lessonsCount: 2,
      tags: ['Design', 'UI/UX', 'Figma'],
      views: 890,
      imageUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&auto=format&fit=crop&q=60',
      price: 49.99,
      visibility: 'everyone',
      accessRule: 'open',
      lessons: {
        create: [
          { title: 'Color Theory 101', type: 'video', content: 'https://www.youtube.com/watch?v=M7lc1UVf-VE', order: 0, duration: '20:00', description: 'Understanding colors.' },
          { title: 'Wireframing in Figma', type: 'text', content: '<h2>Wireframes</h2><p>Layouts without colors...</p>', order: 1, duration: '40:00' }
        ]
      },
      quizzes: {
        create: [
          {
            title: 'Color Theory Quiz',
            rewards: { points: 50 },
            questions: {
              create: [
                { text: 'Which of the following is a primary color?', options: ['Green', 'Orange', 'Blue', 'Purple'], answer: 2 },
                { text: 'What is a hex code?', options: ['A shape', 'A 6-digit color format', 'A font weight', 'A margin size'], answer: 1 }
              ]
            }
          }
        ]
      }
    },
    include: { quizzes: { include: { questions: true } } }
  });

  const course3 = await prisma.course.create({
    data: {
      title: 'Python for Data Science',
      description: 'Analyze data using Pandas, Numpy, and Matplotlib.',
      isPublished: true,
      createdBy: instructor2.id,
      duration: '25 hours',
      lessonsCount: 2,
      tags: ['Data Science', 'Python', 'Analytics'],
      views: 2100,
      imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=60',
      price: 120.00,
      visibility: 'everyone',
      accessRule: 'open',
      lessons: {
        create: [
          { title: 'Intro to Pandas', type: 'video', content: 'https://www.youtube.com/watch?v=M7lc1UVf-VE', order: 0, duration: '30:00' },
          { title: 'Data Cleaning', type: 'text', content: '<h2>Clean your data!</h2>', order: 1, duration: '45:00' }
        ]
      }
    }
  });

  const course4 = await prisma.course.create({
    data: {
      title: 'Digital Marketing Fundamentals',
      description: 'SEO, SEM, and Social Media Marketing strategies.',
      isPublished: false, // DRAFT course
      createdBy: instructor2.id,
      duration: '10 hours',
      lessonsCount: 0,
      tags: ['Marketing', 'SEO', 'Business'],
      views: 0,
      imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=60',
      price: 0,
      visibility: 'everyone',
      accessRule: 'open',
    }
  });

  // 3. CREATE ENROLLMENTS AND PROGRESS
  console.log('Creating enrollments and progress...');
  
  // Alice enrolls in Course 1 (completed) and Course 2 (in progress)
  await prisma.enrollment.create({
    data: { userId: learner1.id, courseId: course1.id, progress: 100, status: 'completed', timeSpent: 3600, startedAt: new Date(Date.now() - 10000000), completedAt: new Date() }
  });
  await prisma.enrollment.create({
    data: { userId: learner1.id, courseId: course2.id, progress: 50, status: 'in_progress', timeSpent: 1200, startedAt: new Date() }
  });

  // Bob enrolls in Course 1 (in progress) and Course 3 (yet to start)
  await prisma.enrollment.create({
    data: { userId: learner2.id, courseId: course1.id, progress: 33, status: 'in_progress', timeSpent: 500, startedAt: new Date() }
  });
  await prisma.enrollment.create({
    data: { userId: learner2.id, courseId: course3.id, progress: 0, status: 'yet_to_start', timeSpent: 0 }
  });

  // 4. CREATE QUIZ ATTEMPTS
  console.log('Creating quiz attempts...');

  // Alice takes Course 1 Quiz - Scored 3/3
  await prisma.quizAttempt.create({
    data: {
      userId: learner1.id,
      quizId: course1.quizzes[0].id,
      score: 3,
      total: 3,
      attemptNo: 1
    }
  });

  // Bob takes Course 1 Quiz - Scored 1/3, then retakes and scores 2/3
  await prisma.quizAttempt.create({
    data: { userId: learner2.id, quizId: course1.quizzes[0].id, score: 1, total: 3, attemptNo: 1 }
  });
  await prisma.quizAttempt.create({
    data: { userId: learner2.id, quizId: course1.quizzes[0].id, score: 2, total: 3, attemptNo: 2 }
  });

  // Alice takes Course 2 Quiz - Scored 2/2
  await prisma.quizAttempt.create({
    data: { userId: learner1.id, quizId: course2.quizzes[0].id, score: 2, total: 2, attemptNo: 1 }
  });

  // 5. CREATE REVIEWS
  console.log('Creating reviews...');
  
  await prisma.review.create({
    data: { userId: learner1.id, courseId: course1.id, rating: 5, comment: 'Hands down the best web dev course I have ever taken! Instructor was super clear.' }
  });

  await prisma.review.create({
    data: { userId: learner2.id, courseId: course1.id, rating: 4, comment: 'Really good, but some React topics were rushed. Overall solid.' }
  });

  await prisma.review.create({
    data: { userId: learner1.id, courseId: course2.id, rating: 5, comment: 'Figma wireframing module was a game changer for me.' }
  });

  // 6. CREATE DUMMY PASSWORD OTP
  console.log('Creating fake OTPs...');
  await prisma.passwordOtp.create({
    data: {
      email: learner3.email,
      otp: await bcrypt.hash('123456', 10),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    }
  });

  console.log('✅ ALL DEMO DATA SUCCESSFULLY SEEDED!');
  console.log('You can login with any of the emails (password: LearnerNova123!):');
  console.log('- admin@learnova.com');
  console.log('- jane@learnova.com (Instructor)');
  console.log('- john@learnova.com (Instructor)');
  console.log('- alice@learnova.com (Learner)');
  console.log('- bob@learnova.com (Learner)');
  console.log('- charlie@learnova.com (Learner)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
