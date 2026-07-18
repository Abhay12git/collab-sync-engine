import mongoose from 'mongoose';
import winston from 'winston';

export const connectDB = async (logger: winston.Logger): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://admin:password@localhost:27017/collab-sync?authSource=admin';
    await mongoose.connect(mongoUri);
    logger.info('MongoDB connected successfully.');
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};
