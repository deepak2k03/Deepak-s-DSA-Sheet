const { google } = require('googleapis');

/**
 * Creates the raw MIME email string in base64url format
 */
const makeBody = (to, from, subject, message) => {
  const str = [
    `To: ${to}`,
    `From: ${from}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    '',
    message
  ].join('\n');
  return Buffer.from(str).toString('base64url');
};

/**
 * Sends a password reset email using the Gmail REST API (over HTTPS).
 * Bypasses SMTP blocks on free hosting tiers (e.g., Render Free).
 * @param {string} email - The recipient's email address.
 * @param {string} plainToken - The unhashed reset token.
 */
const sendPasswordResetEmail = async (email, plainToken) => {
  try {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.OAUTH_CLIENT_ID,
      process.env.OAUTH_CLIENT_SECRET
    );
    oAuth2Client.setCredentials({ refresh_token: process.env.OAUTH_REFRESH_TOKEN });

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const frontendUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${encodeURIComponent(plainToken)}`;

    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Reset your password</h2>
        <p>We received a request to reset your password for your account.</p>
        <p>Click the button below to set a new password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #3b82f6; color: #fff; text-decoration: none; border-radius: 5px; margin: 10px 0;">
          Reset Password
        </a>
        <p>This link expires in 15 minutes.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `;

    const raw = makeBody(email, `"DSA Sheet" <${process.env.EMAIL_USER}>`, 'Reset your password', htmlBody);

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw }
    });
  } catch (error) {
    console.error('Failed to send password reset email via REST:', error);
    require('fs').appendFileSync('email_error.log', new Date().toISOString() + ' ' + error.stack + '\n');
  }
};

module.exports = {
  sendPasswordResetEmail,
};
