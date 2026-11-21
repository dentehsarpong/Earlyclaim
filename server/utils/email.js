/**
 * Email utility — wraps nodemailer with a graceful no-op when not configured.
 * Set EMAIL_HOST / EMAIL_USER / EMAIL_PASS in .env to activate.
 * Also supports optional SMS/WhatsApp hook when ENABLE_SMS=true.
 */

let nodemailer = null;
try {
  nodemailer = require('nodemailer');
} catch (e) {
  // nodemailer is optional if dependencies are not yet installed
}

let transporter = null;

function getTransporter() {
  if (!nodemailer) return null;
  if (transporter) return transporter;
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  return transporter;
}

/**
 * Send an email. Silently skips if not configured.
 * @returns {Promise<boolean>} true on success, false otherwise
 */
async function sendEmail({ to, subject, html, text }) {
  const transport = getTransporter();
  if (!transport) {
    // Log so the developer can see what would have been sent
    console.info(`[email] (not configured) → ${to} | ${subject}`);
    return false;
  }

  try {
    await transport.sendMail({
      from: `"EarlyClaim" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]+>/g, '')
    });
    return true;
  } catch (err) {
    console.error('[email] send error:', err.message);
    return false;
  }
}

/**
 * Send SMS / WhatsApp via Twilio (if configured).
 * Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER in .env
 * and ENABLE_SMS=true.
 */
async function sendSms(to, body) {
  if (process.env.ENABLE_SMS !== 'true') {
    console.info(`[sms] (disabled) → ${to} | ${body}`);
    return false;
  }

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.info(`[sms] (not configured) → ${to} | ${body}`);
    return false;
  }

  try {
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const from = process.env.ENABLE_WHATSAPP === 'true'
      ? `whatsapp:${process.env.TWILIO_FROM_NUMBER}`
      : process.env.TWILIO_FROM_NUMBER;
    const toNumber = process.env.ENABLE_WHATSAPP === 'true' ? `whatsapp:${to}` : to;
    await client.messages.create({ body, from, to: toNumber });
    return true;
  } catch (err) {
    console.error('[sms] send error:', err.message);
    return false;
  }
}

module.exports = { sendEmail, sendSms };
