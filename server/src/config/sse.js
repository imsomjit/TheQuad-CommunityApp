"use strict";

const logger = require("../utils/logger");

/**
 * SSE (Server-Sent Events) Manager.
 *
 * Maintains a Map of userId → response object.
 * When a notification is created in notificationService,
 * it calls sseManager.send(userId, event) to push it to the client instantly.
 *
 * Design notes:
 * - One SSE connection per user (latest one wins — old is replaced)
 * - This works for single-server deployments (Render free tier)
 * - For multi-server, replace this with Redis pub/sub + per-server SSE
 */

/** @type {Map<number, import('express').Response>} */
const clients = new Map();

/**
 * Registers a new SSE client.
 * Sets the correct SSE headers and stores the response.
 *
 * @param {number} userId
 * @param {import('express').Response} res
 */
const addClient = (userId, res) => {
  // If user already has a connection, close the old one
  if (clients.has(userId)) {
    try {
      clients.get(userId).end();
    } catch (_) {}
  }

  clients.set(userId, res);
  logger.debug(`SSE client connected: userId=${userId} (total=${clients.size})`);
};

/**
 * Removes a client (called on disconnect).
 * @param {number} userId
 */
const removeClient = (userId) => {
  clients.delete(userId);
  logger.debug(`SSE client disconnected: userId=${userId} (total=${clients.size})`);
};

/**
 * Sends an SSE event to a specific user.
 *
 * @param {number} userId
 * @param {string} event   - Event type name (e.g., "notification")
 * @param {object} data    - JSON-serializable payload
 */
const send = (userId, event, data) => {
  const res = clients.get(userId);
  if (!res) return; // user not connected — they'll fetch on next load

  try {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  } catch (err) {
    logger.warn(`Failed to send SSE to userId=${userId}`, { error: err.message });
    removeClient(userId);
  }
};

/**
 * Sends a heartbeat ping to all connected clients.
 * Keeps the connection alive through proxies / Render's infrastructure.
 */
const heartbeat = () => {
  clients.forEach((res, userId) => {
    try {
      res.write(`: heartbeat\n\n`);
    } catch {
      removeClient(userId);
    }
  });
};

// Send heartbeat every 25 seconds
setInterval(heartbeat, 25_000);

module.exports = { addClient, removeClient, send, clients };
