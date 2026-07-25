import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './api/routes/authRoutes';
import documentRoutes from './api/routes/documentRoutes';
import { errorHandler } from './middlewares/errorHandler';

const app = express();

// Security Middlewares with flexible CORS for dev environment
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

app.use(
  cors({
    origin: true, // Dynamically reflect request origin to prevent 'Failed to fetch' CORS errors
    credentials: true,
  })
);

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
