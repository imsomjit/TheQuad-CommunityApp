import { io } from "socket.io-client";

// The server URL is defined in Vite env, assuming it's VITE_API_URL without /api
const SERVER_URL = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

export const socket = io(SERVER_URL, {
  autoConnect: false, // We will connect manually when user logs in or visits chat
  withCredentials: true, // Important to send cookies
});
