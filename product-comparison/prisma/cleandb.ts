import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function cleanDB() {
  await prisma.session.deleteMany();
  await prisma.metafields.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();


  console.log("Database cleaned.");
}

cleanDB()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  });
