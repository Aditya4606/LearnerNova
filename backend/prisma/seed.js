import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create an Instructor user
  const hashedPassword = await bcrypt.hash('Instructor@123', 10);
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@learnova.com' },
    update: {},
    create: {
      email: 'instructor@learnova.com',
      username: 'InstructorPro',
      password: hashedPassword,
      role: 'INSTRUCTOR',
    },
  });
  console.log('✅ Instructor created:', instructor.email);

  // 2. Create sample courses
  const coursesData = [
    {
      title: 'Basics of Odoo ERP',
      description: 'Learn the fundamentals of Odoo ERP — modules, workflows, and real-world business applications. Perfect for beginners entering the ERP domain.',
      tags: ['ERP', 'Odoo', 'Business'],
      isPublished: true,
      price: 0,
      imageUrl: null,
      duration: '4h',
      lessonsCount: 8,
    },
    {
      title: 'Advanced React Patterns',
      description: 'Master compound components, render props, custom hooks, and advanced state management patterns used in production-grade React apps.',
      tags: ['React', 'JavaScript', 'Frontend'],
      isPublished: true,
      price: 0,
      imageUrl: null,
      duration: '6h',
      lessonsCount: 12,
    },
    {
      title: 'Python for Data Science',
      description: 'Explore NumPy, Pandas, Matplotlib, and Scikit-learn. Build real data pipelines and ML models from scratch.',
      tags: ['Python', 'Data Science', 'ML'],
      isPublished: true,
      price: 499,
      imageUrl: null,
      duration: '10h',
      lessonsCount: 20,
    },
    {
      title: 'Node.js Backend Mastery',
      description: 'Build scalable REST APIs with Express, authentication, database integration, and deployment best practices.',
      tags: ['Node.js', 'Backend', 'API'],
      isPublished: true,
      price: 0,
      imageUrl: null,
      duration: '8h',
      lessonsCount: 15,
    },
    {
      title: 'UI/UX Design Fundamentals',
      description: 'Learn design thinking, wireframing, prototyping, and usability testing. Create beautiful, user-centered interfaces.',
      tags: ['Design', 'UI/UX', 'Figma'],
      isPublished: true,
      price: 299,
      imageUrl: null,
      duration: '5h',
      lessonsCount: 10,
    },
    {
      title: 'Advanced Odoo ORM & Customization',
      description: 'Deep dive into Odoo ORM, custom module development, inheritance patterns, and advanced business logic.',
      tags: ['Odoo', 'Python', 'ERP'],
      isPublished: true,
      price: 500,
      imageUrl: null,
      duration: '7h',
      lessonsCount: 14,
    },
  ];

  const courses = [];
  for (const courseData of coursesData) {
    const course = await prisma.course.create({
      data: {
        ...courseData,
        createdBy: instructor.id,
      },
    });
    courses.push(course);
    console.log(`✅ Course created: ${course.title}`);
  }

  // 3. Find or create a test learner
  const learnerPassword = await bcrypt.hash('Learner@123', 10);
  const learner = await prisma.user.upsert({
    where: { email: 'learner@learnova.com' },
    update: {},
    create: {
      email: 'learner@learnova.com',
      username: 'JaneLearner',
      password: learnerPassword,
      role: 'LEARNER',
    },
  });
  console.log('✅ Learner created:', learner.email);

  // 4. Create enrollments for the learner (varying progress)
  const enrollments = [
    { courseIndex: 0, progress: 60 },   // Basics of Odoo ERP — in progress
    { courseIndex: 1, progress: 0 },    // Advanced React — enrolled but not started
    { courseIndex: 3, progress: 100 },  // Node.js Backend — completed
  ];

  for (const enrollment of enrollments) {
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: learner.id,
          courseId: courses[enrollment.courseIndex].id,
        },
      },
      update: { progress: enrollment.progress },
      create: {
        userId: learner.id,
        courseId: courses[enrollment.courseIndex].id,
        progress: enrollment.progress,
      },
    });
    console.log(`✅ Enrollment: ${courses[enrollment.courseIndex].title} (${enrollment.progress}%)`);
  }

  console.log('\n🎉 Seeding complete!');
  console.log('---');
  console.log('Test Learner Login:');
  console.log('  Email:    learner@learnova.com');
  console.log('  Password: Learner@123');
  console.log('---');
  console.log('Instructor Login:');
  console.log('  Email:    instructor@learnova.com');
  console.log('  Password: Instructor@123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
