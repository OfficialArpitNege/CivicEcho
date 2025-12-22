# CivicEcho - Deployment Guide

## Prerequisites
- Google Cloud Project
- Firebase Project
- Google Cloud CLI installed
- Docker (optional, for Cloud Run)

---

## Phase 1: Prepare Google Cloud Project

### 1.1 Create GCP Project
```bash
gcloud projects create civicecho-prod --name="CivicEcho"
gcloud config set project civicecho-prod
```

### 1.2 Enable Required APIs
```bash
gcloud services enable \
  speech.googleapis.com \
  language.googleapis.com \
  maps.googleapis.com \
  cloudrun.googleapis.com \
  cloudmessaging.googleapis.com \
  firebase.googleapis.com \
  firestore.googleapis.com
```

### 1.3 Create Service Account for Backend
```bash
# Create service account
gcloud iam service-accounts create civicecho-backend \
  --display-name="CivicEcho Backend"

# Grant necessary roles
gcloud projects add-iam-policy-binding civicecho-prod \
  --member="serviceAccount:civicecho-backend@civicecho-prod.iam.gserviceaccount.com" \
  --role="roles/editor"

# Create and download key
gcloud iam service-accounts keys create backend/config/serviceAccountKey.json \
  --iam-account=civicecho-backend@civicecho-prod.iam.gserviceaccount.com
```

---

## Phase 2: Setup Firebase

### 2.1 Create Firebase Project
```bash
# Link GCP project to Firebase
firebase projects:addfirebase civicecho-prod

# Initialize Firebase
firebase init --project=civicecho-prod
```

### 2.2 Setup Firestore
- Go to Firebase Console
- Create Firestore Database in **Production** mode
- Set region to `us-central1` (or preferred region)

### 2.3 Setup Authentication
- Firebase Console → Authentication
- Enable Email/Password sign-in

### 2.4 Create API Keys
**For Frontend (Restricted):**
```bash
gcloud alpha services api-keys create \
  --display-name="CivicEcho Frontend" \
  --api-target=maps.googleapis.com \
  --api-target=firebaseauth.googleapis.com
```

**For Backend (Unrestricted):**
- Use service account key created above

---

## Phase 3: Deploy Backend to Cloud Run

### 3.1 Containerize Backend
Create `backend/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production

EXPOSE 8000

CMD ["npm", "start"]
```

### 3.2 Configure Environment Variables
Create `backend/.env.production`:
```
FIREBASE_PROJECT_ID=civicecho-prod
GOOGLE_APPLICATION_CREDENTIALS=/app/config/serviceAccountKey.json
GCP_PROJECT_ID=civicecho-prod
NODE_ENV=production
CORS_ORIGIN=https://civicecho-web.web.app
PORT=8000
```

### 3.3 Build and Deploy
```bash
# Build image
docker build -t civicecho-backend:latest backend/

# Tag for Google Container Registry
docker tag civicecho-backend:latest gcr.io/civicecho-prod/civicecho-backend:latest

# Push to GCR
docker push gcr.io/civicecho-prod/civicecho-backend:latest

# Deploy to Cloud Run
gcloud run deploy civicecho-backend \
  --image gcr.io/civicecho-prod/civicecho-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,CORS_ORIGIN=https://civicecho-web.web.app \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60
```

**Note the Cloud Run URL**, e.g.: `https://civicecho-backend-xxxxx.run.app`

---

## Phase 4: Deploy Frontend to Firebase Hosting

### 4.1 Configure Firebase Project
```bash
firebase init hosting --project=civicecho-prod
```

### 4.2 Update Frontend Environment
Create `frontend/.env.production`:
```
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=civicecho-web.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=civicecho-prod
VITE_FIREBASE_STORAGE_BUCKET=civicecho-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_URL=https://civicecho-backend-xxxxx.run.app/api
VITE_GOOGLE_MAPS_API_KEY=your-maps-api-key
```

### 4.3 Build and Deploy
```bash
# Build frontend
cd frontend
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting --project=civicecho-prod

# Or use Firebase CLI
cd ..
firebase deploy --project=civicecho-prod
```

**Hosted URL**: `https://civicecho-web.web.app`

---

## Phase 5: Configure Cloud Messaging (Optional)

### 5.1 Get FCM Server Key
- Firebase Console → Project Settings → Cloud Messaging
- Copy Server Key

### 5.2 Add to Backend
```bash
echo "FCM_SERVER_KEY=your-server-key" >> backend/.env.production
```

### 5.3 Test Notification
```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Content-Type: application/json" \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -d '{
    "to": "device-token",
    "notification": {
      "title": "Issue Resolved",
      "body": "Your reported complaint has been resolved"
    }
  }'
```

---

## Phase 6: Setup Custom Domain (Optional)

### 6.1 For Hosting
```bash
firebase hosting:channel:deploy preview-channel
```

### 6.2 For Cloud Run
```bash
gcloud run services update-traffic civicecho-backend \
  --to-revisions LATEST=100
```

---

## Phase 7: Monitoring & Logging

### 7.1 Setup Cloud Logging
```bash
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=civicecho-backend" \
  --limit 20 \
  --format json
```

### 7.2 Monitor Firestore
- Firebase Console → Firestore → Stats
- Monitor read/write operations

### 7.3 Setup Alerts
```bash
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="CivicEcho Backend Error Rate"
```

---

## Phase 8: Post-Deployment Checklist

- [ ] Test login/signup flow
- [ ] Test complaint creation (text & voice)
- [ ] Test complaint filtering
- [ ] Test map visualization
- [ ] Test dashboard statistics
- [ ] Verify email logs
- [ ] Monitor error rates
- [ ] Load test with Apache JMeter
- [ ] Security audit with OWASP ZAP
- [ ] Performance optimization

---

## Troubleshooting

### Backend Deployment Issues

**Cloud Run: Service Unavailable**
```bash
# Check logs
gcloud run services describe civicecho-backend --region us-central1

# View detailed logs
gcloud logging read "resource.type=cloud_run_revision" --limit 50
```

**Firestore Connection Error**
```bash
# Verify service account has Firestore access
gcloud projects get-iam-policy civicecho-prod \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:civicecho-backend*"
```

---

### Frontend Deployment Issues

**CORS Error**
- Update `CORS_ORIGIN` in backend `.env.production`
- Redeploy backend: `gcloud run deploy civicecho-backend`

**Firebase Auth Error**
- Verify Firebase config in `.env.production`
- Check Firebase project ID matches

---

## Scaling Considerations

### Auto-scaling
- Cloud Run: Auto-scales based on traffic
- Firestore: Auto-scales within quotas

### Performance Optimization
- Enable Firestore indexes
- Use CDN for static assets
- Cache API responses with Cloud CDN

### Cost Optimization
- Set Firestore billing alerts
- Configure Cloud Run memory/CPU appropriately
- Archive old complaints

---

## Rollback Procedure

### Rollback Backend
```bash
# View revisions
gcloud run revisions list --service=civicecho-backend

# Traffic to previous revision
gcloud run services update-traffic civicecho-backend \
  --to-revisions=REVISION_ID=100
```

### Rollback Frontend
```bash
# Firebase has automatic rollback
firebase hosting:channel:deploy previous-version
```

---

## Next Steps

1. **Monitor in production** for 1 week
2. **Gather user feedback**
3. **Iterate on features**
4. **Scale infrastructure as needed**

---

**Happy Deploying! 🚀**
