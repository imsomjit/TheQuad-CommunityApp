import { io } from "socket.io-client";

// The server URL is derived from API_BASE to work seamlessly in prod and dev
import { API_BASE } from "./api";
const SERVER_URL = API_BASE.replace("/api", "");

export const socket = io(SERVER_URL, {
  autoConnect: false, // We will connect manually when user logs in or visits chat
  withCredentials: true, // Important to send cookies
});
