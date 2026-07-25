import mongoose from 'mongoose';
import winston from 'winston';
import dns from 'dns';

export const connectDB = async (logger: winston.Logger): Promise<void> => {
  try {
    // Set public DNS fallback for Windows SRV record resolution
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (_e) {
      // Ignore if custom DNS is not permitted
    }

    const mongoUri =
      process.env.MONGO_URI || 'mongodb://localhost:27017/collab-sync';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });
    logger.info('MongoDB connected successfully.');
  } catch (error: any) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};
