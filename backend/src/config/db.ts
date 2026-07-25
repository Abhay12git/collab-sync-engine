import mongoose from 'mongoose';
import winston from 'winston';

export const connectDB = async (logger: winston.Logger): Promise<void> => {
  try {
    // Try the configured URI first, then fall back to localhost without auth
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/collab-sync';
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    logger.info('MongoDB connected successfully.');
  } catch (error: any) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};
