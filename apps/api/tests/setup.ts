/**
 * Jest Test Setup
 * Runs before all tests
 */

import { PrismaClient } from '@prisma/client';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/dam_africa_v2_test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-for-testing-only';

// Create test database client
export const testDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Global test setup
beforeAll(async () => {
  // Connect to test database
  await testDb.$connect();
  console.log('✅ Connected to test database');
});

// Clean up after each test
afterEach(async () => {
  // Clean all tables in reverse order of dependencies
  const tables = [
    'Notification',
    'Payment',
    'Loan',
    'CreditScoreHistory',
    'KYCDocument',
    'Vehicle',
    'User',
  ];

  for (const table of tables) {
    await testDb.$executeRawUnsafe(`DELETE FROM "${table}"`);
  }
});

// Global test teardown
afterAll(async () => {
  await testDb.$disconnect();
  console.log('✅ Disconnected from test database');
});
