/**
 * Centralized API configuration.
 * Uses Vite env variables for production deployment (Vercel + Render).
 * Falls back to localhost for local development.
 */

// Backend base URL (no trailing slash)
export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL || 'http://localhost:5000';

// REST API endpoint
export const API_URL = `${API_BASE_URL}/api`;

// WebSocket URL (same as API base)
export const WS_URL: string = API_BASE_URL;
