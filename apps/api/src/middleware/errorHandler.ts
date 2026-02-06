import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { sendError, sendServerError } from '../utils/response';
import { logger } from '../utils/logger';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error
  logger.error('Error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
  });

  // Handle custom AppError
  if (err instanceof AppError) {
    sendError(res, err.code, err.message, err.details, err.statusCode);
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const details = err.errors.map((error) => ({
      field: error.path.join('.'),
      message: error.message,
    }));
    sendError(res, 'VALIDATION_ERROR', 'Validation failed', details, 422);
    return;
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        // Unique constraint violation
        const field = (err.meta?.target as string[])?.join(', ') || 'field';
        sendError(res, 'CONFLICT', `${field} already exists`, undefined, 409);
        return;

      case 'P2025':
        // Record not found
        sendError(res, 'NOT_FOUND', 'Resource not found', undefined, 404);
        return;

      case 'P2003':
        // Foreign key constraint violation
        sendError(
          res,
          'BAD_REQUEST',
          'Referenced resource does not exist',
          undefined,
          400
        );
        return;

      default:
        logger.error('Prisma error:', { code: err.code, meta: err.meta });
        sendServerError(res, 'Database error occurred');
        return;
    }
  }

  // Handle Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    sendError(res, 'VALIDATION_ERROR', 'Invalid data provided', undefined, 422);
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'UNAUTHORIZED', 'Invalid token', undefined, 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'UNAUTHORIZED', 'Token expired', undefined, 401);
    return;
  }

  // Handle multer (file upload) errors
  if (err.name === 'MulterError') {
    if (err.message.includes('File too large')) {
      sendError(res, 'BAD_REQUEST', 'File size exceeds limit', undefined, 400);
      return;
    }
    sendError(res, 'BAD_REQUEST', 'File upload error', undefined, 400);
    return;
  }

  // Default server error
  sendServerError(res);
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  sendError(res, 'NOT_FOUND', `Route ${req.method} ${req.path} not found`, undefined, 404);
};

/**
 * Async route handler wrapper
 * Catches errors and passes them to error handler
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
