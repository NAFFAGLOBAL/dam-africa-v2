import { PrismaClient } from '@prisma/client';
import { logger } from './logger';
import { config } from '../config';

// Prisma client singleton
let prisma: PrismaClient;

/**
 * Get Prisma client instance
 */
export const getPrismaClient = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
      log: config.isDevelopment
        ? ['query', 'info', 'warn', 'error']
        : ['warn', 'error'],
    });

    // Log successful connection
    prisma.$connect().then(() => {
      logger.info('✅ Database connected successfully');
    }).catch((error) => {
      logger.error('❌ Database connection failed:', error);
      process.exit(1);
    });
  }

  return prisma;
};

/**
 * Disconnect from database
 */
export const disconnectDatabase = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect();
    logger.info('Database disconnected');
  }
};

// Export prisma instance
export const db = getPrismaClient();

export default db;
