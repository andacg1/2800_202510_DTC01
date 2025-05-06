import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
const prisma = new PrismaClient();

async function seedUsers(count: number) {
  for (let i = 0; i < count; i++) {
    await prisma.user.create({
      data: {
        id: faker.string.uuid(),
        shop: `${faker.internet.domainWord()}.myshopify.com`,
        userName: faker.internet.username(),
      },
    });
  }

  console.log(`${count} users created.`);
}

async function seedSessions(count: number) {
  for (let i = 0; i < count; i++) {
    await prisma.session.create({
      data: {
        id: faker.string.uuid(),
        shop: `${faker.internet.domainWord()}.myshopify.com`,
        state: faker.lorem.word(),
        isOnline: faker.datatype.boolean(),
        scope: faker.lorem.words(2),
        expires: faker.date.future(),
        accessToken: faker.string.alphanumeric(20),
        userId: faker.number.int({ min: 1, max: 100 }),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        email: faker.internet.email(),
        accountOwner: faker.datatype.boolean(),
        locale: faker.location.countryCode(),
        collaborator: faker.datatype.boolean(),
        emailVerified: faker.datatype.boolean(),
      },
    });
  }

  console.log(`${count} sessions created.`);
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
  console.log(`Subscriptions created.`);
}

async function main() {
  // Create some users
  await seedUsers(10)
  // Create subscriptions
  await seedSubscriptions()
  // Create some sessions
  await seedSessions(10)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  });
