# REST & WebSocket API Specification

## REST API Endpoints

### Auth Endpoints

#### `POST /api/auth/register`
- **Description**: Registers a new user.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "Jane Doe"
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "status": "success",
    "data": {
      "user": { "id": "...", "email": "...", "name": "..." },
      "token": "eyJhbG..."
    }
  }
  ```

#### `POST /api/auth/login`
- **Description**: Authenticates user and returns JWT.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "data": {
      "user": { "id": "...", "email": "...", "name": "..." },
      "token": "eyJhbG..."
    }
  }
  ```

---

### Document Endpoints (Protected - Bearer Token Required)

#### `GET /api/documents`
- **Description**: Returns all documents owned by or shared with the authenticated user.
- **Headers**: `Authorization: Bearer <token>`
- **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "data": [
      {
        "id": "678a...",
        "title": "Project Blueprint",
        "role": "Owner",
        "updatedAt": "2026-07-25T11:00:00.000Z"
      }
    ]
  }
  ```

#### `POST /api/documents`
- **Description**: Creates a new document with initial snapshot.
- **Request Body**: `{ "title": "Untitled Document" }`
- **Response `201 Created`**: `{ "status": "success", "data": { "id": "...", "title": "..." } }`

#### `GET /api/documents/:id`
- **Description**: Fetches document metadata, latest CRDT snapshot, and unmerged operations.

#### `PUT /api/documents/:id/share`
- **Description**: Shares document with a target user email.
- **Request Body**: `{ "email": "colleague@example.com", "role": "Editor" }`

---

## WebSocket Event Specification

### Connection Handshake
- **URL**: `ws://localhost:5000`
- **Query Params**: `clientId=<uuid>&name=<string>&documentId=<id>`

### Client Emit Events
- `local-operation` — Emits `CRDTOperation` delta `{ type: 'insert'|'delete', char: {...} }`
- `cursor-update` — Emits numeric cursor offset `number`

### Server Emit Events
- `document-state` — Sends `{ snapshot: { version, crdt }, ops: [...] }`
- `remote-operation` — Broadcasts remote `CRDTOperation` to room members
- `presence-update` — Broadcasts `ActiveUser[]` list with cursor positions
