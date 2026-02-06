import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader, JwtPayload } from '../utils/auth';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { db } from '../utils/database';
import { AdminRole } from '@prisma/client';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        type: 'user' | 'admin';
        role?: AdminRole;
      };
    }
  }
}

/**
 * Authenticate user (driver) middleware
 */
export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      throw new UnauthorizedError('Access token required');
    }

    const payload: JwtPayload = verifyToken(token);

    if (payload.type !== 'access') {
      throw new UnauthorizedError('Invalid token type');
    }

    // Fetch user from database
    const user = await db.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        status: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedError('Account is suspended or deleted');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      type: 'user',
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authenticate admin middleware
 */
export const authenticateAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      throw new UnauthorizedError('Access token required');
    }

    const payload: JwtPayload = verifyToken(token);

    if (payload.type !== 'access') {
      throw new UnauthorizedError('Invalid token type');
    }

    // Fetch admin from database
    const admin = await db.admin.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
      },
    });

    if (!admin) {
      throw new UnauthorizedError('Admin not found');
    }

    if (admin.status !== 'ACTIVE') {
      throw new UnauthorizedError('Admin account is inactive');
    }

    // Attach admin to request
    req.user = {
      id: admin.id,
      email: admin.email,
      type: 'admin',
      role: admin.role,
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorize admin by role(s)
 */
export const authorizeAdmin = (...allowedRoles: AdminRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.type !== 'admin') {
      throw new ForbiddenError('Admin access required');
    }

    if (!req.user.role) {
      throw new ForbiddenError('Role not found');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    next();
  };
};

/**
 * Optionally authenticate (attach user if token present, but don't require it)
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = extractTokenFromHeader(authHeader);

    if (token) {
      const payload: JwtPayload = verifyToken(token);

      if (payload.type === 'access') {
        const user = await db.user.findUnique({
          where: { id: payload.userId },
          select: {
            id: true,
            email: true,
            status: true,
          },
        });

        if (user && user.status === 'ACTIVE') {
          req.user = {
            id: user.id,
            email: user.email,
            type: 'user',
          };
        }
      }
    }

    next();
  } catch (error) {
    // Silently continue if authentication fails
    next();
  }
};
