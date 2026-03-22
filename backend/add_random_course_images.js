import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function updateCourses() {
  console.log('Fetching all courses...');
  const courses = await prisma.course.findMany();
  console.log(`Found ${courses.length} courses to update.`);

  let updatedCount = 0;
  for (const course of courses) {
    // Generate a random image URL using faker, or custom picsum URL
    // Using unplash/picsum directly is often more reliable
    const randomId = faker.number.int({ min: 1, max: 1000 });
    const imageUrl = `https://picsum.photos/seed/${randomId}/800/600`;

    await prisma.course.update({
      where: { id: course.id },
      data: { imageUrl }
    });
    updatedCount++;
    if (updatedCount % 50 === 0) {
      console.log(`Updated ${updatedCount} courses...`);
    }
  }

  console.log(`Finished updating ${updatedCount} courses with random images.`);
}

updateCourses()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
