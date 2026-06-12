"use strict";

const nodemailer = require("nodemailer");
const env = require("../config/env");
const logger = require("./logger");

let transporter = null;

/**
 * Gets or creates the Gmail SMTP transporter.
 * Uses 'service: gmail' to handle connection timeouts on Render.com.
 * Requires a Gmail App Password (2FA must be enabled on the account).
 */
const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.GMAIL_USER,
        pass: env.GMAIL_APP_PASSWORD,
      },
      // Increased timeouts for Render's cold-start network
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    });
  }
  return transporter;
};

/**
 * Sends an email. Fails silently (logs error) if GMAIL_* env vars are not set.
 *
 * @param {{ to: string, subject: string, html: string, text?: string }} opts
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!env.GMAIL_USER || !env.GMAIL_APP_PASSWORD) {
    logger.warn("Email not sent — GMAIL_USER or GMAIL_APP_PASSWORD not set");
    return;
  }

  const mailTransporter = getTransporter();
  let retries = 3;

  while (retries > 0) {
    try {
      await mailTransporter.sendMail({
        from: `"PeerVerse Community" <${env.GMAIL_USER}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ""),
      });
      logger.info("Email sent", { to, subject });
      return; // Success, exit loop
    } catch (err) {
      retries -= 1;
      logger.warn(`Email sending failed (retries left: ${retries})`, { to, subject, error: err.message });
      if (retries === 0) {
        logger.error("Failed to send email after all retries", { to, subject, error: err.message });
        // We don't throw — email failure shouldn't crash the request
      } else {
        // Wait 2 seconds before retrying
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }
  }
};

module.exports = { sendEmail };
