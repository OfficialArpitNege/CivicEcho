# CivicEcho - Environment Setup Guide

## Overview
This guide explains how to set up environment variables for both backend and frontend.

---

## Backend Environment Variables

### File: `backend/.env`

**Development Environment Example:**
```env
# Firebase Configuration
FIREBASE_PROJECT_ID=civicecho-dev
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQE...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@civicecho-dev.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
FIREBASE_DATABASE_URL=https://civicecho-dev.firebaseio.com

# Google Cloud Configuration
GCP_PROJECT_ID=civicecho-dev
GOOGLE_APPLICATION_CREDENTIALS=./config/serviceAccountKey.json

# API Keys
GOOGLE_MAPS_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxx

# Server Configuration
PORT=8000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
```

### Obtaining Values

**FIREBASE_PRIVATE_KEY & FIREBASE_CLIENT_EMAIL:**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Copy the JSON file values

**GCP_PROJECT_ID:**
- Firebase Console → Project Settings → General
- Look for "Project ID"

**GOOGLE_MAPS_API_KEY:**
1. Google Cloud Console → APIs & Services → Credentials
2. Create API Key
3. Restrict to Maps JavaScript API

---

## Frontend Environment Variables

### File: `frontend/.env`

**Development Environment Example:**
```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=civicecho-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=civicecho-dev
VITE_FIREBASE_STORAGE_BUCKET=civicecho-dev.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef1234567890

# API Configuration
VITE_API_URL=http://localhost:8000/api

# Google Maps API
VITE_GOOGLE_MAPS_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxx
```

### Obtaining Values

**Firebase Web Config:**
1. Firebase Console → Project Settings → General
2. Scroll to "Your apps" section
3. Click on your web app → Copy Firebase config
4. Map to VITE_* variables

**Example Firebase Config:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyD...",                          // VITE_FIREBASE_API_KEY
  authDomain: "civicecho-dev.firebaseapp.com",   // VITE_FIREBASE_AUTH_DOMAIN
  projectId: "civicecho-dev",                    // VITE_FIREBASE_PROJECT_ID
  storageBucket: "civicecho-dev.appspot.com",    // VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "123456789",                // VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:123456789:web:abcdef1234567890"      // VITE_FIREBASE_APP_ID
};
```

---

## Production Environment Variables

### Backend Production (`backend/.env.production`)
```env
# Firebase Configuration
FIREBASE_PROJECT_ID=civicecho-prod
FIREBASE_PRIVATE_KEY="your-production-key"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-prod@civicecho-prod.iam.gserviceaccount.com

# Google Cloud
GCP_PROJECT_ID=civicecho-prod
GOOGLE_APPLICATION_CREDENTIALS=/app/config/serviceAccountKey.json

# Server
PORT=8000
NODE_ENV=production

# CORS - Production domain
CORS_ORIGIN=https://civicecho.example.com

# Security
JWT_SECRET=your-very-long-production-secret-key-with-high-entropy
```

### Frontend Production (`frontend/.env.production`)
```env
# Firebase Production Config
VITE_FIREBASE_API_KEY=AIzaSyD...production...
VITE_FIREBASE_AUTH_DOMAIN=civicecho-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=civicecho-prod
VITE_FIREBASE_STORAGE_BUCKET=civicecho-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=prod-sender-id
VITE_FIREBASE_APP_ID=1:prod:web:appid

# API Configuration
VITE_API_URL=https://civicecho-backend-xxxxx.run.app/api

# Google Maps API (Production Key)
VITE_GOOGLE_MAPS_API_KEY=AIzaSyD...production...
```

---

## Environment-Specific Configuration

### Development
- Use `localhost` URLs
- Less strict CORS
- Detailed logging
- Test Firebase project

### Staging
- Use staging domain
- Staging Firebase project
- Enable monitoring
- Performance testing

### Production
- Use production domain
- Production Firebase project
- Strict CORS
- Full security headers
- Monitoring & alerting enabled

---

## Docker Environment Variables

### Using docker-compose
Create `.env` in root directory:
```env
# Backend
FIREBASE_PROJECT_ID=civicecho-dev
FIREBASE_PRIVATE_KEY="your-key"
FIREBASE_CLIENT_EMAIL=your-email
GCP_PROJECT_ID=civicecho-dev
GOOGLE_MAPS_API_KEY=your-key

# Frontend
VITE_FIREBASE_API_KEY=your-key
VITE_FIREBASE_AUTH_DOMAIN=your-domain
VITE_FIREBASE_PROJECT_ID=civicecho-dev
VITE_API_URL=http://backend:8000/api
VITE_GOOGLE_MAPS_API_KEY=your-key
```

Load in docker-compose:
```yaml
services:
  backend:
    env_file: .env
```

---

## Security Best Practices

✅ **Do:**
- Use `.env.example` as template (no secrets)
- Store `.env` in `.gitignore`
- Use strong JWT secret (32+ chars)
- Rotate API keys regularly
- Use different keys per environment
- Store secrets in secure vault (production)

❌ **Don't:**
- Commit `.env` files to git
- Use same keys for all environments
- Share secrets in code
- Use weak JWT secrets
- Log sensitive data

---

## Troubleshooting

### Issue: "Cannot find module '*.env'"
**Solution:** 
Create the file from `.env.example`
```bash
cp backend/.env.example backend/.env
```

### Issue: Firebase Authentication Fails
**Solution:**
1. Verify FIREBASE_PROJECT_ID matches Firebase console
2. Check FIREBASE_PRIVATE_KEY format (newlines as `\n`)
3. Download fresh service account key

### Issue: Google Maps Not Loading
**Solution:**
1. Verify GOOGLE_MAPS_API_KEY is valid
2. Check API is enabled in Google Cloud Console
3. Verify domain restrictions if set

### Issue: CORS Error in Frontend
**Solution:**
1. Ensure CORS_ORIGIN matches frontend URL
2. For localhost: `http://localhost:5173`
3. For production: `https://yourdomain.com`

---

## Variable Reference

| Variable | Backend | Frontend | Type | Required |
|----------|---------|----------|------|----------|
| FIREBASE_PROJECT_ID | ✓ | ✓ | String | ✓ |
| FIREBASE_PRIVATE_KEY | ✓ | - | String | ✓ |
| FIREBASE_CLIENT_EMAIL | ✓ | - | String | ✓ |
| GCP_PROJECT_ID | ✓ | - | String | ✓ |
| GOOGLE_MAPS_API_KEY | ✓ | ✓ | String | ✓ |
| PORT | ✓ | - | Number | ✗ |
| NODE_ENV | ✓ | - | String | ✓ |
| CORS_ORIGIN | ✓ | - | String | ✓ |
| VITE_API_URL | - | ✓ | String | ✓ |
| VITE_FIREBASE_API_KEY | - | ✓ | String | ✓ |

---

## Next Steps

1. Create `.env` files from examples
2. Fill in your Firebase credentials
3. Test connection with health endpoints
4. Verify all variables are loaded
5. Start development servers

---

**Environment Setup Complete! ✨**
