import { Response } from 'express';

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function sendSuccess<T>(res: Response, data: T, message?: string): void {
  const response: ApiResponse<T> = { success: true, data };
  if (message) response.message = message;
  res.status(200).json(response);
}

export function sendCreated<T>(res: Response, data: T, message = 'Ressource créée avec succès'): void {
  res.status(201).json({ success: true, message, data });
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  page: number,
  limit: number,
  total: number,
): void {
  res.status(200).json({
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export function sendNoContent(res: Response): void {
  res.status(204).send();
}

export function sendNotFound(res: Response, resource = 'Ressource'): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `${resource} introuvable`,
    },
  });
}

export function sendUnauthorized(res: Response, message = 'Non autorisé'): void {
  res.status(401).json({
    success: false,
    error: { code: 'UNAUTHORIZED', message },
  });
}

export function sendForbidden(res: Response, message = 'Accès interdit'): void {
  res.status(403).json({
    success: false,
    error: { code: 'FORBIDDEN', message },
  });
}

export function sendValidationError(res: Response, details?: unknown): void {
  res.status(422).json({
    success: false,
    error: {
      code: 'VALIDATION_ERROR',
      message: 'Erreur de validation',
      details,
    },
  });
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  details?: unknown,
  statusCode = 500,
): void {
  const response: ApiResponse = {
    success: false,
    error: { code, message },
  };
  if (details) response.error!.details = details;
  res.status(statusCode).json(response);
}

export function sendServerError(res: Response, message = 'Erreur interne du serveur'): void {
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message },
  });
}
