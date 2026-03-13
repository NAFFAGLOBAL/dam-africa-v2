import { db } from '../../utils/database';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  formatPhone,
  TokenPayload,
} from '../../utils/auth';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../../utils/errors';
export class AuthService {
  async register(data: {
    email: string;
    phone: string;
    password: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    city?: string;
  }) {
    const existing = await db.user.findFirst({
      where: { OR: [{ email: data.email }, { phone: formatPhone(data.phone) }] },
    });
    if (existing) {
      throw new ConflictError('Un compte avec cet email ou numéro existe déjà');
    }

    const passwordHash = await hashPassword(data.password);
    const user = await db.user.create({
      data: {
        email: data.email,
        phone: formatPhone(data.phone),
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
        city: data.city,
        status: 'PENDING',
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        status: true,
        createdAt: true,
      },
    });

    const payload: TokenPayload = { id: user.id, email: user.email, type: 'user' };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await db.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { user, accessToken, refreshToken };
  }

  async login(email: string, password: string) {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedError('Email ou mot de passe incorrect');
    }

    if (user.status === 'SUSPENDED') {
      throw new UnauthorizedError('Votre compte est suspendu');
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Email ou mot de passe incorrect');
    }

    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const payload: TokenPayload = {
      id: user.id,
      email: user.email,
      type: 'user',
      customerId: user.customerId ?? undefined,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await db.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        status: user.status,
        isVerified: user.isVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  async adminLogin(email: string, password: string) {
    const admin = await db.admin.findUnique({ where: { email } });
    if (!admin) {
      throw new UnauthorizedError('Identifiants invalides');
    }
    if (!admin.isActive) {
      throw new UnauthorizedError('Compte administrateur désactivé');
    }

    const valid = await comparePassword(password, admin.passwordHash);
    if (!valid) {
      throw new UnauthorizedError('Identifiants invalides');
    }

    await db.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    const payload: TokenPayload = {
      id: admin.id,
      email: admin.email,
      type: 'admin',
      role: admin.role,
      customerId: admin.customerId ?? undefined,
    };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await db.refreshToken.create({
      data: {
        token: refreshToken,
        adminId: admin.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(token: string) {
    const stored = await db.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedError('Token de rafraîchissement invalide ou expiré');
    }

    const decoded = verifyRefreshToken(token);
    const newAccessToken = generateAccessToken(decoded);
    const newRefreshToken = generateRefreshToken(decoded);

    await db.refreshToken.delete({ where: { id: stored.id } });
    await db.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: stored.userId,
        adminId: stored.adminId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError('Utilisateur introuvable');
    }

    const valid = await comparePassword(currentPassword, user.passwordHash);
    if (!valid) {
      throw new BadRequestError('Mot de passe actuel incorrect');
    }

    const passwordHash = await hashPassword(newPassword);
    await db.user.update({ where: { id: userId }, data: { passwordHash } });
  }

  async logout(userId: string, refreshTokenStr?: string) {
    if (refreshTokenStr) {
      await db.refreshToken.deleteMany({ where: { token: refreshTokenStr } });
    } else {
      await db.refreshToken.deleteMany({ where: { userId } });
    }
  }
}

export const authService = new AuthService();
