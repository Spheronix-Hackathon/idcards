import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const validateBody = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error && Array.isArray(error.errors)) { // Duck typing instead of instanceof z.ZodError to bypass any import issues
        const firstError = error.errors[0]?.message || 'Validation failed';
        res.status(400).json({
          success: false,
          message: firstError,
          errors: error.errors.map((err: any) => ({
            field: err.path ? err.path.join('.') : '',
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

export const validateQuery = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error: any) {
      if (error && Array.isArray(error.errors)) {
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
