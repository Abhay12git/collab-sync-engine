# Collab Sync Engine — Architecture & Technical Specifications

## 1. Overview

**Collab Sync Engine** is an enterprise-grade, real-time collaborative text & code editor. The system uses a **Conflict-free Replicated Data Type (CRDT)** architecture based on fractional position indexing (Logoot variant) to deliver Strong Eventual Consistency (SEC) across distributed clients without central lock management.

---

## 2. System Topography

```
                       ┌─────────────────────────┐
                       │   React + Vite Client   │
                       │    (Monaco Editor)      │
                       └───────────┬─────────────┘
                                   │
                           WebSocket / HTTP
                                   │
                       ┌───────────▼─────────────┐
                       │   Express + Socket.IO   │
                       │     Backend Gateway     │
                       └─────┬──────────────┬────┘
                             │              │
                    MongoDB ┌▼┐            ┌▼┐ Redis (Pub/Sub)
                (State Store)              (Scaling Layer)
```

---

## 3. Core Components

### 3.1 Shared CRDT Engine (`@collab-sync-engine/shared`)
- **Fractional Indexing**: Each character is assigned an immutable identifier `[position, siteId][]`.
- **Commutative Operations**: Insert and delete operations can arrive in any order while converging to identical state.
- **Tombstones**: Deletions flag characters as tombstones to maintain spatial path invariants.

### 3.2 Backend Gateway (`@collab-sync-engine/backend`)
- **JWT Auth Middleware**: Protects API routes and validates room joins.
- **Snapshot Manager**: Periodically serializes full CRDT state into `DocumentSnapshot`.
- **Operations Log**: Stores every incoming CRDT delta in `OperationsLog` for audit trails and time-travel replay.
- **Presence Engine**: Tracks active user cursors and streams `presence-update` events to room members.

### 3.3 Frontend Client (`@collab-sync-engine/frontend`)
- **Zustand Editor Store**: Local state store orchestrating WebSocket events and CRDT mutation methods.
- **Monaco Decorations Layer**: Projects remote user cursors dynamically with custom CSS styles.
- **Multi-Language Grammar Engine**: Toggles syntax highlighting across 11 programming languages.

---

## 4. Operational Flow Diagram

```
Client A                 Server                   Client B
   │                       │                         │
   ├─── local-operation ──►│                         │
   │    (insert 'H')       ├─── remote-operation ───►│
   │                       │    (apply CRDT op)      │
   │                       │                         │
   │                       ├─── Persist to DB        │
   │                       │    (OperationsLog)      │
```
