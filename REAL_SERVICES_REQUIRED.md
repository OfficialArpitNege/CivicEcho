# REAL SERVICES REQUIRED FOR CIVICECHO MVP

## Overview

To transform CivicEcho from mock-based to production-ready, you need **real** services from Google and Firebase.

---

## 1. Firebase Authentication

### What it does:
- Real user registration and login
- Email/password authentication
- User session management
- Role-based access (citizen vs authority)

### Setup Required:
1. Create Firebase project: https://console.firebase.google.com
2. Enable Authentication > Email/Password
3. Download service account key (JSON)
4. Create Web app for frontend
5. Get Firebase config values

### Environment Variables Needed:
```
# Backend (Firebase Admin SDK)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=<copy from service account JSON>
FIREBASE_CLIENT_EMAIL=<copy from service account JSON>
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# Frontend (Firebase Client SDK)
VITE_FIREBASE_API_KEY=<from web app config>
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<from web app config>
VITE_FIREBASE_APP_ID=<from web app config>
```

### Replaces:
- ❌ `frontend/src/services/mockAuth.js` (DELETED)
- ❌ Mock logic in `frontend/src/context/AuthContext.jsx`

---

## 2. Firestore Database

### What it does:
- Persistent data storage
- Real-time updates
- Complex queries
- Transaction support
- Automatic scaling

### Schema:
```
collections/
├── users/{uid}
│   ├── email
│   ├── displayName
│   ├── role (citizen | authority)
│   └── createdAt
│
├── complaints/{complaintId}
│   ├── userId
│   ├── description
│   ├── latitude / longitude
│   ├── category
│   ├── severity
│   ├── status (reported | verified | in_progress | resolved | closed)
│   ├── upvotes
│   ├── audioUrl (if voice complaint)
│   ├── sentiment (score + magnitude from NLP)
│   ├── clusterId
│   ├── createdAt
│   └── upvotes/ (subcollection)
│       └── {userId}
│
└── clusters/{clusterId}
    ├── category
    ├── severity
    ├── location (lat/lng)
    ├── complaints[] (array of complaint IDs)
    ├── complaintCount
    ├── status
    └── createdAt
```

### Setup Required:
1. Create Firestore Database in Firebase project
2. Set security rules (from `docs/FIRESTORE_SCHEMA.md`)
3. Create collections and indexes

### Replaces:
- ❌ `backend/src/config/mockFirestore.js` (DELETED)
- ❌ In-memory data storage
- ✅ All real data persistence

---

## 3. Google Cloud Project

### What it does:
- Hosts Google APIs
- Service account authentication
- Billing management
- API monitoring

### Setup Required:
1. Create Google Cloud project: https://console.cloud.google.com
2. Enable APIs:
   - ✅ Speech-to-Text API
   - ✅ Natural Language API
   - ✅ Cloud Storage (for audio files)
   - ✅ Maps API
3. Create service account
4. Download service account key (JSON)
5. Enable billing

### Environment Variables Needed:
```
# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=./backend/config/serviceAccountKey.json
GCP_PROJECT_ID=your-gcp-project-id
```

### Files Needed:
- `backend/config/serviceAccountKey.json` (real Google service account)

---

## 4. Speech-to-Text API

### What it does:
- Converts user voice recordings to text
- Automatic language detection
- Confidence scoring

### Current Code:
- **File**: `backend/src/services/speechService.js`
- **Status**: Already has real API calls ✅
- **But**: Needs `speechClient` to be initialized from real Google SDK

### Setup Required:
1. Enable Speech-to-Text API in Google Cloud Console
2. Service account must have Speech-to-Text permission
3. Must have billing enabled

### Will Work After:
- ✅ Real Google Cloud project created
- ✅ Real service account configured
- ✅ Real `serviceAccountKey.json` in place

---

## 5. Natural Language API

### What it does:
- Analyzes complaint text
- Extracts entities (place names, organizations)
- Determines sentiment (positive/negative/neutral)
- Extracts key phrases

### Current Code:
- **File**: `backend/src/services/nlpService.js`
- **Status**: Already has real API calls ✅
- **But**: Needs `languageClient` to be initialized from real Google SDK

### Setup Required:
1. Enable Natural Language API in Google Cloud Console
2. Service account must have NLP permission
3. Must have billing enabled

### Will Work After:
- ✅ Real Google Cloud project created
- ✅ Real service account configured
- ✅ Real `serviceAccountKey.json` in place

---

## 6. Google Maps API

### What it does:
- Display complaint locations on map
- Heatmap visualization
- Marker clustering

### Current Code:
- **File**: `frontend/src/pages/MapView.jsx`
- **Status**: Already loads real API ✅
- **But**: Needs valid API key

### Setup Required:
1. Enable Maps JavaScript API in Google Cloud Console
2. Create API key (or use service account)
3. Add to frontend environment variable

### Environment Variable:
```
VITE_GOOGLE_MAPS_API_KEY=your-api-key
```

### Will Work After:
- ✅ Valid Google Cloud API key created
- ✅ Maps API enabled in console

---

## 7. Cloud Storage (For Audio Files)

### What it does:
- Store user voice recordings
- Generate download URLs
- Automatic cleanup (optional TTL)

### Current Implementation:
- Not yet implemented (use for Phase 2)
- Backend saves `audioUrl` field for future reference

### Setup Required:
1. Create Cloud Storage bucket in Google Cloud
2. Set CORS for browser uploads
3. Create service account credentials

---

## 8. Cloud Run (Deployment)

### What it does:
- Deploy backend API to production
- Automatic scaling
- Real URLs (not localhost)
- Real traffic monitoring

### Setup Required:
1. Enable Cloud Run in Google Cloud Console
2. Push Docker image to Container Registry
3. Deploy with environment variables
4. Configure service

### File:
- `backend/Dockerfile` (already ready)

---

## Summary of Setup Checklist

### IMMEDIATE (Before removing mocks):
- [ ] Create Firebase project
- [ ] Create Google Cloud project
- [ ] Link them together
- [ ] Enable all required APIs
- [ ] Create service accounts
- [ ] Download all JSON keys
- [ ] Get all environment variables

### AFTER Setup:
- [ ] Delete mock files
- [ ] Update environment variables
- [ ] Replace mock auth with real Firebase
- [ ] Replace mock DB with real Firestore
- [ ] Verify Google APIs work
- [ ] Test end-to-end with real data

### BEFORE PRODUCTION:
- [ ] Deploy backend to Cloud Run
- [ ] Deploy frontend to Firebase Hosting
- [ ] Configure production URLs
- [ ] Enable billing
- [ ] Set up monitoring/alerts
- [ ] Create backup strategy

---

## Estimated Setup Time

- Firebase project: **5 min**
- Google Cloud project: **10 min**
- APIs + Keys: **10 min**
- Environment variables: **5 min**
- Removing mocks + updating code: **30 min**
- Testing: **20 min**
- **Total: ~80 minutes**

---

## Next Steps

### Option 1: I set up Firebase Emulator for local dev (Recommended for testing)
- Firebase Emulator = local Firebase for development
- Real APIs for production
- Can test everything locally without real billing

### Option 2: I remove mocks and use real services immediately
- Need all credentials ready
- Real billing charges may apply
- Good for final demo

## What should we do?

**Type your preference:**
- `emulator` - Set up Firebase Emulator for local dev (can test without real credentials)
- `real` - Remove mocks and prepare for real services (need real credentials)
- `both` - Set up emulator NOW, then migrate to real services LATER

**Current status: MOCKS FULLY IDENTIFIED, READY FOR REMOVAL**
