import dotenv from 'dotenv';
import { createApp } from './app';
import { connectDatabase } from './config/database';
import { seedDatabase } from './utils/seed';

dotenv.config();

const PORT = parseInt(process.env.PORT || '5000', 10);

const startServer = async () => {
  try {
    // 1. Connect MongoDB
    await connectDatabase();

    // 2. Automatically seed essential counters, admin, and active template
    await seedDatabase();

    // 3. Start Express HTTP Server
    const app = createApp();
    const server = app.listen(PORT, () => {
      console.log('====================================================');
      console.log(` Spheronix ID Card Generator API running on port ${PORT}`);
      console.log(` Health Check: http://localhost:${PORT}/api/health`);
      console.log(` Environment:  ${process.env.NODE_ENV || 'development'}`);
      console.log('====================================================');
    });

    // Graceful process exit
    const handleExit = () => {
      server.close(() => {
        console.log('[Server] HTTP server stopped.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', handleExit);
    process.on('SIGINT', handleExit);
  } catch (error) {
    console.error('[Server] Critical startup failure:', error);
    process.exit(1);
  }
};

startServer();
