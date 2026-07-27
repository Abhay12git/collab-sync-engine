import { create } from 'zustand';
import { WS_URL } from '../config/api';
import { io, Socket } from 'socket.io-client';
import { SequenceCRDT, type CRDTOperation, type Char } from '@collab-sync-engine/shared';
import { v4 as uuidv4 } from 'uuid';

export interface ActiveUser {
  id: string;
  name: string;
  cursorIndex?: number;
}

export type SupportedLanguage = 
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'html'
  | 'css'
  | 'json'
  | 'markdown'
  | 'go'
  | 'rust'
  | 'cpp'
  | 'java';

interface EditorState {
  socket: Socket | null;
  crdt: SequenceCRDT;
  text: string;
  clientId: string;
  connected: boolean;
  activeUsers: ActiveUser[];
  documentId: string | null;
  documentTitle: string;
  language: SupportedLanguage;
  
  initConnection: (documentId?: string) => void;
  insertText: (index: number, value: string) => void;
  deleteText: (index: number) => void;
  updateCursor: (index: number) => void;
  setLanguage: (lang: SupportedLanguage) => void;
  setDocumentTitle: (title: string) => void;
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
    documentId: null,
    documentTitle: 'Untitled Document',
    language: 'typescript',

    initConnection: (documentId?: string) => {
      if (get().socket) return;
      const name = generateRandomName();
      const docId = documentId || 'default-doc';
      
      const socket = io(WS_URL, {
        query: { clientId, name, documentId: docId },
        transports: ['websocket', 'polling'],
      });

      socket.on('connect', () => {
        console.log('[WS] Connected to server, document:', docId);
        set({ connected: true });
      });

      socket.on('disconnect', (reason) => {
        console.log('[WS] Disconnected:', reason);
        set({ connected: false });
      });

      socket.on('connect_error', (err) => {
        console.error('[WS] Connection error:', err.message);
      });

      // Receive initial document state from server
      socket.on('document-state', (data: { snapshot: { version: number; crdt: Char[] }; ops: any[] }) => {
        const { crdt } = get();
        // Load snapshot into CRDT
        if (data.snapshot.crdt.length > 0) {
          crdt.struct = data.snapshot.crdt;
        }
        // Apply any unmerged operations
        for (const op of data.ops) {
          crdt.applyOperation(op);
        }
        set({ text: crdt.getText() });
        console.log('[WS] Document state loaded, chars:', crdt.struct.length);
      });

      socket.on('remote-operation', (op: CRDTOperation) => {
        const { crdt } = get();
        crdt.applyOperation(op);
        set({ text: crdt.getText() });
      });

      socket.on('presence-update', (users: ActiveUser[]) => {
        set({ activeUsers: users });
      });

      set({ socket, documentId: docId });
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

    setLanguage: (language: SupportedLanguage) => {
      set({ language });
    },

    setDocumentTitle: (documentTitle: string) => {
      set({ documentTitle });
    },

    disconnect: () => {
      const { socket } = get();
      if (socket) {
        socket.disconnect();
        set({ socket: null, connected: false, activeUsers: [], documentId: null });
      }
    }
  };
});
