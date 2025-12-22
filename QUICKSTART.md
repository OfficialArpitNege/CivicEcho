# CivicEcho - Quick Start Guide

## 🚀 Local Development Setup

### Prerequisites
- Node.js v16+ and npm
- Git
- Firebase project credentials
- Google Cloud credentials

---

## Step 1: Clone Repository

```bash
git clone <repository-url>
cd CivicEcho
```

---

## Step 2: Setup Backend

### 2.1 Install Dependencies
```bash
cd backend
npm install
cd ..
```

### 2.2 Configure Environment
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your credentials:
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="your-private-key"
FIREBASE_CLIENT_EMAIL=your-email@firebase.iam.gserviceaccount.com
GCP_PROJECT_ID=your-gcp-project
PORT=8000
```

### 2.3 Add Firebase Service Account Key
1. Download from Firebase Console → Project Settings → Service Accounts
2. Save as `backend/config/serviceAccountKey.json`

### 2.4 Start Backend
```bash
cd backend
npm run dev
# Server runs on http://localhost:8000
```

---

## Step 3: Setup Frontend

### 3.1 Install Dependencies
```bash
cd frontend
npm install
cd ..
```

### 3.2 Configure Environment
```bash
cp frontend/.env.example frontend/.env
```

Edit `frontend/.env`:
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_MAPS_API_KEY=your-maps-api-key
```

### 3.3 Start Frontend
```bash
cd frontend
npm run dev
# App runs on http://localhost:5173
```

---

## Step 4: Test the Application

### 4.1 Access the App
Open browser: `http://localhost:5173`

### 4.2 Create Test Account
- Click "Sign Up"
- Enter email and password
- Create account

### 4.3 Test Features
**Submit a Complaint:**
1. Click "Report Issue"
2. Allow location access
3. Enter complaint description
4. Click "Submit"

**View Dashboard:**
1. Click "Dashboard" (top menu)
2. View statistics and charts
3. See priority issues

**View Map:**
1. Click "Map View"
2. See complaint pins and heatmap

---

## Step 5: Using Docker Compose (Optional)

### Quick Start with Docker
```bash
# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Update .env files with your credentials

# Start all services
docker-compose up -d

# Services running:
# - Backend: http://localhost:8000
# - Frontend: http://localhost:5173
# - Postgres: localhost:5432
# - Redis: localhost:6379
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

---

## Step 6: Test API with cURL

### Create a Complaint
```bash
curl -X POST http://localhost:8000/api/complaints \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Water leak at Main Street",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "userId": "test-user-123",
    "complaintType": "text"
  }'
```

### Get All Complaints
```bash
curl http://localhost:8000/api/complaints
```

### Get Heatmap Data
```bash
curl http://localhost:8000/api/dashboard/heatmap
```

---

## Common Issues & Solutions

### Issue: Backend won't start
**Solution:**
```bash
# Check if port 8000 is in use
# Kill process or use different port
npm run dev -- --port 3001
```

### Issue: Firebase connection error
**Solution:**
1. Verify `serviceAccountKey.json` exists in `backend/config/`
2. Check `.env` values match Firebase project
3. Ensure APIs enabled in GCP console

### Issue: Frontend can't connect to backend
**Solution:**
1. Verify backend is running on port 8000
2. Check `VITE_API_URL` in `.env`
3. Check CORS settings in `backend/src/index.js`

### Issue: Google Maps not displaying
**Solution:**
1. Get API key from Google Cloud Console
2. Add to `.env` as `VITE_GOOGLE_MAPS_API_KEY`
3. Restart frontend dev server

---

## Production Checklist

- [ ] Update all `.env` files
- [ ] Generate proper certificates
- [ ] Configure database backups
- [ ] Setup monitoring
- [ ] Configure error logging
- [ ] Test load handling
- [ ] Security audit
- [ ] Performance optimization

---

## Development Commands

### Backend
```bash
# Start dev server
npm run dev

# Start production server
npm start

# Install new package
npm install package-name

# Update dependencies
npm update
```

### Frontend
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Install new package
npm install package-name
```

---

## File Structure Quick Reference

```
backend/
  ├── src/
  │   ├── config/      ← Firebase & Google AI configs
  │   ├── controllers/ ← Request handlers
  │   ├── services/    ← Business logic
  │   ├── routes/      ← API endpoints
  │   ├── middleware/  ← Auth & error handling
  │   └── index.js     ← Server entry
  └── package.json

frontend/
  ├── src/
  │   ├── components/  ← Reusable UI components
  │   ├── pages/       ← Full pages
  │   ├── services/    ← API calls
  │   ├── context/     ← State management
  │   ├── hooks/       ← Custom React hooks
  │   └── App.jsx      ← Main component
  └── package.json
```

---

## Next Steps

1. ✅ Clone and setup
2. ✅ Configure credentials
3. ✅ Start dev servers
4. 📖 Read [API_DOCUMENTATION.md](../docs/API_DOCUMENTATION.md)
5. 📚 Read [FIRESTORE_SCHEMA.md](../docs/FIRESTORE_SCHEMA.md)
6. 🚀 Read [DEPLOYMENT.md](../docs/DEPLOYMENT.md)

---

## Need Help?

- Check [README.md](../README.md) for overview
- See [API_DOCUMENTATION.md](../docs/API_DOCUMENTATION.md) for endpoints
- Review [FIRESTORE_SCHEMA.md](../docs/FIRESTORE_SCHEMA.md) for database structure
- Refer to [DEPLOYMENT.md](../docs/DEPLOYMENT.md) for deployment steps

---

**Happy Hacking! 🎉**
