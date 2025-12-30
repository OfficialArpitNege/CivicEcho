# CivicEcho - Community Issue Reporting System

**CivicEcho** is an end-to-end full-stack web application that empowers citizens to report local civic issues using voice or text, powered by Google AI and Cloud technologies.

![Status](https://img.shields.io/badge/status-MVP-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🎯 Problem Statement

Communities face issues with civic infrastructure (water leaks, garbage accumulation, road damage, power outages, safety hazards), but there's no efficient way for citizens to report these issues. Authorities lack centralized visibility into problem areas.

## 💡 Solution

CivicEcho provides:
- **Easy Reporting**: Citizens submit complaints via voice or text with auto-detected location
- **AI-Powered Analysis**: Google AI categorizes issues, estimates severity, detects location
- **Smart Clustering**: Automatically groups similar complaints into one cluster
- **Authority Dashboard**: Real-time heatmaps, priority ranking, and status management
- **Community Engagement**: Upvoting system to amplify important issues

---

## 🏗️ Architecture

### Tech Stack

**Frontend**
- React 18 + Vite
- Tailwind CSS
- Google Maps JavaScript API
- Firebase Authentication

**Backend**
-Firebase

**Database & Auth**
- Firebase Authentication
- Firestore (NoSQL)

**Google Cloud Technologies**
- Google Speech-to-Text API (voice-to-text conversion)
- Google Natural Language API (issue categorization & severity)
- Google Maps API (location pins & heatmaps)
- Firebase Cloud Messaging (notifications)
- Firebase Hosting (frontend)
- Google Cloud Run (backend)

### Project Structure

```
CivicEcho/
├── backend/
│   ├── src/
│   │   ├── config/          # Firebase, Google AI configs
│   │   ├── controllers/     # Request handlers
│   │   ├── services/        # Business logic (AI, clustering)
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth, error handling
│   │   ├── utils/           # Helpers, constants
│   │   └── index.js         # Express server
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Full page components
│   │   ├── services/        # API calls
│   │   ├── context/         # React Context (Auth)
│   │   ├── hooks/           # Custom hooks
│   │   ├── config/          # Firebase config
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── .env.example
│
├── docs/                    # Documentation
└── README.md
```

---

## 🚀 Features

### Citizen Features
✅ **Authentication**: Login/Signup with Firebase Auth
✅ **Report Issues**: Submit complaints via voice or text
✅ **Auto-Location**: GPS auto-detection
✅ **Map Visualization**: View complaints on Google Map with pins
✅ **Upvoting**: Upvote existing complaints to amplify
✅ **Status Tracking**: Monitor complaint status

### Authority Dashboard
✅ **View All Complaints**: Centralized complaint management
✅ **Heatmaps**: Visual representation of problem zones
✅ **Duplicate Detection**: Auto-clustering similar complaints
✅ **Priority Ranking**: Sort by frequency + severity
✅ **Status Updates**: Update complaint status
✅ **Analytics**: Dashboard with statistics and charts

### AI-Powered Features
✅ **Voice-to-Text**: Google Speech-to-Text API
✅ **Issue Categorization**: Water, Garbage, Road, Power, Safety
✅ **Severity Estimation**: Based on NLP sentiment analysis
✅ **Complaint Clustering**: Merge similar complaints
✅ **Location Intelligence**: Extract location from text & GPS

---

## 📋 Firestore Schema

### Collections

#### `complaints`
```javascript
{
  id: "complaint_123",
  userId: "user_uid",
  description: "Water leak at Main St",
  latitude: 40.7128,
  longitude: -74.0060,
  category: "water_leak",
  severity: "high",
  status: "reported",
  upvotes: 5,
  clusterId: "cluster_456",
  audioUrl: "gs://...",
  sentiment: { score: -0.8, magnitude: 1.5 },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `clusters`
```javascript
{
  id: "cluster_456",
  category: "water_leak",
  severity: "high",
  location: { latitude: 40.7128, longitude: -74.0060 },
  complaints: ["complaint_123", "complaint_124"],
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `users` (Auto-created by Firebase Auth)
```javascript
{
  uid: "user_uid",
  email: "user@example.com",
  displayName: "John Doe",
  role: "citizen" // or "authority"
}
```

---

## 🔧 Setup Instructions

### Prerequisites
- Node.js v16+ & npm
- Firebase project (Create at [console.firebase.google.com](https://console.firebase.google.com))
- Google Cloud project with APIs enabled:
  - Speech-to-Text API
  - Natural Language API
  - Maps JavaScript API
- Git

### Step 1: Clone & Setup Backend

```bash
cd backend
npm install
```

**Create `.env` file from `.env.example`:**
```bash
cp .env.example .env
```

**Fill in `.env`:**
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-email
GCP_PROJECT_ID=your-gcp-project-id
GOOGLE_MAPS_API_KEY=your-maps-api-key
PORT=8000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**Download Firebase Service Account Key:**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Save as `backend/config/serviceAccountKey.json`

**Run Backend:**
```bash
npm run dev
```

Backend runs on `http://localhost:8000`

---

### Step 2: Setup Frontend

```bash
cd frontend
npm install
```

**Create `.env` file:**
```bash
cp .env.example .env
```

**Fill in `.env`:**
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_MAPS_API_KEY=your-maps-api-key
```

**Run Frontend:**
```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## 📡 API Endpoints

### Complaints
- `POST /api/complaints` - Create complaint
- `GET /api/complaints` - Get all complaints (with filters)
- `GET /api/complaints/:id` - Get single complaint
- `PATCH /api/complaints/:id/status` - Update status
- `POST /api/complaints/:id/upvote` - Upvote complaint

### Dashboard (Authority)
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/heatmap` - Heatmap data
- `GET /api/dashboard/priority` - Priority-ranked issues

---

## 🧪 Sample Data

### Create Test Complaint

```bash
curl -X POST http://localhost:8000/api/complaints \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Water leak near Central Park",
    "latitude": 40.7829,
    "longitude": -73.9654,
    "userId": "test-user-123",
    "complaintType": "text"
  }'
```

### Fetch Heatmap Data

```bash
curl http://localhost:8000/api/dashboard/heatmap
```

---

## 🚢 Deployment

### Deploy Backend to Google Cloud Run

```bash
# Install Google Cloud CLI
# https://cloud.google.com/sdk/docs/install

# Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Deploy
gcloud run deploy civicecho-backend \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Deploy Frontend to Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Build & Deploy
npm run build
firebase deploy --only hosting
```

---

## 📊 Key Metrics

| Metric | Implementation |
|--------|-----------------|
| Voice Recognition | Google Speech-to-Text API |
| NLP Processing | Google Natural Language API |
| Categorization Accuracy | Rule-based + Sentiment Analysis |
| Clustering Algorithm | Distance (500m) + Time (24h) + Text Similarity (80%) |
| Map Visualization | Google Maps Heatmap Layer |
| Real-time Updates | Firebase Cloud Messaging |

---

## 🤝 Contributing

This is an open-source hackathon project. Contributions welcome!

1. Fork the repo
2. Create a feature branch
3. Commit changes
4. Push and create a PR

---

## 📝 License

MIT License - feel free to use in your projects!

---

## 👥 Team

Built with ❤️ for the community.

---

## 📞 Support

Issues? Suggestions?
- Create a GitHub issue
- Email: support@civicecho.com

---

**Happy Reporting! 🎯**
