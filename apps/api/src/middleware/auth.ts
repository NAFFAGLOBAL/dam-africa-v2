import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/auth';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { db } from '../utils/database';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        type: 'user' | 'admin';
        role?: string;
        customerId?: string;
      };
    }
  }
}

export const authenticateUser = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) {
      throw new UnauthorizedError('Token manquant');
    }

    const payload = verifyToken(token);
    if (payload.type !== 'user') {
      throw new UnauthorizedError('Token invalide pour cet endpoint');
    }

    const user = await db.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, status: true, customerId: true },
    });

    if (!user) {
      throw new UnauthorizedError('Utilisateur introuvable');
    }

    if (user.status === 'SUSPENDED' || user.status === 'INACTIVE') {
      throw new ForbiddenError('Compte suspendu ou inactif');
    }

    req.user = {
      id: user.id,
      email: user.email,
      type: 'user',
      customerId: user.customerId ?? undefined,
    };

    next();
  } catch (error) {
    next(error instanceof UnauthorizedError || error instanceof ForbiddenError
      ? error
      : new UnauthorizedError('Token invalide ou expiré'));
  }
};

export const authenticateAdmin = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) {
      throw new UnauthorizedError('Token manquant');
    }

    const payload = verifyToken(token);
    if (payload.type !== 'admin') {
      throw new UnauthorizedError('Accès administrateur requis');
    }

    const admin = await db.admin.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, role: true, isActive: true, customerId: true },
    });

    if (!admin) {
      throw new UnauthorizedError('Administrateur introuvable');
    }

    if (!admin.isActive) {
      throw new ForbiddenError('Compte administrateur désactivé');
    }

    req.user = {
      id: admin.id,
      email: admin.email,
      type: 'admin',
      role: admin.role,
      customerId: admin.customerId ?? undefined,
    };

    next();
  } catch (error) {
    next(error instanceof UnauthorizedError || error instanceof ForbiddenError
      ? error
      : new UnauthorizedError('Token invalide ou expiré'));
  }
};

export const authorizeAdmin = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || req.user.type !== 'admin') {
      return next(new ForbiddenError('Accès administrateur requis'));
    }
    if (roles.length > 0 && (!req.user.role || !roles.includes(req.user.role))) {
      return next(new ForbiddenError('Rôle insuffisant pour cette action'));
    }
    next();
  };
};

export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) {
      return next();
    }
    const payload = verifyToken(token);
    req.user = {
      id: payload.id,
      email: payload.email,
      type: payload.type,
      role: payload.role,
      customerId: payload.customerId,
    };
  } catch {
    // Token invalid — continue without auth
  }
  next();
};
