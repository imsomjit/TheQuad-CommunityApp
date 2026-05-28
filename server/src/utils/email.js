"use strict";

const nodemailer = require("nodemailer");
const env = require("../config/env");
const logger = require("./logger");

/**
 * Gmail SMTP transporter.
 * Uses 'service: gmail' to handle connection timeouts on Render.com.
 * Requires a Gmail App Password (2FA must be enabled on the account).
 */
const createTransporter = () =>
  nodemailer.createTransport({
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

  const transporter = createTransporter();

  try {
    await transporter.sendMail({
      from: `"PeerVerse" <${env.GMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    });
    logger.info("Email sent", { to, subject });
  } catch (err) {
    logger.error("Failed to send email", { to, subject, error: err.message });
    // We don't throw — email failure shouldn't crash the request
  }
};

module.exports = { sendEmail };
