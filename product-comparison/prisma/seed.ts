import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Create some users
  await prisma.user.create({data: {id: 'user_3', shop: 'example.myshopify.com'}});
  // Create subscriptions
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

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect();
  });
