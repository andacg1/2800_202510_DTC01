import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
const prisma = new PrismaClient();

async function seedUsers(count: number) {
  for (let i = 0; i < count; i++) {
    await prisma.user.create({
      data: {
        id: faker.string.uuid(),
        shop: `${faker.internet.domainWord()}.myshopify.com`,
        userName: faker.internet.userName(),
      },
    });
  }

  console.log(`${count} users created.`);
}

async function seedSubscriptions() {
  await prisma.subscription.createMany({
    data: [
      {
        id: 1,
        displayName: 'Free Trial',
        tier: 'freeTrial',
        cost: {
          "amount": "0.0",
          "currency_code": "CAD"
        },
        benefits: 'All features of paid plans for 30 days'
      },
      {
        id: 2,
        displayName: 'Launch Plan',
        tier: 'launch',
        cost: {
          "amount": "15.99",
          "currency_code": "CAD"
        },
        benefits: 'Basic support'
      },
      {
        id: 3,
        displayName: 'Growth Plan',
        tier: 'growth',
        cost: {
          "amount": "30.99",
          "currency_code": "CAD"
        },
        benefits: 'Priority basic support, Advanced analytics'
      },
      {
        id: 4,
        displayName: 'Enterprise Plan',
        tier: 'enterprise',
        cost: {
          "amount": "99.99",
          "currency_code": "CAD"
        },
        benefits: 'All features, Premium support, Advanced analytics'
      },
    ],
  });
}

async function main() {
  // Create some users
  await seedUsers(20)
  // Create subscriptions
  await seedSubscriptions()
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  });
