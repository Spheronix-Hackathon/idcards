import mongoose from 'mongoose';

export const connectDatabase = async (): Promise<void> => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/spheronix_id_card';

  mongoose.connection.on('connected', () => {
    console.log(`[MongoDB] Connected successfully to ${mongoose.connection.host}/${mongoose.connection.name}`);
  });

  mongoose.connection.on('error', (err: any) => {
    console.error('[MongoDB] Connection error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Disconnected from database. Attempting to reconnect...');
  });

  mongoose.connection.on('reconnected', () => {
    console.log('[MongoDB] Successfully reconnected to database.');
  });

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      autoIndex: true
    });
  } catch (error) {
    console.error('[MongoDB] Initial connection failed:', error);
    // Don't exit immediately in dev if mongo isn't up, allow graceful retry
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  // Graceful shutdown handling
  const gracefulShutdown = async (signal: string) => {
    try {
      await mongoose.connection.close();
      console.log(`[MongoDB] Connection closed via ${signal} signal.`);
      process.exit(0);
    } catch (err) {
      console.error('[MongoDB] Error during connection close:', err);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
};
