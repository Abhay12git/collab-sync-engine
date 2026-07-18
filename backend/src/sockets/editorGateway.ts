import { Server, Socket } from 'socket.io';
import { CRDTOperation } from '@collab-sync-engine/shared';
import { OperationsLog } from '../models/OperationsLog';
import { DocumentSnapshot } from '../models/DocumentSnapshot';
import logger from '../utils/logger';

// In-memory store for active users per document
export interface ActiveUser {
  id: string;
  name: string;
  cursorIndex?: number;
}

const documentRooms: Record<string, Map<string, ActiveUser>> = {};

// Track operation version per document
const documentVersions: Record<string, number> = {};

const getNextVersion = (documentId: string): number => {
  if (!documentVersions[documentId]) {
    documentVersions[documentId] = 0;
  }
  documentVersions[documentId]++;
  return documentVersions[documentId];
};

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

    // Send existing document state to the newly connected client
    (async () => {
      try {
        const snapshot = await DocumentSnapshot.findOne({ documentId })
          .sort({ version: -1 })
          .lean();

        const snapshotVersion = snapshot?.version ?? 0;
        const ops = await OperationsLog.find({
          documentId,
          version: { $gt: snapshotVersion },
        })
          .sort({ version: 1 })
          .lean();

        // Initialize version counter from DB
        if (!documentVersions[documentId]) {
          const lastOp = await OperationsLog.findOne({ documentId })
            .sort({ version: -1 })
            .lean();
          documentVersions[documentId] = lastOp?.version ?? snapshotVersion;
        }

        socket.emit('document-state', {
          snapshot: snapshot
            ? {
                version: snapshot.version,
                crdt: JSON.parse(snapshot.serializedCrdt.toString()),
              }
            : { version: 0, crdt: [] },
          ops: ops.map((o) => o.operation),
        });
      } catch (err) {
        logger.error('Failed to load document state:', err);
      }
    })();

    // Handle CRDT Operations
    socket.on('local-operation', async (op: CRDTOperation) => {
      // 1. Broadcast to everyone else immediately to maintain low latency
      socket.to(documentId).emit('remote-operation', op);
      
      // 2. Persist to MongoDB OperationsLog
      try {
        const version = getNextVersion(documentId);
        await OperationsLog.create({
          documentId,
          version,
          operation: {
            type: op.type,
            id: op.char.id,
            value: op.char.value,
          },
          userId: clientId, // Using clientId as userId for now (pre-auth)
        });
      } catch (err) {
        logger.error('Failed to persist operation:', err);
      }
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
