import { PrismaClient } from '@prisma/client';
import { hashPassword } from './utils/auth';
import { logger } from './utils/logger';

const prisma = new PrismaClient();

async function seed() {
  logger.info('Starting database seed...');

  // Clear existing data
  await prisma.payment.deleteMany();
  await prisma.loanSchedule.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.kYCDocument.deleteMany();
  await prisma.creditScoreHistory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.admin.deleteMany();

  // Create admin users
  const adminPassword = await hashPassword('Admin@123');
  
  const superAdmin = await prisma.admin.create({
    data: {
      email: 'admin@damafrica.com',
      passwordHash: adminPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  });

  const loanOfficer = await prisma.admin.create({
    data: {
      email: 'loans@damafrica.com',
      passwordHash: adminPassword,
      name: 'Loan Officer',
      role: 'LOAN_OFFICER',
      status: 'ACTIVE',
    },
  });

  logger.info('Created admin users');

  // Create test drivers
  const driverPassword = await hashPassword('Driver@123');

  const driver1 = await prisma.user.create({
    data: {
      email: 'kouame@example.ci',
      phone: '+225 07 12 34 56 78',
      passwordHash: driverPassword,
      name: 'Kouamé Yao',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      kycStatus: 'VERIFIED',
      creditScore: 750,
      creditRating: 'B',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const driver2 = await prisma.user.create({
    data: {
      email: 'ama@example.ci',
      phone: '+225 05 98 76 54 32',
      passwordHash: driverPassword,
      name: 'Ama Koné',
      city: 'Abidjan',
      country: 'Côte d\'Ivoire',
      kycStatus: 'PENDING',
      creditScore: 500,
      creditRating: 'C',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  const driver3 = await prisma.user.create({
    data: {
      email: 'kofi@example.ci',
      phone: '+225 01 23 45 67 89',
      passwordHash: driverPassword,
      name: 'Kofi Mensah',
      city: 'Bouaké',
      country: 'Côte d\'Ivoire',
      kycStatus: 'VERIFIED',
      creditScore: 850,
      creditRating: 'A',
      emailVerified: true,
      phoneVerified: true,
    },
  });

  logger.info('Created test drivers');

  // Create credit score history
  await prisma.creditScoreHistory.createMany({
    data: [
      {
        userId: driver1.id,
        score: 750,
        rating: 'B',
        changeReason: 'Initial registration',
        paymentHistoryScore: 800,
        loanUtilizationScore: 700,
        accountAgeScore: 600,
        drivingPerformanceScore: 750,
        kycCompletenessScore: 1000,
      },
      {
        userId: driver2.id,
        score: 500,
        rating: 'C',
        changeReason: 'Initial registration',
        paymentHistoryScore: 500,
        loanUtilizationScore: 800,
        accountAgeScore: 200,
        drivingPerformanceScore: 500,
        kycCompletenessScore: 300,
      },
      {
        userId: driver3.id,
        score: 850,
        rating: 'A',
        changeReason: 'Initial registration',
        paymentHistoryScore: 900,
        loanUtilizationScore: 800,
        accountAgeScore: 800,
        drivingPerformanceScore: 850,
        kycCompletenessScore: 1000,
      },
    ],
  });

  // Create KYC documents for verified drivers
  await prisma.kYCDocument.createMany({
    data: [
      {
        userId: driver1.id,
        documentType: 'ID_CARD',
        documentNumber: 'CI123456789',
        frontImageUrl: 'https://example.com/kyc/id-front.jpg',
        backImageUrl: 'https://example.com/kyc/id-back.jpg',
        status: 'APPROVED',
        reviewedById: superAdmin.id,
        reviewedAt: new Date(),
      },
      {
        userId: driver1.id,
        documentType: 'DRIVERS_LICENSE',
        documentNumber: 'DL987654321',
        frontImageUrl: 'https://example.com/kyc/license-front.jpg',
        backImageUrl: 'https://example.com/kyc/license-back.jpg',
        status: 'APPROVED',
        reviewedById: superAdmin.id,
        reviewedAt: new Date(),
      },
      {
        userId: driver1.id,
        documentType: 'SELFIE',
        frontImageUrl: 'https://example.com/kyc/selfie.jpg',
        status: 'APPROVED',
        reviewedById: superAdmin.id,
        reviewedAt: new Date(),
      },
      {
        userId: driver3.id,
        documentType: 'ID_CARD',
        documentNumber: 'CI111222333',
        frontImageUrl: 'https://example.com/kyc/id-front-3.jpg',
        status: 'APPROVED',
        reviewedById: superAdmin.id,
        reviewedAt: new Date(),
      },
      {
        userId: driver3.id,
        documentType: 'DRIVERS_LICENSE',
        documentNumber: 'DL444555666',
        frontImageUrl: 'https://example.com/kyc/license-front-3.jpg',
        status: 'APPROVED',
        reviewedById: superAdmin.id,
        reviewedAt: new Date(),
      },
      {
        userId: driver3.id,
        documentType: 'SELFIE',
        frontImageUrl: 'https://example.com/kyc/selfie-3.jpg',
        status: 'APPROVED',
        reviewedById: superAdmin.id,
        reviewedAt: new Date(),
      },
    ],
  });

  logger.info('Created KYC documents');

  // Create sample loans
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 26 * 7); // 26 weeks

  const activeLoan = await prisma.loan.create({
    data: {
      userId: driver1.id,
      amount: 500000,
      interestRate: 15.0,
      termWeeks: 26,
      totalRepayment: 537500,
      weeklyPayment: 20673,
      purpose: 'Vehicle purchase for taxi business',
      status: 'ACTIVE',
      approvedById: loanOfficer.id,
      approvedAt: new Date(),
      disbursedAt: new Date(),
      startDate,
      endDate,
      amountPaid: 103365, // 5 weeks paid
    },
  });

  logger.info('Created sample loan');

  // Create payment schedule for active loan
  const scheduleData = [];
  for (let week = 1; week <= 26; week++) {
    const dueDate = new Date(startDate);
    dueDate.setDate(dueDate.getDate() + week * 7);

    scheduleData.push({
      loanId: activeLoan.id,
      weekNumber: week,
      dueDate,
      amountDue: 20673,
      amountPaid: week <= 5 ? 20673 : 0,
      status: week <= 5 ? 'PAID' : 'PENDING',
      paidAt: week <= 5 ? new Date() : null,
    });
  }

  await prisma.loanSchedule.createMany({ data: scheduleData });

  // Create sample payments
  const paymentData = [];
  for (let i = 1; i <= 5; i++) {
    paymentData.push({
      userId: driver1.id,
      loanId: activeLoan.id,
      amount: 20673,
      method: 'WAVE',
      reference: `WAVE-${Date.now()}-${i}`,
      status: 'SUCCESS',
      processedAt: new Date(),
    });
  }

  await prisma.payment.createMany({ data: paymentData });

  logger.info('Created payment schedule and payments');

  logger.info('Database seeded successfully');
  logger.info('Admin login: admin@damafrica.com / Admin@123');
  logger.info('Driver login: kouame@example.ci / Driver@123');
}

seed()
  .catch((e) => {
    logger.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
