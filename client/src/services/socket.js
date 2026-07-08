import { io } from "socket.io-client";
import { API_BASE } from "./api";

// In DEV: API_BASE is "/api" (relative). The Vite dev server now proxies
// both /api and /socket.io to localhost:5000. So we pass undefined to
// socket.io and it connects to the current window origin (localhost:5173),
// which then gets proxied correctly to the backend.
//
// In PROD: API_BASE is "https://api-thequad.onrender.com/api". We strip
// the trailing "/api" using an END-ANCHORED regex to get the base server URL.
// IMPORTANT: Do NOT use plain .replace("/api", "") — it matches the FIRST
// occurrence which in "https://api-thequad.onrender.com/api" is the "/api"
// inside "//api-thequad", corrupting the URL to "https:/-thequad...".
const SERVER_URL = import.meta.env.DEV
  ? undefined  // undefined = connect to current origin; Vite proxies /socket.io → localhost:5000
  : API_BASE.replace(/\/api\/?$/, ""); // "https://api-thequad.onrender.com"

export const socket = io(SERVER_URL, {
  autoConnect: false,    // We connect manually after we have a valid token
  withCredentials: true, // Send cookies cross-origin
  transports: ["websocket", "polling"], // Try WebSocket first, fall back to polling
  reconnection: true,           // Auto-reconnect on drop
  reconnectionAttempts: 10,     // Try up to 10 times
  reconnectionDelay: 1000,      // Start at 1s delay
  reconnectionDelayMax: 10000,  // Cap at 10s delay
  timeout: 20000,               // Connection timeout
});
