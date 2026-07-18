import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './api/routes/authRoutes';
import documentRoutes from './api/routes/documentRoutes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json({ limit: '10kb' })); // Body parser limit to prevent DOS

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documents', documentRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
