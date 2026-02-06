import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { UnauthorizedError } from './errors';

/**
 * JWT Payload structure
 */
export interface JwtPayload {
  userId: string;
  email: string;
  type: 'access' | 'refresh';
}

/**
 * Hash password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, config.security.bcryptRounds);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate JWT access token
 */
export const generateAccessToken = (userId: string, email: string): string => {
  const payload: JwtPayload = {
    userId,
    email,
    type: 'access',
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.accessExpiresIn,
  });
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (userId: string, email: string): string => {
  const payload: JwtPayload = {
    userId,
    email,
    type: 'refresh',
  };

  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

/**
 * Generate both access and refresh tokens
 */
export const generateTokens = (
  userId: string,
  email: string
): { accessToken: string; refreshToken: string } => {
  return {
    accessToken: generateAccessToken(userId, email),
    refreshToken: generateRefreshToken(userId, email),
  };
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): JwtPayload => {
  try {
    const payload = jwt.verify(token, config.jwt.secret) as JwtPayload;
    return payload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    throw new UnauthorizedError('Token verification failed');
  }
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader?: string): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Validate password strength
 */
export const validatePasswordStrength = (password: string): {
  valid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate phone number (Ivorian format: +225 XX XX XX XX XX)
 */
export const validatePhoneNumber = (phone: string): boolean => {
  // Remove spaces for validation
  const cleanPhone = phone.replace(/\s/g, '');
  
  // Check Ivorian format: +225 followed by 10 digits
  const ivorianRegex = /^\+225\d{10}$/;
  
  return ivorianRegex.test(cleanPhone);
};

/**
 * Format phone number to standard format
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all spaces
  const cleanPhone = phone.replace(/\s/g, '');
  
  // If starts with +225, format as +225 XX XX XX XX XX
  if (cleanPhone.startsWith('+225')) {
    const number = cleanPhone.substring(4);
    return `+225 ${number.substring(0, 2)} ${number.substring(2, 4)} ${number.substring(4, 6)} ${number.substring(6, 8)} ${number.substring(8)}`;
  }
  
  return phone;
};
