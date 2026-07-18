import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import logger from './utils/logger';
import { connectDB } from './config/db';
import http from 'http';
import { Server } from 'socket.io';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB(logger);

  const server = http.createServer(app);
  
  // Basic Socket.IO setup
  const io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    logger.info(`New client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

startServer();
