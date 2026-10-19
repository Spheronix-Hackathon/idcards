import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import studentRoutes from './routes/student.routes';
import idCardRoutes from './routes/idCard.routes';
import adminRoutes from './routes/admin.routes';
import templateRoutes from './routes/template.routes';
import { errorHandler } from './middleware/error.middleware';
import { studentProcessingQueue } from './middleware/concurrency.middleware';

dotenv.config();

export const createApp = (): Express => {
  const app = express();

  // Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' }
    })
  );

  // CORS Configuration - Support multiple ports and frontend URLs
  const rawOrigins = process.env.FRONTEND_URL || 'http://localhost:3000,http://localhost:3001,http://localhost:5173';
  const allowedOrigins = rawOrigins
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
      ) => {
        // Allow requests with no origin (mobile apps, curl, server-to-server)
        if (!origin) {
          return callback(null, true);
        }

        // Allow all localhost / 127.0.0.1 ports, any Render subdomains, and spheronix domain
        const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
        const isRender = /^https:\/\/[a-zA-Z0-9-]+\.onrender\.com$/.test(origin);
        const isSpheronixDomain = /^https?:\/\/(.+\.)?spheronixtechnology\.in$/.test(origin);
        if (isLocalhost || isRender || isSpheronixDomain || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
          return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
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
      version: '2.2.0-async',
      timestamp: new Date().toISOString()
    });
  });

  // Concurrency queue metrics endpoint
  app.get('/api/queue-status', (req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      data: studentProcessingQueue.getStats()
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
