/**
 * emailService.js — Resend-powered email service for GameHub
 *
 * Usage:
 *   const emailService = require('./emailService');
 *   await emailService.sendPasswordReset({ to, username, resetUrl });
 *   await emailService.sendWelcome({ to, username });
 *   await emailService.sendTest({ to });
 */

const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM_EMAIL || 'GameHub <onboarding@resend.dev>';

/* ─── Shared email template wrapper ──────────────────────── */
const layout = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GameHub</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 0;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0"
        style="background:#14141c;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;max-width:480px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="padding:28px 32px;border-bottom:1px solid rgba(255,255,255,0.06);">
            <span style="font-size:22px;font-weight:900;letter-spacing:0.1em;color:#fff;">
              GAME<span style="color:#d4f53c;">HUB</span>
            </span>
          </td>
        </tr>
        <!-- Body -->
        <tr><td style="padding:32px;">${content}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
            <p style="margin:0;color:rgba(255,255,255,0.3);font-size:11px;">
              © ${new Date().getFullYear()} GameHub. You received this because an action was taken on your account.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const btn = (url, label) =>
  `<a href="${url}"
     style="display:inline-block;margin:24px 0 8px;padding:13px 32px;
            background:#d4f53c;color:#0a0a0f;font-weight:800;font-size:14px;
            letter-spacing:0.06em;text-transform:uppercase;text-decoration:none;
            border-radius:8px;">${label}</a>`;

const muted = (text) =>
  `<p style="margin:16px 0 0;color:rgba(255,255,255,0.35);font-size:12px;line-height:1.6;">${text}</p>`;

/* ─── Internal send helper with logging ──────────────────── */
async function send({ to, subject, html }) {
  const isConfigured = process.env.RESEND_API_KEY &&
    process.env.RESEND_API_KEY !== 're_your_api_key_here';

  if (!isConfigured) {
    console.warn('⚠️  RESEND_API_KEY not configured — email not sent.');
    console.warn('   Subject:', subject);
    console.warn('   To:', to);
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({ from: FROM, to, subject, html });

    if (error) {
      console.error(`❌ Email send failed [${subject}] → ${to}:`, error);
      return { success: false, error };
    }

    console.log(`✅ Email sent [${subject}] → ${to} (id: ${data.id})`);
    return { success: true, id: data.id };
  } catch (err) {
    console.error(`❌ Email exception [${subject}] → ${to}:`, err.message);
    return { success: false, error: err.message };
  }
}

/* ─── Public email templates ──────────────────────────────── */

/**
 * Send password reset email
 */
async function sendPasswordReset({ to, username, resetUrl }) {
  const html = layout(`
    <h2 style="margin:0 0 8px;color:#fff;font-size:22px;font-weight:800;">Reset Your Password</h2>
    <p style="color:rgba(255,255,255,0.6);line-height:1.7;margin:0 0 4px;">
      Hi <strong style="color:#fff;">${username}</strong>,
    </p>
    <p style="color:rgba(255,255,255,0.6);line-height:1.7;margin:0;">
      We received a request to reset your GameHub password.
      Click below — this link expires in <strong style="color:#d4f53c;">1 hour</strong>.
    </p>
    ${btn(resetUrl, 'Reset Password')}
    ${muted(`Or copy this link: <a href="${resetUrl}" style="color:#d4f53c;">${resetUrl}</a>`)}
    ${muted("If you didn't request this, you can safely ignore this email.")}
  `);

  return send({ to, subject: 'GameHub — Reset Your Password', html });
}

/**
 * Send welcome email after registration
 */
async function sendWelcome({ to, username }) {
  const dashUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const html = layout(`
    <h2 style="margin:0 0 8px;color:#fff;font-size:22px;font-weight:800;">Welcome to GameHub! 🎮</h2>
    <p style="color:rgba(255,255,255,0.6);line-height:1.7;margin:0;">
      Hey <strong style="color:#fff;">${username}</strong>, your account is ready.
      Discover, track, and wishlist your favourite games.
    </p>
    ${btn(dashUrl, 'Go to GameHub')}
    ${muted('Explore new releases, top charts, and personalised recommendations.')}
  `);

  return send({ to, subject: 'Welcome to GameHub 🎮', html });
}

/**
 * Send a test email (used by the /api/email/test endpoint)
 */
async function sendTest({ to }) {
  const html = layout(`
    <h2 style="margin:0 0 8px;color:#d4f53c;font-size:22px;font-weight:800;">✅ Test Email</h2>
    <p style="color:rgba(255,255,255,0.6);line-height:1.7;margin:0;">
      Your Resend integration is working correctly!<br/>
      This test was sent at <strong style="color:#fff;">${new Date().toUTCString()}</strong>.
    </p>
    ${muted('You can now use GameHub email features like forgot-password and welcome emails.')}
  `);

  return send({ to, subject: 'GameHub — Email Test ✅', html });
}

module.exports = { send, sendPasswordReset, sendWelcome, sendTest };
