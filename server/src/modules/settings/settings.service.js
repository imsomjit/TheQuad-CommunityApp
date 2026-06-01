"use strict";

const { eq } = require("drizzle-orm");
const { db } = require("../../db/index");
const { siteSettings } = require("../../db/schema/index");
const logger = require("../../utils/logger");

class SettingsService {
  /**
   * Get global site settings (creates default if it doesn't exist)
   */
  async getSettings() {
    let result = await db.select().from(siteSettings).limit(1);

    if (result.length === 0) {
      const inserted = await db.insert(siteSettings).values({
        registrationEnabled: true,
        announcementActive: false,
        announcementType: "INFO",
        announcementText: "",
        socialLinks: {
          linkedin: "",
          instagram: "",
          twitter: "",
          discord: "",
          email: ""
        }
      }).returning();
      return inserted[0];
    }
    
    return result[0];
  }

  /**
   * Update global site settings
   */
  async updateSettings(updates) {
    const current = await this.getSettings();

    const result = await db.update(siteSettings)
      .set({
        registrationEnabled: updates.registrationEnabled !== undefined ? updates.registrationEnabled : current.registrationEnabled,
        announcementActive: updates.announcementActive !== undefined ? updates.announcementActive : current.announcementActive,
        announcementType: updates.announcementType || current.announcementType,
        announcementText: updates.announcementText !== undefined ? updates.announcementText : current.announcementText,
        socialLinks: updates.socialLinks ? { ...current.socialLinks, ...updates.socialLinks } : current.socialLinks
      })
      .where(eq(siteSettings.id, current.id))
      .returning();

    return result[0];
  }
}

module.exports = new SettingsService();
