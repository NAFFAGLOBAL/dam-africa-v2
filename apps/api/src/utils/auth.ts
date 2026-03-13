import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 12;

export interface TokenPayload {
  id: string;
  email: string;
  type: 'user' | 'admin';
  role?: string;
  customerId?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(
  payload: TokenPayload,
  secret: string,
  expiresIn: string,
): string {
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

export function generateAccessToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  const expiresIn = process.env.JWT_ACCESS_EXPIRY || '15m';
  return generateToken(payload, secret, expiresIn);
}

export function generateRefreshToken(payload: TokenPayload): string {
  const secret = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';
  const expiresIn = process.env.JWT_REFRESH_EXPIRY || '7d';
  return generateToken(payload, secret, expiresIn);
}

export function verifyToken(token: string, secret?: string): TokenPayload {
  const s = secret || process.env.JWT_SECRET || 'dev-secret';
  return jwt.verify(token, s) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  const secret = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret';
  return jwt.verify(token, secret) as TokenPayload;
}

export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

export function formatPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('00225')) {
    cleaned = cleaned.substring(2);
  }
  if (!cleaned.startsWith('225') && cleaned.length <= 10) {
    cleaned = '225' + cleaned;
  }
  return '+' + cleaned;
}
