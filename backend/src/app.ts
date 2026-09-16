import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import studentRoutes from './routes/student.routes';
import idCardRoutes from './routes/idCard.routes';
import adminRoutes from './routes/admin.routes';
import templateRoutes from './routes/template.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

export const createApp = (): Express => {
  const app = express();

  // Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );

  // CORS Configuration
  const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map((url) => url.trim().replace(/\/$/, ''));
  
  app.use(
    cors({
      origin: true, // Allow all origins for the hackathon
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  );

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'UP',
      service: 'Spheronix ID Card Generator API',
      timestamp: new Date().toISOString()
    });
  });

  // API Routes
  app.use('/api/students', studentRoutes);
  app.use('/api/id-cards', idCardRoutes);
  app.use('/api/admin/templates', templateRoutes);
  app.use('/api/admin', adminRoutes);

  // 404 Route Catch-all
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: `API endpoint ${req.method} ${req.originalUrl} does not exist.`
    });
  });

  // Global Error Handler
  app.use(errorHandler);

  return app;
};
