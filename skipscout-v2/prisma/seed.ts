import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed credit packages
  await prisma.creditPackage.upsert({
    where: { id: 'starter' },
    update: {},
    create: {
      id: 'starter',
      name: 'Starter',
      credits: 500,
      price: 25,
      stripePriceId: 'price_starter_placeholder',
      active: true,
    },
  });

  await prisma.creditPackage.upsert({
    where: { id: 'pro' },
    update: {},
    create: {
      id: 'pro',
      name: 'Pro',
      credits: 2000,
      price: 75,
      stripePriceId: 'price_pro_placeholder',
      active: true,
    },
  });

  await prisma.creditPackage.upsert({
    where: { id: 'business' },
    update: {},
    create: {
      id: 'business',
      name: 'Business',
      credits: 10000,
      price: 299,
      stripePriceId: 'price_business_placeholder',
      active: true,
    },
  });

  console.log('Seeded credit packages.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
