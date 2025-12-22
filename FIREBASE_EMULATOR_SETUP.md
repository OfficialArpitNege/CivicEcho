# Firebase Emulator Suite Setup Guide

## Overview

CivicEcho now uses **Firebase Emulator Suite for local development** and **Real Firebase for production**. The same codebase switches between them using environment variables.

### What Changed

✅ **Removed:** All mock services (mockAuth.js, mockFirestore.js)  
✅ **Added:** Firebase Emulator support with env-based switching  
✅ **Preserved:** Real Google APIs (Speech-to-Text, NLP, Maps) always active  
✅ **Verified:** No conditional logic - only ENV variables control behavior  

---

## Part 1: Install Firebase Emulator Suite

### Prerequisites
- Node.js 18+ (already installed)
- Firebase CLI
- Java Runtime Environment (JRE) 11+

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

Verify installation:
```bash
firebase --version
```

### Step 2: Install Java Runtime (if not already installed)

**Windows:**
```bash
# Using Chocolatey
choco install openjdk11

# Or download from: https://www.oracle.com/java/technologies/downloads/
```

Verify Java:
```bash
java -version
```

### Step 3: Verify Firebase Configuration

The repository already has `firebase.json` configured with:
- ✅ Auth Emulator on port 9099
- ✅ Firestore Emulator on port 8080
- ✅ Pub/Sub Emulator on port 8085
- ✅ UI Dashboard on port 4000

---

## Part 2: Environment Configuration

### Backend (.env)

```env
# ✅ CURRENT SETUP - Emulator Mode
FIREBASE_MODE=emulator
FIREBASE_PROJECT_ID=civicecho-dev
FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
FIREBASE_FIRESTORE_EMULATOR_HOST=localhost:8080

# ❌ Leave empty for emulator (production use only)
FIREBASE_PRIVATE_KEY=
FIREBASE_PRIVATE_KEY_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_CLIENT_ID=
FIREBASE_DATABASE_URL=

# Real Google APIs (always needed)
GOOGLE_MAPS_API_KEY=(your-key)
GOOGLE_SPEECH_TO_TEXT_API_KEY=(your-key)
GCP_PROJECT_ID=civicecho-dev
```

### Frontend (.env)

```env
# ✅ CURRENT SETUP - Emulator Mode
VITE_FIREBASE_MODE=emulator
VITE_FIREBASE_PROJECT_ID=civicecho-dev

# ❌ Leave empty for emulator (production use only)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Backend API & Google Maps (always needed)
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_MAPS_API_KEY=(your-key)
```

---

## Part 3: Quick Start - Local Development with Emulator

### Option A: Run Everything (Recommended)

**Terminal 1 - Start Firebase Emulator Suite:**
```bash
cd c:\Users\ankit\CivicEcho
firebase emulators:start
```

Expected output:
```
✔  All emulators ready! It is now safe to connect your app.
  Auth Emulator: http://localhost:9099
  Firestore Emulator: http://localhost:8080
  Pub/Sub Emulator: http://localhost:8085
  Emulator UI: http://localhost:4000
```

**Terminal 2 - Start Backend:**
```bash
cd c:\Users\ankit\CivicEcho\backend
npm run dev
```

Expected output:
```
🔥 Connecting to Firebase Emulator Suite
✅ Emulator Auth: localhost:9099
✅ Emulator Firestore: localhost:8080
Server running on port 8000
```

**Terminal 3 - Start Frontend:**
```bash
cd c:\Users\ankit\CivicEcho\frontend
npm run dev
```

Expected output:
```
✔ Using Firebase Emulator Suite (Local Development)
✅ Emulator Auth: http://localhost:9099
✅ Emulator Firestore: localhost:8080
```

### Option B: Stop Everything

```bash
# Kill all Node processes
taskkill /F /IM node.exe

# Or kill specific servers
lsof -i :5173 | grep -v COMMAND | awk '{print $2}' | xargs kill -9  # Frontend
lsof -i :8000 | grep -v COMMAND | awk '{print $2}' | xargs kill -9  # Backend
```

---

## Part 4: End-to-End Testing Flow (Emulator)

### Test 1: User Signup

1. Go to `http://localhost:5173`
2. Click "Signup"
3. Enter email: `test@civicecho.local`
4. Enter password: `Test123!@#`
5. Click "Sign Up"

**Expected Result:**
- ✅ User created in Firebase Auth Emulator
- ✅ Console shows: `🔐 Auth Context Initialized - Using Real Firebase`
- ✅ Redirected to Dashboard
- ✅ User email displayed in navbar

### Test 2: User Login

1. Logout first
2. Go to login page
3. Enter same email and password
4. Click "Sign In"

**Expected Result:**
- ✅ User authenticated from Firestore
- ✅ Dashboard loads with no complaints (empty initially)
- ✅ AuthToken stored in localStorage

### Test 3: Submit Complaint

1. Click "Report" in navbar
2. Fill form:
   - Category: "Water Leak"
   - Description: "Water leaking from main pipe at 5th Avenue"
   - Severity: "HIGH"
   - GPS: Click on map or use current location
3. Click "Submit Complaint"

**Expected Result:**
- ✅ Complaint saved to Firestore Emulator
- ✅ Backend console shows NLP analysis results
- ✅ Redirected to Dashboard
- ✅ Complaint appears in list

### Test 4: View Complaint on Dashboard

1. Check "Recent Complaints" section
2. Verify complaint shows:
   - ✅ Title, Category, Severity, Status
   - ✅ Upvote count
   - ✅ Location on map

### Test 5: Voice Complaint (Speech-to-Text)

1. Click "Report"
2. Select "Voice Complaint" mode
3. Click microphone button
4. Speak: "There's a big pothole in the road at Main Street and 5th"
5. Stop recording

