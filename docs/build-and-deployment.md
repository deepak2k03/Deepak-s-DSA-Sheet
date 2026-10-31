# Build & Deployment Guide

This document details the build procedures, environment variable requirements, test execution, and deployment strategies for both the client and server applications.

---

## 1. Development Environment Setup

### 1.1 Prerequisites
- Node.js >= 20.x
- npm >= 10.x
- MongoDB Atlas cluster URI or local MongoDB instance

### 1.2 Installation
Run `npm install` inside both directories:
```bash
# Install client dependencies
npm --prefix client install

# Install server dependencies
npm --prefix server install
```

### 1.3 Running Locally
Start both processes concurrently or in separate terminal sessions:
```bash
# Terminal 1: Start backend server (port 5000)
npm --prefix server run dev

# Terminal 2: Start frontend Vite dev server (port 5173)
npm --prefix client run dev
```

---

## 2. Environment Variables

### 2.1 Client (`client/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_URL` | Base URL for backend API requests | `http://localhost:5000/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID for SSO | `123456...apps.googleusercontent.com` |

### 2.2 Server (`server/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | HTTP port for Express server | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for signing session tokens | `your-secure-jwt-secret` |
| `CLIENT_URL` | Allowed CORS origin & client URL | `http://localhost:5173` |
| `GOOGLE_CLIENT_ID` | Google OAuth verification ID | `123456...apps.googleusercontent.com` |
| `RESEND_API_KEY` | Resend API key for email delivery | `re_123456789...` |
| `EMAIL_FROM` | Sender email address | `DSA Sheet <noreply@domain.com>` |
| `R2_ACCOUNT_ID` | Cloudflare R2 Account ID | `abcdef123456...` |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 Access Key | `abcdef123456...` |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 Secret Key | `secret...` |
| `R2_BUCKET_NAME` | Cloudflare R2 Bucket Name | `dsa-sheet-visualizers` |
| `R2_PUBLIC_URL` | Public CDN URL for R2 bucket | `https://visualizers.domain.com` |

---

## 3. Testing & Verification

Both packages utilize the native Node.js test runner (`node --test`), eliminating third-party test framework overhead:

```bash
# Run client unit tests
npm --prefix client test

# Run server unit tests
npm --prefix server test

# Verify client TypeScript and production bundle compilation
npm --prefix client run build
```

---

## 4. Production Build & Deployment

### 4.1 Frontend Deployment (Vercel / Netlify / Cloudflare Pages)
- **Root Directory**: `client`
- **Build Command**: `npm run build` (runs `tsc -b && vite build`)
- **Output Directory**: `dist`
- **SPA Routing**: Ensured via `client/vercel.json`:
  ```json
  {
    "rewrites": [
      {
        "source": "/(.*)",
        "destination": "/index.html"
      }
    ]
  }
  ```

### 4.2 Backend Deployment (Render / Railway / VPS / Docker)
- **Root Directory**: `server`
- **Start Command**: `node index.js`
- **Environment**: Ensure all variables in `server/.env` are populated in the hosting provider dashboard.
- **CORS Whitelist**: Ensure `CLIENT_URL` matches the production frontend domain exactly.
- **Process Management**: Use a supervisor such as PM2 or systemd to auto-restart the Node process on unexpected exceptions.

