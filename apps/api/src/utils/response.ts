import { Response } from 'express';

/**
 * Standard API Response Structure
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

/**
 * Send success response
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  meta?: ApiResponse['meta'],
  statusCode: number = 200
): void => {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  if (message) {
    response.message = message;
  }

  if (meta) {
    response.meta = meta;
  }

  res.status(statusCode).json(response);
};

/**
 * Send error response
 */
export const sendError = (
  res: Response,
  code: string,
  message: string,
  details?: any,
  statusCode: number = 400
): void => {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  };

  res.status(statusCode).json(response);
};

/**
 * Send paginated response
 */
export const sendPaginated = <T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
  message?: string
): void => {
  const totalPages = Math.ceil(total / limit);

  sendSuccess(
    res,
    data,
    message,
    {
      page,
      limit,
      total,
      totalPages,
    },
    200
  );
};

/**
 * Send created response
 */
export const sendCreated = <T>(res: Response, data: T, message?: string): void => {
  sendSuccess(res, data, message || 'Resource created successfully', undefined, 201);
};

/**
 * Send no content response
 */
export const sendNoContent = (res: Response): void => {
  res.status(204).send();
};

/**
 * Send unauthorized response
 */
export const sendUnauthorized = (res: Response, message: string = 'Unauthorized'): void => {
  sendError(res, 'UNAUTHORIZED', message, undefined, 401);
};

/**
 * Send forbidden response
 */
export const sendForbidden = (res: Response, message: string = 'Forbidden'): void => {
  sendError(res, 'FORBIDDEN', message, undefined, 403);
};

/**
 * Send not found response
 */
export const sendNotFound = (res: Response, resource: string = 'Resource'): void => {
  sendError(res, 'NOT_FOUND', `${resource} not found`, undefined, 404);
};

/**
 * Send validation error response
 */
export const sendValidationError = (res: Response, details: any): void => {
  sendError(res, 'VALIDATION_ERROR', 'Validation failed', details, 422);
};

/**
 * Send internal server error response
 */
export const sendServerError = (res: Response, message?: string): void => {
  sendError(
    res,
    'INTERNAL_SERVER_ERROR',
    message || 'An unexpected error occurred',
    undefined,
    500
  );
};