**Expected Result:**
- ✅ Google Speech-to-Text API transcribes audio (real API!)
- ✅ Text appears in description field
- ✅ NLP extracts category and severity (real API!)
- ✅ Submit and verify it appears on dashboard

### Test 6: Verify Emulator Data Persistence

1. Open Emulator UI: `http://localhost:4000`
2. Navigate to "Firestore" tab
3. Verify complaints and users are stored

**Expected Result:**
- ✅ All submitted data visible in Firestore Emulator
- ✅ User accounts visible in Auth Emulator

### Test 7: Verify Data is Lost on Emulator Restart (Expected Behavior)

1. Stop Firebase Emulator (Ctrl+C in emulator terminal)
2. Restart: `firebase emulators:start`
3. Check that data is cleared

**Expected Result:**
- ✅ All data cleared (emulator-specific, not a bug!)
- ⚠️ This is normal - emulator data is NOT persistent

---

## Part 5: Switching to Production Firebase

When ready to deploy to production:

### Step 1: Get Real Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create new project or select existing
3. Download Service Account JSON:
   - Project Settings → Service Accounts → Generate New Private Key
4. Save as `backend/config/serviceAccountKey.json`

### Step 2: Update Backend .env

```env
FIREBASE_MODE=production

FIREBASE_PROJECT_ID=your-real-project-id
FIREBASE_PRIVATE_KEY_ID=xxx
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=xxx
FIREBASE_DATABASE_URL=https://your-project.firebaseio.com

# Real Google APIs (get from Google Cloud Console)
GOOGLE_MAPS_API_KEY=AIzaSy...
GOOGLE_SPEECH_TO_TEXT_API_KEY=(from serviceAccountKey.json)
GCP_PROJECT_ID=your-real-project-id
```

### Step 3: Update Frontend .env

```env
VITE_FIREBASE_MODE=production

VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
```

### Step 4: Restart Servers (No emulator)

```bash
# DON'T start emulator - connect to real Firebase
npm run dev  # Backend
npm run dev  # Frontend
```

**Expected Result:**
- ✅ Backend console: `🌐 Connecting to real Firebase services`
- ✅ Frontend console: `🌐 Using Real Firebase Services (Production)`
- ✅ Authentication uses real Firebase
- ✅ Data persists in real Firestore

---

## Part 6: Troubleshooting

### Issue: "Error: couldn't connect to Auth Emulator"

**Solution:**
```bash
# Verify emulator is running on correct port
netstat -ano | findstr :9099

# Start emulator explicitly
firebase emulators:start --only=auth,firestore
```

### Issue: "Port 8080 already in use"

**Solution:**
```bash
# Kill process using port 8080
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Or use different port
firebase emulators:start --firestore-port=8081
```

### Issue: "Java not found"

**Solution:**
```bash
# Install Java
choco install openjdk11

# Verify
java -version
```

### Issue: "Firebase credentials not provided" in production

**Solution:**
```bash
# Verify credentials file exists
ls backend/config/serviceAccountKey.json

# Check .env has FIREBASE_MODE=production
cat backend/.env | grep FIREBASE_MODE

# Verify FIREBASE_PRIVATE_KEY is set
echo $FIREBASE_PRIVATE_KEY
```

### Issue: "Cannot find module 'mockAuth.js'"

**Solution:**
- ✅ Mock files have been removed - this is expected!
- App now uses real Firebase (emulator or production)
- No code changes needed

---

## Part 7: Architecture Comparison

### BEFORE (Mock-Based)
```
User Signup → MockAuth (localStorage) → Fake tokens → MockFirestore (in-memory)
                                                       ↓
                                            Data lost on restart
```

### AFTER (Production-Ready)
```
Local Dev:
User Signup → Real Firebase SDK → Emulator Auth (port 9099) → Emulator Firestore (port 8080)
                                                               ↓
                                              Data cleared on emulator restart

Production:
User Signup → Real Firebase SDK → Real Auth → Real Firestore
                                              ↓
                                       Data persists globally
```

### Switching Logic (ENV-Based Only)
```javascript
// NO conditional logic in code
// ONLY environment variables control behavior

// Backend example:
if (process.env.FIREBASE_MODE === 'emulator') {
  // Connects to localhost:9099 and localhost:8080
} else {
  // Connects to real Firebase using credentials
}

// Same codebase, different behavior
```

---

## Part 8: Google APIs (Always Real)

Regardless of emulator/production mode:

✅ **Speech-to-Text API** → Always calls real Google API  
✅ **Natural Language API** → Always calls real Google API  
✅ **Maps JavaScript API** → Always calls real Google API  

These services do NOT use the emulator. They require:
- `GCP_PROJECT_ID`
- `GOOGLE_APPLICATION_CREDENTIALS` or OAuth tokens
- Real API keys

---

## Summary

| Mode | Auth | Firestore | Google APIs | Data Persistence |
|------|------|-----------|-------------|------------------|
| **Emulator** | Emulator (9099) | Emulator (8080) | Real | Lost on restart |
| **Production** | Real Firebase | Real Firestore | Real | Global persistence |

**Current Setup:** ✅ Emulator (FIREBASE_MODE=emulator)  
**To Switch:** Change FIREBASE_MODE to 'production' and add credentials  
**Code Changes:** None needed - ENV variables handle switching  

---

## Next Steps

1. ✅ Install Firebase Emulator Suite (see Part 1-2)
2. ✅ Start emulator: `firebase emulators:start`
3. ✅ Start backend: `npm run dev`
4. ✅ Start frontend: `npm run dev`
5. ✅ Test signup/login/complaints (see Part 4)
6. ✅ Review Emulator UI: `http://localhost:4000`

