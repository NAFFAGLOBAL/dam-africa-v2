import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors';

type ValidationTarget = 'body' | 'query' | 'params';

export function validate(schemas: Partial<Record<ValidationTarget, ZodSchema>>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const errors: Record<string, unknown> = {};

    for (const [target, schema] of Object.entries(schemas) as [ValidationTarget, ZodSchema][]) {
      try {
        const parsed = schema.parse(req[target]);
        req[target] = parsed;
      } catch (error) {
        if (error instanceof ZodError) {
          errors[target] = error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          }));
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      return next(new ValidationError('Données invalides', errors));
    }
    next();
  };
}

export function validateBody(schema: ZodSchema) {
  return validate({ body: schema });
}

export function validateQuery(schema: ZodSchema) {
  return validate({ query: schema });
}

export function validateParams(schema: ZodSchema) {
  return validate({ params: schema });
}
