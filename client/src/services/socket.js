import { io } from "socket.io-client";
import { API_BASE } from "./api";

const SERVER_URL = API_BASE.replace("/api", "");

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
