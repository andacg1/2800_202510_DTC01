import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create some users
  await prisma.user.create({data: {id: 'user_2', shop: 'example.myshopify.com'}});
  // Create sessions, subscriptions, etc.
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  });
