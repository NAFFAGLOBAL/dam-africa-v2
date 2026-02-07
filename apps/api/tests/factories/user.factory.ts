/**
 * User Test Factory - DAM Africa V2
 * Helper functions to create test users
 */

import { PrismaClient, UserStatus, KYCStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

interface CreateUserOptions {
  email?: string;
  phone?: string;
  password?: string;
  name?: string;
  status?: UserStatus;
  kycStatus?: KYCStatus;
  creditScore?: number;
  creditRating?: string;
}

export class UserFactory {
  private static counter = 0;

  /**
   * Generate unique email
   */
  static uniqueEmail(): string {
    this.counter++;
    return `test.user.${Date.now()}.${this.counter}@test.com`;
  }

  /**
   * Generate unique phone (Côte d'Ivoire format)
   */
  static uniquePhone(): string {
    this.counter++;
    const timestamp = Date.now().toString().slice(-7);
    return `+225${timestamp}${this.counter}`;
  }

  /**
   * Create a basic user
   */
  static async createUser(options: CreateUserOptions = {}) {
    const hashedPassword = await bcrypt.hash(options.password || 'password123', 10);

    return await prisma.user.create({
      data: {
        email: options.email || this.uniqueEmail(),
        phone: options.phone || this.uniquePhone(),
        passwordHash: hashedPassword,
        name: options.name || 'Test User',
        status: options.status || 'ACTIVE',
        kycStatus: options.kycStatus || 'NOT_STARTED',
        creditScore: options.creditScore || 0,
        creditRating: options.creditRating || null,
      },
    });
  }

  /**
   * Create a verified user (KYC complete)
   */
  static async createVerifiedUser(options: CreateUserOptions = {}) {
    return await this.createUser({
      ...options,
      kycStatus: 'VERIFIED',
      creditScore: options.creditScore || 650,
      creditRating: options.creditRating || 'B',
    });
  }

  /**
   * Create user with high credit score
   */
  static async createPremiumUser(options: CreateUserOptions = {}) {
    return await this.createUser({
      ...options,
      kycStatus: 'VERIFIED',
      creditScore: options.creditScore || 850,
      creditRating: options.creditRating || 'A',
    });
  }

  /**
   * Create multiple users
   */
  static async createUsers(count: number, options: CreateUserOptions = {}) {
    const users = [];
    for (let i = 0; i < count; i++) {
      const user = await this.createUser({
        ...options,
        name: options.name || `User ${i + 1}`,
      });
      users.push(user);
    }
    return users;
  }

  /**
   * Reset factory counter (for tests)
   */
  static reset() {
    this.counter = 0;
  }
}
