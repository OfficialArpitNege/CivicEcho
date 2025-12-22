# Production Migration Guide - Real Firebase & Google Cloud

## Overview

This guide explains how to migrate from Firebase Emulator (local dev) to **Real Firebase and Google Cloud APIs** for production deployment.

---

## Prerequisites

- ✅ CivicEcho running locally with emulator
- 📦 Firebase project created (or ready to create)
- 📦 Google Cloud project created (or ready to create)
- 💳 Credit card (for Google Cloud services)

---

## Step 1: Create Firebase Project

### Option A: New Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add Project"
3. Name it (e.g., "civicecho-prod")
4. Enable Google Analytics (optional)
5. Create project
6. Wait for initialization (~30 seconds)

### Option B: Use Existing Firebase Project

- Just proceed to Step 2

---

## Step 2: Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get Started"
3. Select "Email/Password"
4. Enable it
5. Save

---

## Step 3: Create Firestore Database

1. Go to **Firestore Database**
2. Click "Create Database"
3. Choose mode: **Start in production mode** (we'll configure security rules)
4. Choose location: **us-central1** (or nearest to you)
5. Click "Create"
6. Wait for initialization

### Configure Security Rules for Development

1. Go to Firestore → **Rules** tab
2. Replace rules with production-grade rules:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Authenticated users can read/write their own data
    match /complaints/{complaintId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth != null && (resource.data.userId == request.auth.uid || request.auth.token.admin == true);
    }
    
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
    
    match /clusters/{clusterId} {
      allow read: if request.auth != null;
      allow write: if request.auth.token.admin == true;
    }
  }
}
```

3. Click "Publish"

---

## Step 4: Get Firebase Service Account Key

1. Go to **Project Settings** (gear icon)
2. Go to **Service Accounts** tab
3. Click **Generate New Private Key**
4. Download the JSON file
5. Save it locally (don't commit to git!)

**File contents will look like:**
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "xxx",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...",
  "client_email": "firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com",
  ...
}
```

---

## Step 5: Set Up Google Cloud Project (for Speech-to-Text & NLP)

### Enable APIs

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Make sure your project is selected (top dropdown)
3. Go to **APIs & Services** → **Enabled APIs and services**
4. Click **Enable APIs and Services** button
5. Search for and enable:
   - ✅ **Google Cloud Speech-to-Text API**
   - ✅ **Google Natural Language API**
   - ✅ **Google Maps API** (if using custom Maps features)

### Create Service Account for Google APIs

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **Service Account**
3. Name: "civicecho-backend"
4. Click **Create and Continue**
5. Add roles:
   - **Cloud Speech Client** (for Speech-to-Text)
   - **Cloud Language Interpreter** (for NLP)
6. Click **Continue** → **Done**

### Generate API Key

1. Click the service account just created
2. Go to **Keys** tab
3. Click **Add Key** → **Create new key** → **JSON**
4. Download the JSON file
5. Save it to `backend/config/serviceAccountKey.json`
6. Add to `.gitignore`:

```gitignore
backend/config/serviceAccountKey.json
backend/.env
frontend/.env
```

---

## Step 6: Get Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Go to **APIs & Services** → **Credentials**
3. Click **Create Credentials** → **API Key**
4. Choose "Restrict key"
5. Application restrictions: **HTTP referrers (websites)**
6. Add referrers: `http://localhost:5173`, `http://localhost`, `https://your-domain.com`
7. API restrictions: **Google Maps JavaScript API**
8. Copy the key

---

## Step 7: Configure Environment Variables

### Backend (.env)

```env
# ✅ PRODUCTION MODE
FIREBASE_MODE=production
NODE_ENV=production

# ✅ REAL FIREBASE CREDENTIALS (from Step 4)
FIREBASE_PROJECT_ID=your-real-project-id
FIREBASE_PRIVATE_KEY_ID=xxx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=xxx
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# DO NOT SET (not used in production)
FIREBASE_AUTH_EMULATOR_HOST=
FIREBASE_FIRESTORE_EMULATOR_HOST=

# ✅ REAL GOOGLE CLOUD (from Step 5)
GOOGLE_APPLICATION_CREDENTIALS=./config/serviceAccountKey.json
GCP_PROJECT_ID=your-gcp-project-id
GOOGLE_MAPS_API_KEY=AIzaSy...
GOOGLE_SPEECH_TO_TEXT_API_KEY=(from service account JSON)

# Server
PORT=8000
CORS_ORIGIN=http://localhost:5173,https://your-domain.com
```

### Frontend (.env.production)

Create new file `frontend/.env.production`:

```env
# ✅ PRODUCTION MODE
VITE_FIREBASE_MODE=production

# ✅ REAL FIREBASE CREDENTIALS (from Firebase Console)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# ✅ REAL API KEYS (from Step 6)
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...

# ✅ PRODUCTION API URL (your server URL)
VITE_API_URL=https://your-api.example.com/api
```

**How to get Firebase Web Config:**
1. Firebase Console → Project Settings
2. Scroll to "Your apps"
3. Select web app (or create one)
4. Copy config object

---

## Step 8: Deploy Backend to Google Cloud Run

### Build Docker Image

```bash
cd backend
docker build -t civicecho-backend:latest .
```

### Push to Google Container Registry

