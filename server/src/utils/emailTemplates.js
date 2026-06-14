"use strict";

const getBaseTemplate = (content, title) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f4efe3;
      margin: 0;
      padding: 0;
      color: #1c1814;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      border: 1px solid #d8cfb9;
    }
    .header {
      background-color: #08090d;
      padding: 24px;
      text-align: center;
      border-bottom: 3px solid #ffb340;
    }
    .header h1 {
      color: #f0efe6;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .header h1 span {
      color: #ffb340;
      font-style: italic;
    }
    .content {
      padding: 32px 24px;
      font-size: 16px;
      line-height: 1.6;
    }
    .footer {
      background-color: #f4efe3;
      padding: 20px 24px;
      text-align: center;
      font-size: 13px;
      color: #8a8278;
      border-top: 1px solid #d8cfb9;
    }
    .otp-box {
      background-color: #f4efe3;
      border: 1px dashed #d8cfb9;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin: 24px 0;
    }
    .otp-code {
      font-size: 36px;
      font-weight: 700;
      letter-spacing: 6px;
      color: #c14a1a;
      margin: 0;
    }
    .btn {
      display: inline-block;
      background-color: #c14a1a;
      color: #ffffff;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>The <span>PeerVerse</span></h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} PeerVerse. All rights reserved.</p>
      <p>If you didn't request this email, you can safely ignore it.</p>
    </div>
  </div>
</body>
</html>
`;

const getOtpEmailTemplate = (otp) => {
  const content = `
    <h2 style="margin-top: 0; color: #1c1814;">Verify your email</h2>
    <p>Welcome to PeerVerse! We're excited to have you on board.</p>
    <p>Please use the following verification code to complete your registration:</p>
    <div class="otp-box">
      <p class="otp-code">${otp}</p>
    </div>
    <p style="font-size: 14px; color: #5a534a;">This code will expire in 15 minutes.</p>
  `;
  return getBaseTemplate(content, "Verify your email for PeerVerse");
};

const getResendOtpEmailTemplate = (otp) => {
  const content = `
    <h2 style="margin-top: 0; color: #1c1814;">Your verification code</h2>
    <p>You requested a new verification code for your PeerVerse account.</p>
    <div class="otp-box">
      <p class="otp-code">${otp}</p>
    </div>
    <p style="font-size: 14px; color: #5a534a;">This code will expire in 15 minutes.</p>
  `;
  return getBaseTemplate(content, "Your new verification code for PeerVerse");
};

const getWelcomeEmailTemplate = (name) => {
  const content = `
    <h2 style="margin-top: 0; color: #1c1814;">Welcome to the community, ${name}!</h2>
    <p>Your email has been successfully verified, and your account is now fully active.</p>
    <p>We built PeerVerse to be an annotated lab notebook for people who code. We hope you'll find it a valuable space to share, learn, and grow alongside your peers.</p>
    <a href="https://peerverse.com" class="btn">Explore PeerVerse</a>
  `;
  return getBaseTemplate(content, "Welcome to The PeerVerse!");
};

const getBirthdayEmailTemplate = (name) => {
  const content = `
    <h2 style="margin-top: 0; color: #1c1814;">Happy Birthday, ${name}! 🎉</h2>
    <p>All of us at PeerVerse want to wish you a fantastic birthday!</p>
    <p>We hope this year brings you joy, success, and lots of clean, bug-free code. Keep learning and sharing with the community.</p>
    <div class="otp-box" style="font-size: 24px; border: none; padding: 10px;">
      🎂 🎈 🎁
    </div>
    <p>Have a wonderful day!</p>
  `;
  return getBaseTemplate(content, "Happy Birthday from PeerVerse!");
};

const getResetPasswordEmailTemplate = (resetUrl, name) => {
  const content = `
    <h2 style="margin-top: 0; color: #1c1814;">Reset your password, ${name}</h2>
    <p>We received a request to reset the password for your PeerVerse account.</p>
    <p>You can reset your password by clicking the button below:</p>
    <a href="${resetUrl}" class="btn">Reset Password</a>
    <p style="margin-top: 24px; font-size: 14px; color: #5a534a;">If you didn't request a password reset, you can safely ignore this email. This link will expire in 15 minutes.</p>
  `;
  return getBaseTemplate(content, "Reset your PeerVerse password");
};

module.exports = {
  getOtpEmailTemplate,
  getResendOtpEmailTemplate,
  getWelcomeEmailTemplate,
  getBirthdayEmailTemplate,
  getResetPasswordEmailTemplate
};
