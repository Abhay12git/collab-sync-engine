import { Server, Socket } from 'socket.io';
import { CRDTOperation } from '@collab-sync-engine/shared';
import logger from '../utils/logger';

// In-memory store for active users per document (simplification for MVP; use Redis in Production)
export interface ActiveUser {
  id: string;
  name: string;
  cursorIndex?: number;
}

const documentRooms: Record<string, Map<string, ActiveUser>> = {};

export const setupEditorGateway = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    const clientId = socket.handshake.query.clientId as string;
    const name = socket.handshake.query.name as string;
    const documentId = socket.handshake.query.documentId as string || 'default-doc';

    if (!clientId || !name) {
      logger.warn('Client connected without valid credentials, disconnecting.');
      socket.disconnect();
      return;
    }

    socket.join(documentId);

    if (!documentRooms[documentId]) {
      documentRooms[documentId] = new Map();
    }
    
    documentRooms[documentId].set(clientId, { id: clientId, name });
    logger.info(`User ${name} (${clientId}) joined document ${documentId}`);

    // Broadcast presence update
    const activeUsers = Array.from(documentRooms[documentId].values());
    io.to(documentId).emit('presence-update', activeUsers);

    // Handle CRDT Operations
    socket.on('local-operation', async (op: CRDTOperation) => {
      // 1. Broadcast to everyone else immediately to maintain low latency
      socket.to(documentId).emit('remote-operation', op);
      
      // 2. TODO: Asynchronously batch and write this operation to MongoDB OperationsLog
    });

    // Handle Cursor Updates
    socket.on('cursor-update', (cursorIndex: number) => {
      const user = documentRooms[documentId].get(clientId);
      if (user) {
        user.cursorIndex = cursorIndex;
        io.to(documentId).emit('presence-update', Array.from(documentRooms[documentId].values()));
      }
    });

    socket.on('disconnect', () => {
      logger.info(`User ${name} (${clientId}) disconnected`);
      documentRooms[documentId]?.delete(clientId);
      io.to(documentId).emit('presence-update', Array.from(documentRooms[documentId]?.values() || []));
    });
  });
};