```bash
# Set up authentication
gcloud auth login
gcloud config set project YOUR_GCP_PROJECT_ID

# Configure Docker
gcloud auth configure-docker

# Tag image
docker tag civicecho-backend:latest gcr.io/YOUR_GCP_PROJECT_ID/civicecho-backend:latest

# Push image
docker push gcr.io/YOUR_GCP_PROJECT_ID/civicecho-backend:latest
```

### Deploy to Cloud Run

```bash
gcloud run deploy civicecho-backend \
  --image gcr.io/YOUR_GCP_PROJECT_ID/civicecho-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars FIREBASE_MODE=production,FIREBASE_PROJECT_ID=your-project-id,NODE_ENV=production \
  --service-account civicecho-backend@YOUR_GCP_PROJECT_ID.iam.gserviceaccount.com
```

**Result:** Get your API URL (e.g., `https://civicecho-backend-xxxxx.run.app`)

---

## Step 9: Deploy Frontend to Firebase Hosting

### Build Frontend

```bash
cd frontend
npm run build
```

### Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

**Or manually with your domain:**
1. Firebase Console → Hosting
2. Connect your domain
3. Upload `frontend/dist` folder

---

## Step 10: Testing Production Setup Locally

Before deploying, test real Firebase locally:

```bash
# backend/.env
FIREBASE_MODE=production
# Add real credentials...

# frontend/.env
VITE_FIREBASE_MODE=production
# Add real credentials...

# Run servers
npm run dev  # Both frontend and backend
```

**Expected Results:**
- ✅ Signup creates real Firebase user
- ✅ Complaints saved to real Firestore
- ✅ NLP and Speech-to-Text use real Google APIs
- ✅ Maps use real Google API

---

## Step 11: Monitoring & Logging

### Backend Logging

1. Google Cloud Console → **Cloud Logging**
2. Filter: `resource.type="cloud_run_revision"`
3. Watch logs as requests come in

### Firebase Monitoring

1. Firebase Console → **Usage** tab
2. Monitor:
   - ✅ Authentication usage
   - ✅ Firestore read/write counts
   - ✅ Storage usage

### Error Tracking

1. Firebase Console → **Crashlytics** (if enabled)
2. View error reports

---

## Step 12: Scaling & Optimization

### Firestore Indexes

As queries grow complex, create indexes:

1. Firebase Console → **Firestore** → **Indexes**
2. Create composite indexes for:
   - `complaints` sorted by timestamp
   - `complaints` filtered by category and status

### Firestore Backup

Enable automated backups:

1. Google Cloud Console → **Datastore** → **Backups**
2. Create a backup schedule (daily/weekly)

### Cost Optimization

Monitor Firestore costs:
- Read operations: $0.06 per 100K
- Write operations: $0.18 per 100K
- Delete operations: $0.02 per 100K

Optimize by:
- ✅ Indexing appropriately
- ✅ Batching reads/writes
- ✅ Using pagination

---

## Troubleshooting

### Issue: "Permission denied" when connecting to real Firebase

**Solution:**
```bash
# Check credentials file
cat backend/config/serviceAccountKey.json

# Verify FIREBASE_PRIVATE_KEY is properly escaped
echo $FIREBASE_PRIVATE_KEY
```

### Issue: "Speech-to-Text API not enabled"

**Solution:**
```bash
# Enable via gcloud CLI
gcloud services enable speech.googleapis.com
gcloud services enable language.googleapis.com
```

### Issue: Cloud Run deployment fails

**Solution:**
1. Check logs: `gcloud run logs read civicecho-backend --limit 50`
2. Verify service account has correct roles
3. Ensure environment variables are set

---

## Rollback Plan

If production has issues:

1. **Keep emulator .env separate:**
   ```
   backend/.env (production)
   backend/.env.local (emulator) 
   ```

2. **Quick Fallback:**
   ```bash
   # Switch back to emulator
   FIREBASE_MODE=emulator npm run dev
   ```

3. **Database Snapshot:**
   - Export Firestore data before major changes
   - Firebase Console → **Backups**

---

## Summary

| Component | Emulator | Production |
|-----------|----------|-----------|
| **Auth** | Emulator (local) | Real Firebase |
| **Firestore** | Emulator (local) | Real Firestore (global) |
| **Speech-to-Text** | Real (same) | Real (same) |
| **NLP** | Real (same) | Real (same) |
| **Maps** | Real (same) | Real (same) |
| **Backend** | `localhost:8000` | `Cloud Run` |
| **Frontend** | `localhost:5173` | `Firebase Hosting` |

---

## Checklist

Before going to production:

- ✅ Firebase project created
- ✅ Firestore security rules configured
- ✅ Service account keys downloaded
- ✅ Google APIs enabled
- ✅ Environment variables set in production
- ✅ Backend tested with real Firebase locally
- ✅ Frontend tested with real Firebase locally
- ✅ Backend deployed to Cloud Run
- ✅ Frontend deployed to Firebase Hosting
- ✅ Domain configured
- ✅ SSL certificate enabled
- ✅ Monitoring set up
- ✅ Backups enabled

---

## Contact & Support

For issues:
1. Check Firebase Console for error messages
2. Check Google Cloud Console logs
3. Review this guide's Troubleshooting section

