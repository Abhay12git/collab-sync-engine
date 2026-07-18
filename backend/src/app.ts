import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './api/routes/authRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { AppError } from './utils/AppError';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10kb' })); // Body parser limit to prevent DOS

// Routes
app.use('/api/auth', authRoutes);

// Unhandled Route
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(errorHandler);

export default app;
