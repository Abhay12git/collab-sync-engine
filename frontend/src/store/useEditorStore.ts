import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { SequenceCRDT, type CRDTOperation } from '@collab-sync-engine/shared';
import { v4 as uuidv4 } from 'uuid';

export interface ActiveUser {
  id: string;
  name: string;
  cursorIndex?: number;
}

interface EditorState {
  socket: Socket | null;
  crdt: SequenceCRDT;
  text: string;
  clientId: string;
  connected: boolean;
  activeUsers: ActiveUser[];
  
  initConnection: () => void;
  insertText: (index: number, value: string) => void;
  deleteText: (index: number) => void;
  updateCursor: (index: number) => void;
  disconnect: () => void;
}

const generateRandomName = () => `User_${Math.floor(Math.random() * 1000)}`;

export const useEditorStore = create<EditorState>((set, get) => {
  const clientId = uuidv4();
  const crdt = new SequenceCRDT(clientId);

  return {
    socket: null,
    crdt,
    text: '',
    clientId,
    connected: false,
    activeUsers: [],

    initConnection: () => {
      if (get().socket) return;
      const name = generateRandomName();
      
      const socket = io('http://localhost:5000', {
        query: { clientId, name },
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('[WS] Connected to server');
        set({ connected: true });
      });

      socket.on('disconnect', (reason) => {
        console.log('[WS] Disconnected:', reason);
        set({ connected: false });
      });

      socket.on('connect_error', (err) => {
        console.error('[WS] Connection error:', err.message);
      });

      socket.on('remote-operation', (op: CRDTOperation) => {
        const { crdt } = get();
        crdt.applyOperation(op);
        set({ text: crdt.getText() });
      });

      socket.on('presence-update', (users: ActiveUser[]) => {
        set({ activeUsers: users });
      });

      set({ socket });
    },

    insertText: (index: number, value: string) => {
      const { crdt, socket } = get();
      const op = crdt.insert(index, value);
      set({ text: crdt.getText() });
      if (socket) {
        socket.emit('local-operation', op);
      }
    },

    deleteText: (index: number) => {
      const { crdt, socket } = get();
      const op = crdt.delete(index);
      if (op) {
        set({ text: crdt.getText() });
        if (socket) {
          socket.emit('local-operation', op);
        }
      }
    },

    updateCursor: (index: number) => {
      const { socket } = get();
      if (socket) {
        socket.emit('cursor-update', index);
      }
    },

    disconnect: () => {
      const { socket } = get();
      if (socket) socket.disconnect();
    }
  };
});
