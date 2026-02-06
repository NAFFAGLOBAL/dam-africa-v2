import { db } from '../../utils/database';
import {
  hashPassword,
  comparePassword,
  generateTokens,
  verifyToken,
  formatPhoneNumber,
} from '../../utils/auth';
import {
  UnauthorizedError,
  ConflictError,
  NotFoundError,
  BadRequestError,
} from '../../utils/errors';
import { logger } from '../../utils/logger';
import type {
  RegisterInput,
  LoginInput,
  AdminLoginInput,
  ChangePasswordInput,
} from './auth.schemas';

export class AuthService {
  /**
   * Register new user (driver)
   */
  async register(data: RegisterInput) {
    // Check if email already exists
    const existingEmail = await db.user.findUnique({
      where: { email: data.email },
    });

    if (existingEmail) {
      throw new ConflictError('Email already registered');
    }

    // Check if phone already exists
    const formattedPhone = formatPhoneNumber(data.phone);
    const existingPhone = await db.user.findUnique({
      where: { phone: data.phone },
    });

    if (existingPhone) {
      throw new ConflictError('Phone number already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await db.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: formattedPhone,
        passwordHash,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        address: data.address,
        city: data.city,
        kycStatus: 'NOT_STARTED',
        creditScore: 500, // Default provisional score
        creditRating: 'C',
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        kycStatus: true,
        creditScore: true,
        creditRating: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const tokens = generateTokens(user.id, user.email);

    // Log registration
    logger.info('User registered:', { userId: user.id, email: user.email });

    // Create initial credit score history entry
    await db.creditScoreHistory.create({
      data: {
        userId: user.id,
        score: 500,
        rating: 'C',
        changeReason: 'Initial registration',
        paymentHistoryScore: 500,
        loanUtilizationScore: 800,
        accountAgeScore: 200,
        drivingPerformanceScore: 500,
        kycCompletenessScore: 0,
      },
    });

    return {
      user,
      ...tokens,
    };
  }

  /**
   * Login user
   */
  async login(data: LoginInput) {
    // Find user by email or phone
    const user = await db.user.findFirst({
      where: {
        OR: [
          ...(data.email ? [{ email: data.email }] : []),
          ...(data.phone ? [{ phone: data.phone }] : []),
        ],
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await comparePassword(data.password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if account is active
    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Account is suspended or deleted');
    }

    // Generate tokens
    const tokens = generateTokens(user.id, user.email);

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Log login
    logger.info('User logged in:', { userId: user.id, email: user.email });

    // Return user data without password
    const { passwordHash, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      ...tokens,
    };
  }

  /**
   * Admin login
   */
  async adminLogin(data: AdminLoginInput) {
    // Find admin by email
    const admin = await db.admin.findUnique({
      where: { email: data.email },
    });

    if (!admin) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await comparePassword(data.password, admin.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check if account is active
    if (admin.status !== 'ACTIVE') {
      throw new UnauthorizedError('Admin account is inactive');
    }

    // Generate tokens
    const tokens = generateTokens(admin.id, admin.email);

    // Update last login
    await db.admin.update({
      where: { id: admin.id },
      data: { lastLogin: new Date() },
    });

    // Log admin login
    logger.info('Admin logged in:', { adminId: admin.id, email: admin.email, role: admin.role });

    // Return admin data without password
    const { passwordHash, ...adminWithoutPassword } = admin;

    return {
      admin: adminWithoutPassword,
      ...tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = verifyToken(refreshToken);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedError('Invalid token type');
      }

      // Check if user still exists and is active
      const user = await db.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          status: true,
        },
      });

      if (!user) {
        // Try admin
        const admin = await db.admin.findUnique({
          where: { id: payload.userId },
          select: {
            id: true,
            email: true,
            status: true,
          },
        });

        if (!admin) {
          throw new UnauthorizedError('User not found');
        }

        if (admin.status !== 'ACTIVE') {
          throw new UnauthorizedError('Account is inactive');
        }

        // Generate new tokens for admin
        const tokens = generateTokens(admin.id, admin.email);
        return tokens;
      }

      if (user.status !== 'ACTIVE') {
        throw new UnauthorizedError('Account is suspended or deleted');
      }

      // Generate new tokens
      const tokens = generateTokens(user.id, user.email);

      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  /**
   * Change password (for authenticated user)
   */
  async changePassword(userId: string, data: ChangePasswordInput) {
    // Get user
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Verify current password
    const isValidPassword = await comparePassword(data.currentPassword, user.passwordHash);
    if (!isValidPassword) {
      throw new BadRequestError('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(data.newPassword);

    // Update password
    await db.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    // Log password change
    logger.info('Password changed:', { userId });

    return { message: 'Password changed successfully' };
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        dateOfBirth: true,
        address: true,
        city: true,
        country: true,
        profilePhotoUrl: true,
        status: true,
        kycStatus: true,
        creditScore: true,
        creditRating: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    return user;
  }

  /**
   * Get current admin profile
   */
  async getCurrentAdmin(adminId: string) {
    const admin = await db.admin.findUnique({
      where: { id: adminId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!admin) {
      throw new NotFoundError('Admin');
    }

    return admin;
  }
}

export const authService = new AuthService();
