import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import logger from './utils/logger';
import { connectDB } from './config/db';
import http from 'http';
import { Server } from 'socket.io';
import { setupEditorGateway } from './sockets/editorGateway';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB(logger);

  const server = http.createServer(app);
  
  const io = new Server(server, {
    cors: { origin: '*' }
  });

  // Initialize WebSockets for real-time CRDT sync
  setupEditorGateway(io);

  server.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
};

startServer();
