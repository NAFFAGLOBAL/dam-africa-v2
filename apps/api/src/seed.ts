import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashPwd(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function main() {
  console.log('Nettoyage de la base de données...');
  await prisma.geofenceAlert.deleteMany();
  await prisma.geofenceZone.deleteMany();
  await prisma.vehicleTracking.deleteMany();
  await prisma.drivingBehavior.deleteMany();
  await prisma.accidentNote.deleteMany();
  await prisma.accidentMedia.deleteMany();
  await prisma.accidentReport.deleteMany();
  await prisma.ticketMessage.deleteMany();
  await prisma.supportTicket.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.driverBadge.deleteMany();
  await prisma.badgeDefinition.deleteMany();
  await prisma.incomeRecord.deleteMany();
  await prisma.contractMilestone.deleteMany();
  await prisma.loanSchedule.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.rental.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.creditScoreHistory.deleteMany();
  await prisma.vehicleFavorite.deleteMany();
  await prisma.maintenanceRecord.deleteMany();
  await prisma.kYCDocument.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.featureFlag.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.admin.deleteMany();
  await prisma.user.deleteMany();
  await prisma.customer.deleteMany();

  console.log('Création des données de test...');

  // Customers
  const customer1 = await prisma.customer.create({
    data: {
      name: 'DAMFlotte Abidjan',
      code: 'DAM-ABJ',
      email: 'abidjan@damflotte.ci',
      phone: '+22501020304',
      address: 'Cocody, Abidjan, Côte d\'Ivoire',
      isActive: true,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'DAMFlotte Bouaké',
      code: 'DAM-BKE',
      email: 'bouake@damflotte.ci',
      phone: '+22505060708',
      address: 'Centre-ville, Bouaké, Côte d\'Ivoire',
      isActive: true,
    },
  });

  // Admins
  const superAdmin = await prisma.admin.create({
    data: {
      email: 'admin@damflotte.ci',
      passwordHash: await hashPwd('Admin@2024'),
      firstName: 'Kouadio',
      lastName: 'N\'Guessan',
      role: 'SUPER_ADMIN',
      phone: '+22507000001',
      customerId: customer1.id,
    },
  });

  await prisma.admin.create({
    data: {
      email: 'finance@damflotte.ci',
      passwordHash: await hashPwd('Finance@2024'),
      firstName: 'Aminata',
      lastName: 'Koné',
      role: 'FINANCE',
      phone: '+22507000002',
      customerId: customer1.id,
    },
  });

  await prisma.admin.create({
    data: {
      email: 'fleet@damflotte.ci',
      passwordHash: await hashPwd('Fleet@2024'),
      firstName: 'Ibrahim',
      lastName: 'Diallo',
      role: 'FLEET_MANAGER',
      phone: '+22507000003',
      customerId: customer1.id,
    },
  });

  await prisma.admin.create({
    data: {
      email: 'loans@damflotte.ci',
      passwordHash: await hashPwd('Loans@2024'),
      firstName: 'Fatou',
      lastName: 'Bamba',
      role: 'LOAN_OFFICER',
      phone: '+22507000004',
      customerId: customer1.id,
    },
  });

  // Drivers
  const driver1 = await prisma.user.create({
    data: {
      email: 'moussa.traore@email.ci',
      phone: '+22501234567',
      passwordHash: await hashPwd('Driver@2024'),
      firstName: 'Moussa',
      lastName: 'Traoré',
      dateOfBirth: new Date('1990-05-15'),
      city: 'Abidjan',
      licenseNumber: 'CI-2020-12345',
      status: 'ACTIVE',
      isVerified: true,
      customerId: customer1.id,
    },
  });

  const driver2 = await prisma.user.create({
    data: {
      email: 'awa.coulibaly@email.ci',
      phone: '+22501234568',
      passwordHash: await hashPwd('Driver@2024'),
      firstName: 'Awa',
      lastName: 'Coulibaly',
      dateOfBirth: new Date('1988-03-22'),
      city: 'Abidjan',
      licenseNumber: 'CI-2019-67890',
      status: 'ACTIVE',
      isVerified: true,
      customerId: customer1.id,
    },
  });

  const driver3 = await prisma.user.create({
    data: {
      email: 'yao.koffi@email.ci',
      phone: '+22501234569',
      passwordHash: await hashPwd('Driver@2024'),
      firstName: 'Yao',
      lastName: 'Koffi',
      dateOfBirth: new Date('1995-11-08'),
      city: 'Bouaké',
      status: 'PENDING',
      isVerified: false,
      customerId: customer2.id,
    },
  });

  const driver4 = await prisma.user.create({
    data: {
      email: 'sekou.diaby@email.ci',
      phone: '+22501234570',
      passwordHash: await hashPwd('Driver@2024'),
      firstName: 'Sékou',
      lastName: 'Diaby',
      dateOfBirth: new Date('1992-07-30'),
      city: 'Abidjan',
      licenseNumber: 'CI-2021-11111',
      status: 'ACTIVE',
      isVerified: true,
      customerId: customer1.id,
    },
  });

  // KYC Documents
  await prisma.kYCDocument.createMany({
    data: [
      { userId: driver1.id, type: 'NATIONAL_ID', fileUrl: '/uploads/kyc/moussa-id.jpg', fileName: 'moussa-id.jpg', status: 'APPROVED', reviewedBy: superAdmin.id, reviewedAt: new Date() },
      { userId: driver1.id, type: 'DRIVERS_LICENSE', fileUrl: '/uploads/kyc/moussa-license.jpg', fileName: 'moussa-license.jpg', status: 'APPROVED', reviewedBy: superAdmin.id, reviewedAt: new Date() },
      { userId: driver2.id, type: 'NATIONAL_ID', fileUrl: '/uploads/kyc/awa-id.jpg', fileName: 'awa-id.jpg', status: 'APPROVED', reviewedBy: superAdmin.id, reviewedAt: new Date() },
      { userId: driver3.id, type: 'NATIONAL_ID', fileUrl: '/uploads/kyc/yao-id.jpg', fileName: 'yao-id.jpg', status: 'PENDING' },
      { userId: driver3.id, type: 'DRIVERS_LICENSE', fileUrl: '/uploads/kyc/yao-license.jpg', fileName: 'yao-license.jpg', status: 'PENDING' },
    ],
  });

  // Vehicles
  const vehicle1 = await prisma.vehicle.create({
    data: {
      registrationNo: 'ABJ-1234-CI',
      make: 'Toyota',
      model: 'Corolla',
      year: 2022,
      color: 'Blanc',
      fuelType: 'Essence',
      transmission: 'Automatique',
      seatingCapacity: 5,
      status: 'RENTED',
      dailyRate: 15000,
      weeklyRate: 90000,
      monthlyRate: 350000,
      purchasePrice: 12000000,
      currentValue: 10000000,
      mileage: 45000,
      gpsDeviceId: 'GPS-001',
      customerId: customer1.id,
    },
  });

  const vehicle2 = await prisma.vehicle.create({
    data: {
      registrationNo: 'ABJ-5678-CI',
      make: 'Hyundai',
      model: 'Accent',
      year: 2023,
      color: 'Gris',
      fuelType: 'Essence',
      transmission: 'Manuelle',
      seatingCapacity: 5,
      status: 'AVAILABLE',
      dailyRate: 12000,
      weeklyRate: 72000,
      monthlyRate: 280000,
      purchasePrice: 9000000,
      currentValue: 8500000,
      mileage: 15000,
      gpsDeviceId: 'GPS-002',
      customerId: customer1.id,
    },
  });

  const vehicle3 = await prisma.vehicle.create({
    data: {
      registrationNo: 'BKE-0001-CI',
      make: 'Kia',
      model: 'Rio',
      year: 2021,
      color: 'Noir',
      fuelType: 'Essence',
      transmission: 'Manuelle',
      seatingCapacity: 5,
      status: 'AVAILABLE',
      dailyRate: 10000,
      monthlyRate: 250000,
      purchasePrice: 7500000,
      currentValue: 6000000,
      mileage: 78000,
      customerId: customer2.id,
    },
  });

  await prisma.vehicle.create({
    data: {
      registrationNo: 'ABJ-9012-CI',
      make: 'Toyota',
      model: 'Yaris',
      year: 2023,
      color: 'Bleu',
      fuelType: 'Essence',
      transmission: 'Automatique',
      seatingCapacity: 5,
      status: 'MAINTENANCE',
      dailyRate: 14000,
      monthlyRate: 320000,
      purchasePrice: 11000000,
      currentValue: 10500000,
      mileage: 8000,
      gpsDeviceId: 'GPS-004',
      customerId: customer1.id,
    },
  });

  // Maintenance records
  await prisma.maintenanceRecord.create({
    data: {
      vehicleId: vehicle1.id,
      type: 'Vidange',
      description: 'Vidange huile moteur + filtre',
      cost: 35000,
      mileageAt: 40000,
      performedBy: 'Garage Central Abidjan',
      performedAt: new Date('2024-01-15'),
      nextDueAt: new Date('2024-07-15'),
      nextDueMileage: 50000,
    },
  });

  // Rentals
  const rental1 = await prisma.rental.create({
    data: {
      userId: driver1.id,
      vehicleId: vehicle1.id,
      customerId: customer1.id,
      status: 'ACTIVE',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-06-30'),
      dailyRate: 15000,
      totalCost: 2700000,
      deposit: 100000,
      approvedBy: superAdmin.id,
      approvedAt: new Date('2024-01-01'),
    },
  });

  // Contracts (Rent-to-Own)
  const contract1 = await prisma.contract.create({
    data: {
      userId: driver4.id,
      vehicleId: vehicle2.id,
      customerId: customer1.id,
      type: 'RENT_TO_OWN',
      status: 'ACTIVE',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2026-12-31'),
      totalValue: 12000000,
      monthlyPayment: 350000,
      downPayment: 500000,
      totalInstallments: 36,
      paidInstallments: 6,
      paidAmount: 2600000,
      ownershipThreshold: 0.8,
      signedAt: new Date('2024-01-01'),
    },
  });

  await prisma.contractMilestone.createMany({
    data: [
      { contractId: contract1.id, title: '25% payé', percentage: 25, isCompleted: true, completedAt: new Date('2024-06-01') },
      { contractId: contract1.id, title: '50% payé', percentage: 50 },
      { contractId: contract1.id, title: '75% payé', percentage: 75 },
      { contractId: contract1.id, title: 'Transfert de propriété', percentage: 100 },
    ],
  });

  // Loans
  const loan1 = await prisma.loan.create({
    data: {
      userId: driver1.id,
      customerId: customer1.id,
      amount: 2000000,
      interestRate: 12,
      termMonths: 12,
      monthlyPayment: 185000,
      totalRepayment: 2220000,
      purpose: 'Achat de pièces de rechange',
      status: 'ACTIVE',
      creditScore: 720,
      creditRating: 'B',
      approvedBy: superAdmin.id,
      approvedAt: new Date('2024-01-10'),
      disbursedAt: new Date('2024-01-15'),
      startDate: new Date('2024-01-15'),
      endDate: new Date('2025-01-15'),
      paidAmount: 925000,
    },
  });

  // Loan schedule (first 6 months)
  for (let i = 1; i <= 12; i++) {
    const dueDate = new Date('2024-01-15');
    dueDate.setMonth(dueDate.getMonth() + i);
    await prisma.loanSchedule.create({
      data: {
        loanId: loan1.id,
        installment: i,
        dueDate,
        amount: 185000,
        principal: 165000,
        interest: 20000,
        paidAmount: i <= 5 ? 185000 : 0,
        paidAt: i <= 5 ? dueDate : null,
        status: i <= 5 ? 'COMPLETED' : 'PENDING',
      },
    });
  }

  // Credit score history
  await prisma.creditScoreHistory.createMany({
    data: [
      {
        userId: driver1.id,
        score: 720,
        rating: 'B',
        paymentScore: 800,
        incomeScore: 700,
        drivingScore: 650,
        maxLoanAmount: 3000000,
        interestRate: 12,
        breakdown: { weights: { payment: 0.4, income: 0.35, driving: 0.25 } },
      },
      {
        userId: driver2.id,
        score: 580,
        rating: 'C',
        paymentScore: 600,
        incomeScore: 550,
        drivingScore: 600,
        maxLoanAmount: 1500000,
        interestRate: 15,
        breakdown: { weights: { payment: 0.4, income: 0.35, driving: 0.25 } },
      },
      {
        userId: driver4.id,
        score: 850,
        rating: 'A',
        paymentScore: 900,
        incomeScore: 800,
        drivingScore: 850,
        maxLoanAmount: 5000000,
        interestRate: 8,
        breakdown: { weights: { payment: 0.4, income: 0.35, driving: 0.25 } },
      },
    ],
  });

  // Payments
  for (let i = 1; i <= 5; i++) {
    const paidAt = new Date('2024-01-15');
    paidAt.setMonth(paidAt.getMonth() + i);
    await prisma.payment.create({
      data: {
        userId: driver1.id,
        loanId: loan1.id,
        amount: 185000,
        currency: 'XOF',
        method: 'WAVE',
        status: 'COMPLETED',
        reference: `PAY-LOAN-${i}-${Date.now()}`,
        phone: driver1.phone,
        paidAt,
        description: `Échéance prêt ${i}/12`,
      },
    });
  }

  // Rental payments
  for (let i = 1; i <= 3; i++) {
    const paidAt = new Date('2024-01-01');
    paidAt.setMonth(paidAt.getMonth() + i);
    await prisma.payment.create({
      data: {
        userId: driver1.id,
        rentalId: rental1.id,
        amount: 350000,
        currency: 'XOF',
        method: 'WAVE',
        status: 'COMPLETED',
        reference: `PAY-RENT-${i}-${Date.now()}`,
        phone: driver1.phone,
        paidAt,
        description: `Loyer mensuel ${i}`,
      },
    });
  }

  // Income records
  const incomeData = [];
  for (let i = 0; i < 90; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    if (Math.random() > 0.2) {
      incomeData.push({
        userId: driver1.id,
        source: 'YANGO' as const,
        amount: Math.round(15000 + Math.random() * 25000),
        currency: 'XOF',
        date,
        trips: Math.round(5 + Math.random() * 15),
        hours: Math.round(6 + Math.random() * 6),
        isVerified: i > 30,
      });
    }
    if (Math.random() > 0.3) {
      incomeData.push({
        userId: driver2.id,
        source: 'YANGO' as const,
        amount: Math.round(12000 + Math.random() * 20000),
        currency: 'XOF',
        date,
        trips: Math.round(4 + Math.random() * 12),
        hours: Math.round(5 + Math.random() * 7),
        isVerified: i > 30,
      });
    }
  }
  await prisma.incomeRecord.createMany({ data: incomeData });

  // Driving behavior
  await prisma.drivingBehavior.createMany({
    data: [
      {
        vehicleId: vehicle1.id,
        driverId: driver1.id,
        harshBraking: 3,
        harshAccel: 2,
        speeding: 1,
        idling: 15,
        totalDistance: 1200,
        totalDuration: 45,
        safetyScore: 85,
        periodStart: new Date('2024-03-01'),
        periodEnd: new Date('2024-03-31'),
      },
      {
        vehicleId: vehicle1.id,
        driverId: driver1.id,
        harshBraking: 1,
        harshAccel: 1,
        speeding: 0,
        idling: 10,
        totalDistance: 1350,
        totalDuration: 48,
        safetyScore: 92,
        periodStart: new Date('2024-04-01'),
        periodEnd: new Date('2024-04-30'),
      },
    ],
  });

  // Badge definitions
  const badges = await prisma.badgeDefinition.createMany({
    data: [
      { code: 'FIRST_TRIP', name: 'Premier Trajet', description: 'A effectué son premier trajet', category: 'milestone', criteria: { trips: 1 } },
      { code: 'HUNDRED_TRIPS', name: 'Centurion', description: 'A effectué 100 trajets', category: 'milestone', criteria: { trips: 100 } },
      { code: 'SAFE_DRIVER', name: 'Conducteur Prudent', description: 'Score de sécurité > 90 pendant 30 jours', category: 'safety', criteria: { safetyScore: 90, days: 30 } },
      { code: 'ON_TIME_PAYER', name: 'Payeur Ponctuel', description: 'Tous les paiements à temps pendant 3 mois', category: 'payment', criteria: { onTimeMonths: 3 } },
      { code: 'TOP_EARNER', name: 'Top Revenu', description: 'Top 10% des revenus du mois', category: 'income', criteria: { percentile: 10 } },
      { code: 'VERIFIED_DRIVER', name: 'Vérifié', description: 'KYC complètement vérifié', category: 'kyc', criteria: { verified: true } },
    ],
  });

  // Award some badges
  const badgeDefs = await prisma.badgeDefinition.findMany();
  const firstTripBadge = badgeDefs.find((b) => b.code === 'FIRST_TRIP');
  const verifiedBadge = badgeDefs.find((b) => b.code === 'VERIFIED_DRIVER');
  const safeDriverBadge = badgeDefs.find((b) => b.code === 'SAFE_DRIVER');

  if (firstTripBadge && verifiedBadge && safeDriverBadge) {
    await prisma.driverBadge.createMany({
      data: [
        { userId: driver1.id, badgeId: firstTripBadge.id },
        { userId: driver1.id, badgeId: verifiedBadge.id },
        { userId: driver1.id, badgeId: safeDriverBadge.id },
        { userId: driver2.id, badgeId: firstTripBadge.id },
        { userId: driver2.id, badgeId: verifiedBadge.id },
        { userId: driver4.id, badgeId: firstTripBadge.id },
        { userId: driver4.id, badgeId: verifiedBadge.id },
      ],
    });
  }

  // Notifications
  await prisma.notification.createMany({
    data: [
      { userId: driver1.id, type: 'PAYMENT_DUE', title: 'Échéance de prêt', body: 'Votre prochaine échéance de 185 000 FCFA est due le 15 du mois.' },
      { userId: driver1.id, type: 'BADGE_EARNED', title: 'Nouveau badge !', body: 'Félicitations ! Vous avez obtenu le badge "Conducteur Prudent".' },
      { userId: driver3.id, type: 'KYC_STATUS', title: 'Documents en attente', body: 'Vos documents KYC sont en cours de vérification.' },
      { userId: driver2.id, type: 'SYSTEM', title: 'Maintenance programmée', body: 'Une maintenance du système est prévue ce weekend.' },
    ],
  });

  // Support tickets
  const ticket1 = await prisma.supportTicket.create({
    data: {
      userId: driver2.id,
      subject: 'Problème de paiement Wave',
      description: 'Mon paiement Wave a été débité mais n\'apparaît pas dans l\'application.',
      status: 'OPEN',
      priority: 'HIGH',
      category: 'paiement',
    },
  });

  await prisma.ticketMessage.create({
    data: {
      ticketId: ticket1.id,
      senderId: driver2.id,
      senderType: 'user',
      content: 'Le paiement de 185 000 FCFA a été effectué ce matin à 10h.',
    },
  });

  // Accident report
  await prisma.accidentReport.create({
    data: {
      userId: driver1.id,
      vehicleId: vehicle1.id,
      severity: 'MINOR',
      status: 'RESOLVED',
      location: 'Carrefour Palmeraie, Cocody',
      latitude: 5.3364,
      longitude: -3.9647,
      description: 'Accrochage mineur au niveau du rétroviseur gauche.',
      occurredAt: new Date('2024-02-20'),
      damageCost: 75000,
      resolvedAt: new Date('2024-02-25'),
      resolvedBy: superAdmin.id,
    },
  });

  // Geofence zones
  await prisma.geofenceZone.createMany({
    data: [
      {
        name: 'Abidjan Centre',
        type: 'CITY_BOUNDARY',
        coordinates: { type: 'Polygon', coordinates: [[[5.3, -4.0], [5.4, -4.0], [5.4, -3.9], [5.3, -3.9], [5.3, -4.0]]] },
        description: 'Limite de la zone d\'opération Abidjan',
      },
      {
        name: 'Garage Central',
        type: 'MAINTENANCE_CENTER',
        coordinates: { type: 'Point', coordinates: [5.3364, -3.9647] },
        radius: 500,
        description: 'Centre de maintenance principal',
      },
    ],
  });

  // Settings
  await prisma.setting.createMany({
    data: [
      { key: 'platform_name', value: 'DAMFlotte CLD', type: 'string', category: 'general' },
      { key: 'default_currency', value: 'XOF', type: 'string', category: 'finance' },
      { key: 'max_loan_amount', value: '5000000', type: 'number', category: 'loans' },
      { key: 'min_credit_score_for_loan', value: '350', type: 'number', category: 'loans' },
      { key: 'default_interest_rate', value: '15', type: 'number', category: 'loans' },
      { key: 'kyc_auto_approve', value: 'false', type: 'boolean', category: 'kyc' },
      { key: 'maintenance_reminder_days', value: '7', type: 'number', category: 'fleet' },
      { key: 'support_email', value: 'support@damflotte.ci', type: 'string', category: 'support' },
    ],
  });

  // Feature flags
  await prisma.featureFlag.createMany({
    data: [
      { key: 'wave_payments', name: 'Paiements Wave', description: 'Activer les paiements via Wave Mobile Money', isEnabled: true },
      { key: 'yango_sync', name: 'Sync Yango', description: 'Synchronisation automatique des revenus Yango', isEnabled: true },
      { key: 'gps_tracking', name: 'Suivi GPS', description: 'Suivi GPS en temps réel des véhicules', isEnabled: true },
      { key: 'gamification', name: 'Gamification', description: 'Système de badges et classement', isEnabled: true },
      { key: 'rent_to_own', name: 'Location-vente', description: 'Contrats de location-vente', isEnabled: true },
      { key: 'credit_scoring', name: 'Score de crédit', description: 'Calcul automatique du score de crédit', isEnabled: true },
      { key: 'sms_notifications', name: 'SMS Notifications', description: 'Notifications par SMS', isEnabled: false },
    ],
  });

  // Audit log
  await prisma.auditLog.create({
    data: {
      adminId: superAdmin.id,
      action: 'SEED',
      resource: 'database',
      details: { message: 'Base de données initialisée avec les données de test' },
    },
  });

  console.log('Données de test créées avec succès !');
  console.log('');
  console.log('Comptes de test:');
  console.log('  Admin: admin@damflotte.ci / Admin@2024');
  console.log('  Finance: finance@damflotte.ci / Finance@2024');
  console.log('  Fleet: fleet@damflotte.ci / Fleet@2024');
  console.log('  Loans: loans@damflotte.ci / Loans@2024');
  console.log('  Driver: moussa.traore@email.ci / Driver@2024');
  console.log('  Driver: awa.coulibaly@email.ci / Driver@2024');
  console.log('  Driver: yao.koffi@email.ci / Driver@2024 (pending)');
  console.log('  Driver: sekou.diaby@email.ci / Driver@2024');
}

main()
  .catch((e) => {
    console.error('Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
