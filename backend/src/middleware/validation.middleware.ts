import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

interface SchemaParser {
  parse: (data: unknown) => any;
}

export const validateBody = (schema: SchemaParser) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0]?.message || 'Validation failed';
        res.status(400).json({
          success: false,
          message: firstError,
          errors: error.errors.map((err: any) => ({
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

export const validateQuery = (schema: SchemaParser) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query);
      next();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
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
