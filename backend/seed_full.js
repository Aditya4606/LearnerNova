import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting full seed...');

  // 1. Create Users
  const passwordHash = await bcrypt.hash('LearnerNova123!', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@learnova.com' },
    update: {},
    create: {
      email: 'admin@learnova.com',
      username: 'admin',
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@learnova.com' },
    update: {},
    create: {
      email: 'instructor@learnova.com',
      username: 'instructor',
      password: passwordHash,
      role: 'INSTRUCTOR',
    },
  });

  const learner = await prisma.user.upsert({
    where: { email: 'learner@learnova.com' },
    update: {},
    create: {
      email: 'learner@learnova.com',
      username: 'learner',
      password: passwordHash,
      role: 'LEARNER',
    },
  });

  console.log('Users created/verified.');

  // 2. Create Courses
  const coursesData = [
    {
      title: 'Advanced React Patterns',
      description: 'Master advanced React patterns including Compound Components, Render Props, and HOCs.',
      duration: '4.5h',
      lessonsCount: 5,
      tags: ['React', 'Frontend', 'Advanced'],
      isPublished: true,
      createdBy: instructor.id,
      imageUrl: '/uploads/course-1.jpg'
    },
    {
      title: 'Introduction to WebGL',
      description: 'Learn the basics of 3D rendering in the browser using WebGL.',
      duration: '2h',
      lessonsCount: 8,
      tags: ['WebGL', 'Graphics', 'JavaScript'],
      isPublished: true,
      createdBy: instructor.id,
      imageUrl: '/uploads/course-2.jpg'
    },
    {
      title: 'Design Systems Architecture',
      description: 'Building scalable and maintainable design systems for large applications.',
      duration: '6h',
      lessonsCount: 12,
      tags: ['Design', 'Architecture', 'UI/UX'],
      isPublished: true,
      createdBy: instructor.id,
      imageUrl: '/uploads/course-3.jpg'
    },
    {
      title: 'CSS Animations Mastery',
      description: 'Create stunning animations using only CSS.',
      duration: '3h',
      lessonsCount: 6,
      tags: ['CSS', 'Animations', 'Frontend'],
      isPublished: false,
      createdBy: instructor.id,
      imageUrl: '/uploads/course-4.jpg'
    }
  ];

  for (const course of coursesData) {
    const createdCourse = await prisma.course.create({
      data: course
    });
    console.log(`Created course: ${createdCourse.title}`);

    // Create some sample lessons for each course
    await prisma.lesson.createMany({
      data: [
        {
          title: 'Introduction',
          content: 'Welcome to the course!',
          type: 'video',
          status: 'not-started',
          order: 1,
          courseId: createdCourse.id
        },
        {
          title: 'Core Concepts',
          content: 'Let\'s dive into the core concepts.',
          type: 'video',
          status: 'not-started',
          order: 2,
          courseId: createdCourse.id
        }
      ]
    });
  }

  console.log('Full seed finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
