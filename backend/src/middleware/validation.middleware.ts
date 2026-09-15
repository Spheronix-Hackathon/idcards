import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

export const validateBody = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0]?.message || 'Validation failed';
        res.status(400).json({
          success: false,
          message: firstError,
          errors: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: 'Invalid request data'
      });
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const firstError = error.errors[0]?.message || 'Invalid query parameters';
        res.status(400).json({
          success: false,
          message: firstError
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: 'Invalid query parameters'
      });
    }
  };
};
