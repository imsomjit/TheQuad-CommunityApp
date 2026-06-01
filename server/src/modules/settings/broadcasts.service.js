"use strict";

const { eq, desc } = require("drizzle-orm");
const { db } = require("../../db/index");
const { broadcasts } = require("../../db/schema/index");
const logger = require("../../utils/logger");

class BroadcastsService {
  /**
   * List all broadcasts (upcoming and past)
   */
  async listBroadcasts() {
    return await db.select()
      .from(broadcasts)
      .orderBy(desc(broadcasts.createdAt))
      .limit(10);
  }

  /**
   * Schedule a new broadcast
   */
  async scheduleBroadcast(data) {
    const inserted = await db.insert(broadcasts).values({
      title: data.title,
      message: data.message,
      type: data.type || "INFO",
      scheduledAt: new Date(data.scheduledAt),
      createdBy: data.createdBy,
      isSent: false
    }).returning();
    
    return inserted[0];
  }

  /**
   * Delete a scheduled broadcast (only if not yet sent)
   */
  async deleteBroadcast(id) {
    const existing = await db.select().from(broadcasts).where(eq(broadcasts.id, id)).limit(1);
    if (existing.length === 0) {
      throw Object.assign(new Error("Broadcast not found"), { status: 404 });
    }
    
    if (existing[0].isSent) {
      throw Object.assign(new Error("Cannot delete a broadcast that has already been sent"), { status: 400 });
    }

    await db.delete(broadcasts).where(eq(broadcasts.id, id));
    return { success: true };
  }
}

module.exports = new BroadcastsService();
