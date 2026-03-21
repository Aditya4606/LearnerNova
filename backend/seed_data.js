import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({
    include: {
      lessons: true,
      quizzes: true,
    }
  });
  
  console.log(`Found ${courses.length} courses to process.`);

  for (const course of courses) {
    console.log(`\nProcessing course: "${course.title}" (${course.id})`);

    // Add 3 sample lessons if less than 3 exist
    if (course.lessons.length < 3) {
      const lessonsToAdd = 3 - course.lessons.length;
      console.log(`Adding ${lessonsToAdd} sample lessons...`);
      
      const sampleLessons = [
        {
          title: "Introduction & Essentials",
          type: "video",
          content: "https://vimeo.com/76979871",
          description: "An overview of the core principles and essential tools covered in this course.",
          duration: "12:30",
          order: course.lessons.length
        },
        {
          title: "Core Architecture Patterns",
          type: "video",
          content: "https://vimeo.com/76979871",
          description: "Understanding the underlying architecture that makes this technology powerful.",
          duration: "18:45",
          order: course.lessons.length + 1
        },
        {
          title: "Production Deployment Strategies",
          type: "video",
          content: "https://vimeo.com/76979871",
          description: "Best practices for deploying and scaling your application in a production environment.",
          duration: "22:15",
          order: course.lessons.length + 2
        }
      ].slice(0, lessonsToAdd);

      for (const lesson of sampleLessons) {
        await prisma.lesson.create({
          data: {
            ...lesson,
            courseId: course.id
          }
        });
      }

      await prisma.course.update({
        where: { id: course.id },
        data: { lessonsCount: { increment: lessonsToAdd } }
      });
    } else {
      console.log("Course already has enough lessons.");
    }

    // Add a quiz if none exist
    if (course.quizzes.length === 0) {
      console.log("Adding a sample quiz...");
      await prisma.quiz.create({
        data: {
          title: "Module Mastery Check",
          courseId: course.id,
          questions: {
            create: [
              {
                text: `Which of the following describes the primary ecosystem of ${course.title}?`,
                options: ["Enterprise Solutions", "Community Driven", "Proprietary Only", "Legacy Systems"],
                answer: 1
              },
              {
                text: "What is the recommended approach for state management in this module?",
                options: ["Direct Mutation", "Immutable Structures", "Shared Globals", "No state needed"],
                answer: 1
              },
              {
                text: "Is this course primarily designed for advanced architects?",
                options: ["Yes, specialized focus", "No, beginner friendly"],
                answer: 0
              }
            ]
          }
        }
      });
    } else {
      console.log("Course already has a quiz.");
    }
  }

  console.log("\nSeeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
