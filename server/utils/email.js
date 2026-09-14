const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

/**
 * Sends a password reset email using Nodemailer and Gmail SMTP.
 * @param {string} email - The recipient's email address.
 * @param {string} plainToken - The unhashed reset token.
 */
const sendPasswordResetEmail = async (email, plainToken) => {
  try {
    const frontendUrl = process.env.CLIENT_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
    // Construct the reset URL using the frontend base URL and the plain token
    const resetUrl = `${frontendUrl}/reset-password/${encodeURIComponent(plainToken)}`;

    const mailOptions = {
      from: `"DSA Sheet" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Reset your password',
      html: `
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
      `,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    require('fs').appendFileSync('email_error.log', new Date().toISOString() + ' ' + error.stack + '\n');
    // We do not throw to prevent leaking errors to the frontend and preventing enumeration
  }
};

module.exports = {
  sendPasswordResetEmail,
};
