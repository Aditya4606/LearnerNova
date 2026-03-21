import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial users...');
  
  // Need to use the same salt rounds as in hashPassword.js. Let's assume 10.
  const passwordHash = await bcrypt.hash('LearnerNova123!', 10);
  
  // 1. Admin
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
  console.log(`Created admin: ${admin.email}`);

  // 2. Instructor
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
  console.log(`Created instructor: ${instructor.email}`);

  // 3. Learner
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
  console.log(`Created learner: ${learner.email}`);

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
