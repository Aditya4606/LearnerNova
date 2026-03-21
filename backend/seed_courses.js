import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding fake course data...');

  // Get the instructor user
  const instructor = await prisma.user.findUnique({
    where: { email: 'instructor@learnova.com' }
  });

  if (!instructor) {
    console.error('Instructor not found. Run seed_users.js first.');
    process.exit(1);
  }

  // Delete all existing courses (which will cascade to lessons and quizzes)
  await prisma.course.deleteMany({});

  // Fake Course 1
  const course1 = await prisma.course.create({
    data: {
      title: 'Introduction to React & GSAP',
      description: 'Learn how to build stunning UI animations with React and GSAP.',
      isPublished: true,
      createdBy: instructor.id,
      duration: '4 hours',
      lessonsCount: 2,
      tags: ['React', 'Frontend', 'Animation'],
      views: 120,
      imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60',
      price: 0,
      visibility: 'everyone',
      accessRule: 'open',
      lessons: {
        create: [
          {
            title: 'Welcome to the Course',
            type: 'video',
            content: 'https://www.w3schools.com/html/mov_bbb.mp4',
            status: 'not-started',
            order: 0,
            description: 'A brief overview of what you will learn.',
            duration: '5:00',
            allowDownload: false,
          },
          {
            title: 'GSAP Basics',
            type: 'text',
            content: '<h2>Introduction to GSAP</h2><p>GSAP is a robust JavaScript toolset...</p>',
            status: 'not-started',
            order: 1,
            description: 'Learn the core tweening concepts.',
            duration: '15:00',
            allowDownload: true,
          }
        ]
      },
      quizzes: {
        create: [
          {
            title: 'GSAP Basics Quiz',
            rewards: { points: 50, badge: 'GSAP Beginner' },
            questions: {
              create: [
                {
                  text: 'Which method is used for simple animations from a starting state?',
                  options: ['gsap.to()', 'gsap.from()', 'gsap.set()', 'gsap.animate()'],
                  answer: 1,
                },
                {
                  text: 'What does timeline allow you to do?',
                  options: ['Sequence animations', 'Create SVG elements', 'Write CSS', 'Query the DOM'],
                  answer: 0,
                }
              ]
            }
          }
        ]
      }
    }
  });
  console.log(`Created Course: ${course1.title}`);

  // Fake Course 2
  const course2 = await prisma.course.create({
    data: {
      title: 'Advanced Backend with Node.js',
      description: 'Master Express, Prisma, and PostgreSQL in this comprehensive guide.',
      isPublished: true,
      createdBy: instructor.id,
      duration: '6 hours',
      lessonsCount: 1,
      tags: ['Backend', 'Node.js', 'Prisma'],
      views: 340,
      imageUrl: 'https://images.unsplash.com/photo-1618401471353-b98a520dcb28?w=800&auto=format&fit=crop&q=60',
      price: 49.99,
      visibility: 'everyone',
      accessRule: 'open',
      lessons: {
        create: [
          {
            title: 'Setting up Prisma',
            type: 'video',
            content: 'https://www.w3schools.com/html/mov_bbb.mp4',
            status: 'not-started',
            order: 0,
            description: 'How to init Prisma in a Node project.',
            duration: '10:00',
            allowDownload: false,
          }
        ]
      }
    }
  });
  console.log(`Created Course: ${course2.title}`);

  console.log('Fake course data seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
