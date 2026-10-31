# Third-Party Integrations

This document covers external integrations used by the DSA Sheet platform: Cloudflare R2 object storage, Resend transactional email, Google Identity OAuth 2.0, and MongoDB Atlas.

---

## 1. Cloudflare R2 Storage (`server/config/r2.js`)

Cloudflare R2 provides zero-egress S3-compatible object storage for standalone interactive algorithm visualizer HTML files and assets.

### 1.1 Configuration Parameters
The following environment variables in `server/.env` configure R2:
- `R2_ACCOUNT_ID`: Cloudflare account identifier.
- `R2_ACCESS_KEY_ID`: S3-compatible API token access key.
- `R2_SECRET_ACCESS_KEY`: S3-compatible API token secret key.
- `R2_BUCKET_NAME`: Target bucket name.
- `R2_PUBLIC_URL`: Optional custom domain or public bucket URL for direct asset delivery.

### 1.2 Core Operations
- **`uploadToR2(key, body, contentType)`**: Streams or pushes file buffer to R2 using `PutObjectCommand`.
- **`getFromR2(key)`**: Retrieves object body and headers using `GetObjectCommand`.
- **`deleteFromR2(key)`**: Deletes asset using `DeleteObjectCommand`.
- **`checkR2Connection()`**: Tests credential validity and bucket accessibility via `HeadBucketCommand`.

If R2 credentials are not set, the platform safely logs a warning and falls back to local storage or marks uploads as unavailable without crashing.

---

## 2. Resend Email Delivery (`server/utils/email.js`)

Resend provides reliable transactional email delivery for password recovery and account verification.

### 2.1 Configuration Parameters
- `RESEND_API_KEY`: API key obtained from [resend.com](https://resend.com).
- `EMAIL_FROM`: Sender address format (e.g., `DSA Sheet <noreply@yourdomain.com>`).
- `CLIENT_URL`: Base URL of the React client (e.g., `http://localhost:5173` or production domain) used to formulate reset links.

### 2.2 Error Handling & Resilience
- If `RESEND_API_KEY` is omitted in development, `sendEmail` prints a warning to the console and safely returns `{ success: false }` instead of throwing an unhandled rejection.
- All email attempts in `routes/auth.js` are wrapped in try/catch blocks to ensure API requests still conclude gracefully even if downstream delivery fails.

---

## 3. Google OAuth 2.0 (`@react-oauth/google` & `google-auth-library`)

Provides passwordless authentication using Google accounts.

### 3.1 Client-Side Setup
- Wrapped at the application root in `client/src/main.tsx` or `App.tsx` using Google OAuth provider.
- Environment Variable: `VITE_GOOGLE_CLIENT_ID` in `client/.env`.

### 3.2 Server-Side Verification
- Environment Variable: `GOOGLE_CLIENT_ID` in `server/.env`.
- Handled in `server/routes/auth.js`:
  ```javascript
  const { OAuth2Client } = require('google-auth-library');
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  ```
- Extracts `sub` (Google user ID), `email`, and `name`, linking or creating a User record with `authProvider: 'google'`.

---

## 4. MongoDB Atlas (`server/config/db.js` or `index.js`)

Database clustering and persistent document storage.

### 4.1 Configuration
- `MONGODB_URI`: Standard or SRV connection string with credentials and database name (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/dsasheet?retryWrites=true&w=majority`).
- Connection flags ensure automatic index builds, reconnection retry logic, and pool size optimizations.

