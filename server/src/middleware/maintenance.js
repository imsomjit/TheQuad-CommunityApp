"use strict";

const SettingsService = require("../modules/settings/settings.service");
const { verifyToken } = require("../utils/jwt");
const env = require("../config/env");

/**
 * Global middleware to intercept write requests if the site is in maintenance mode.
 * Admins are bypassed.
 */
const maintenanceCheck = async (req, res, next) => {
  // Only intercept state-mutating requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    
    // Bypass authentication endpoints so users can still log in/out
    if (req.originalUrl.startsWith("/api/auth")) {
      return next();
    }

    try {
      const settingsSvc = new SettingsService();
      const settings = await settingsSvc.getSettings();
      
      if (settings.maintenanceMode) {
        // We need to check if the current user is an admin.
        // Since this might run before standard auth middleware, we parse the token manually.
        let isAdmin = false;
        
        let token = req.cookies?.accessToken;
        if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
          token = req.headers.authorization.split(" ")[1];
        }

        if (token) {
          try {
            // Note: Verify token requires only token, standard jwt requires secret but verifyToken in utils probably binds it.
            const decoded = verifyToken(token);
            if (decoded && decoded.role === "admin") {
              isAdmin = true;
            }
          } catch (e) {
            // Ignore token verification errors here; normal auth will catch them if needed.
          }
        }

        if (!isAdmin) {
          return res.status(503).json({
            success: false,
            message: "The platform is currently in read-only mode for scheduled maintenance. Please try again later.",
            code: "MAINTENANCE_MODE"
          });
        }
      }
    } catch (err) {
      // If we fail to fetch settings, just allow the request to proceed (fail-open)
      console.error("Maintenance check failed:", err);
    }
  }

  next();
};

module.exports = maintenanceCheck;
