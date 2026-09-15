const { Resend } = require('resend');

// Initialize Resend with the API key from environment variables
// It's safe to instantiate it even if the key is missing (it will throw on send)
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Generic function to send an email using Resend
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} [options.text] - Plain text fallback
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const from = process.env.EMAIL_FROM || 'noreply@yourdomain.com';
    
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY is not configured. Email will not be sent.');
      return;
    }

    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text: text || '',
    });

    if (error) {
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error('Failed to send email via Resend:', error.message);
    // We log the error but don't crash the server or throw, to prevent leaking errors to the frontend
  }
};

/**
 * Sends a password reset email using the Resend API.
 * @param {string} email - The recipient's email address.
 * @param {string} plainToken - The unhashed reset token.
 */
const sendPasswordResetEmail = async (email, plainToken) => {
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
      <p style="font-size: 12px; color: #666; margin-top: 20px;">Or copy and paste this link: <br> ${resetUrl}</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Reset your password - DSA Sheet',
    html: htmlBody,
    text: `Reset your password for DSA Sheet by navigating to: ${resetUrl} (Link expires in 15 minutes.)`,
  });
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
};
