# CivicEcho - Project Structure & File Overview

## 📦 Complete Project Architecture

```
CivicEcho/
│
├── 📄 README.md                    # Main project documentation
├── 📄 QUICKSTART.md               # Quick start guide
├── 📄 CONTRIBUTING.md             # Contribution guidelines
│
├── 📁 backend/
│   ├── src/
│   │   ├── 📄 index.js                 # Express server entry point
│   │   │
│   │   ├── config/
│   │   │   ├── 📄 firebase.js          # Firebase Admin SDK setup
│   │   │   └── 📄 googleAI.js          # Google AI clients (Speech, NLP)
│   │   │
│   │   ├── routes/
│   │   │   ├── 📄 complaintRoutes.js   # Complaint API endpoints
│   │   │   └── 📄 dashboardRoutes.js   # Dashboard API endpoints
│   │   │
│   │   ├── controllers/
│   │   │   ├── 📄 complaintController.js   # Complaint request handlers
│   │   │   └── 📄 dashboardController.js   # Dashboard request handlers
│   │   │
│   │   ├── services/
│   │   │   ├── 📄 complaintService.js  # Complaint business logic
│   │   │   ├── 📄 nlpService.js        # NLP analysis (categorization, severity)
│   │   │   └── 📄 speechService.js     # Google Speech-to-Text
│   │   │
│   │   ├── middleware/
│   │   │   └── 📄 auth.js              # Firebase token verification
│   │   │
│   │   └── utils/
│   │       ├── 📄 helpers.js           # Utility functions (distance calc, etc)
│   │       └── 📄 constants.js         # Categories, status, severity levels
│   │
│   ├── 📄 package.json             # Backend dependencies
│   ├── 📄 .env.example             # Environment variables template
│   ├── 📄 .gitignore               # Git ignore rules
│   ├── 📄 Dockerfile               # Docker containerization
│   └── 📁 config/
│       └── serviceAccountKey.json  # Firebase service account (not in repo)
│
├── 📁 frontend/
│   ├── src/
│   │   ├── 📄 main.jsx                 # React entry point
│   │   ├── 📄 App.jsx                  # Main app component & routes
│   │   ├── 📄 index.css                # Global styles & Tailwind
│   │   │
│   │   ├── pages/
│   │   │   ├── 📄 Login.jsx            # Login page
│   │   │   ├── 📄 Signup.jsx           # Sign up page
│   │   │   ├── 📄 Dashboard.jsx        # Authority dashboard
│   │   │   ├── 📄 ReportComplaint.jsx  # Complaint submission form
│   │   │   └── 📄 MapView.jsx          # Google Maps visualization
│   │   │
│   │   ├── components/
│   │   │   ├── 📄 Navbar.jsx           # Navigation bar
│   │   │   └── 📄 ProtectedRoute.jsx   # Route protection HOC
│   │   │
│   │   ├── services/
│   │   │   ├── 📄 api.js               # Axios instance & interceptors
│   │   │   └── 📄 complaintService.js  # API calls to backend
│   │   │
│   │   ├── context/
│   │   │   └── 📄 AuthContext.jsx      # Firebase auth context
│   │   │
│   │   ├── hooks/
│   │   │   └── 📄 useCustom.js         # Custom React hooks (location, voice)
│   │   │
│   │   ├── config/
│   │   │   └── 📄 firebase.js          # Firebase initialization
│   │   │
│   │   └── utils/
│   │       └── (utility functions)
│   │
│   ├── 📄 index.html                # HTML template
│   ├── 📄 package.json              # Frontend dependencies
│   ├── 📄 .env.example              # Environment variables
│   ├── 📄 .gitignore                # Git ignore rules
│   ├── 📄 vite.config.js            # Vite configuration
│   ├── 📄 tailwind.config.js        # Tailwind CSS config
│   ├── 📄 postcss.config.js         # PostCSS config
│   ├── 📄 Dockerfile                # Docker containerization
│   └── 📄 nginx.conf                # Nginx configuration
│
├── 📁 docs/
│   ├── 📄 FIRESTORE_SCHEMA.md       # Firestore database schema
│   ├── 📄 API_DOCUMENTATION.md      # Complete API documentation
│   ├── 📄 DEPLOYMENT.md             # Deployment guide
│   └── 📄 ENVIRONMENT_SETUP.md      # Environment variables guide
│
├── 📁 .github/
│   └── workflows/
│       └── 📄 ci-cd.yml             # GitHub Actions CI/CD pipeline
│
├── 📄 docker-compose.yml            # Docker Compose for local dev
└── 📄 .gitignore                    # Root level git ignore
```

---

## 🏗️ Architecture Overview

### Tech Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | Interactive UI |
| **Styling** | Tailwind CSS | Responsive design |
| **Maps** | Google Maps API | Location visualization |
| **Backend** | Node.js + Express | REST APIs |
| **Database** | Firestore | Document storage |
| **Auth** | Firebase Auth | User authentication |
| **AI/ML** | Google Speech-to-Text | Audio transcription |
| **AI/ML** | Google NLP API | Issue categorization |
| **Hosting** | Firebase Hosting | Frontend deployment |
| **Backend Host** | Google Cloud Run | Serverless backend |

---

## 🔑 Key Features Implementation

### 1. Voice-to-Text Conversion
**File:** `backend/src/services/speechService.js`
- Uses Google Speech-to-Text API
- Converts audio buffer to text
- Supports multiple languages

### 2. Issue Categorization & Severity
**File:** `backend/src/services/nlpService.js`
- Google NLP API for sentiment analysis
- Rule-based categorization (water, garbage, road, power, safety)
- Severity estimation based on sentiment + keywords

### 3. Complaint Clustering
**File:** `backend/src/services/complaintService.js`
- Distance-based clustering (500m radius)
- Time-based grouping (24 hours)
- Text similarity matching (80% threshold)
- Auto-merges duplicate complaints

### 4. Real-time Dashboard
**File:** `frontend/src/pages/Dashboard.jsx`
- Statistics cards (total, resolved, in-progress)
- Charts (bar, pie, status distribution)
- Priority-ranked issue list
- Interactive filtering

### 5. Map Visualization
**File:** `frontend/src/pages/MapView.jsx`
- Google Maps heatmap layer
- Complaint markers
- Filter by status
- Location-based insights

### 6. Authentication
**File:** `frontend/src/context/AuthContext.jsx`
- Firebase email/password auth
- Automatic token refresh
- Protected routes
- Session persistence

---

## 🗄️ Database Schema (Firestore)

### Collections

1. **complaints** - Individual civic issue reports
   - Fields: description, category, severity, status, location, upvotes, clusterId
   - Indexes: category+status, severity+upvotes, clusterId

2. **clusters** - Grouped similar complaints
   - Fields: category, severity, location, complaints[], complaintCount
   - Indexes: category+status, severity+complaintCount

3. **upvotes** (sub-collection)
   - Path: `complaints/{complaintId}/upvotes/{userId}`
   - Prevents duplicate votes

4. **notifications** (Optional)
   - Stores user notifications with TTL

---

## 📡 API Endpoints

### Complaints API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/complaints` | Create complaint |
| GET | `/api/complaints` | Get all (with filters) |
| GET | `/api/complaints/:id` | Get single |
| PATCH | `/api/complaints/:id/status` | Update status |
| POST | `/api/complaints/:id/upvote` | Toggle upvote |

### Dashboard API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/dashboard/stats` | Dashboard statistics |
| GET | `/api/dashboard/heatmap` | Heatmap coordinates |
| GET | `/api/dashboard/priority` | Priority issues |

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────┐
│      Frontend (Firebase Hosting)     │
│   https://civicecho.web.app         │
│                                      │
│  React + Vite + Google Maps          │
└────────────────┬────────────────────┘
                 │ (HTTP requests)
                 │
┌────────────────▼────────────────────┐
│      Backend (Google Cloud Run)      │
│  https://civicecho-backend-xxx.app  │
│                                      │
│  Node.js + Express + REST APIs       │
└────────────────┬────────────────────┘
                 │ (Queries/writes)
                 │
┌────────────────▼────────────────────┐
│  Data Layer (Firestore + Google APIs)│
│                                      │
│  • Firestore Database                │
│  • Firebase Auth                     │
│  • Google Speech-to-Text             │
│  • Google NLP API                    │
│  • Google Maps API                   │
└──────────────────────────────────────┘
```

---

## 📋 Setup Checklist

- [ ] Clone repository
- [ ] Copy `.env.example` → `.env` (both frontend & backend)
- [ ] Download Firebase service account key
- [ ] Install dependencies: `npm install` (both)
- [ ] Configure Google Cloud APIs
- [ ] Start backend: `npm run dev` (from backend/)
- [ ] Start frontend: `npm run dev` (from frontend/)
- [ ] Test at http://localhost:5173
- [ ] Create test account
- [ ] Submit test complaint
- [ ] View in dashboard & map

---

## 🔐 Security Features

✅ Firebase ID token verification
✅ Protected routes (frontend)
✅ Input validation (backend)
✅ CORS configuration
✅ Rate limiting ready
✅ Firestore security rules
✅ Environment variable management
✅ No hardcoded secrets

---

## 📈 Performance Optimizations

✅ Lazy loading (React)
✅ Image optimization
✅ API response pagination
✅ Firestore indexing
✅ CDN caching (Tailwind, libraries)
✅ Code splitting (Vite)
✅ Database query optimization

---

## 🧪 Testing Strategy

### Backend
- Unit tests for services
- Integration tests for APIs
- End-to-end testing with sample data

### Frontend
- Component testing
- Integration testing
- E2E testing with Cypress

---

## 📚 Documentation Files

| Document | Purpose |
|----------|---------|
| [README.md](README.md) | Project overview & setup |
| [QUICKSTART.md](QUICKSTART.md) | Quick start guide |
| [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) | Complete API reference |
| [docs/FIRESTORE_SCHEMA.md](docs/FIRESTORE_SCHEMA.md) | Database schema |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deployment instructions |
| [docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md) | Env variable guide |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |

---

## 🎯 MVP Completion Status

| Feature | Status | File |
|---------|--------|------|
| User Authentication | ✅ Complete | `frontend/src/context/AuthContext.jsx` |
| Text Complaints | ✅ Complete | `frontend/src/pages/ReportComplaint.jsx` |
| Voice Complaints | ✅ Complete | `backend/src/services/speechService.js` |
| Location Detection | ✅ Complete | `frontend/src/hooks/useCustom.js` |
| Issue Categorization | ✅ Complete | `backend/src/services/nlpService.js` |
| Severity Estimation | ✅ Complete | `backend/src/services/nlpService.js` |
| Complaint Clustering | ✅ Complete | `backend/src/services/complaintService.js` |
| Google Maps Display | ✅ Complete | `frontend/src/pages/MapView.jsx` |
| Heatmap Visualization | ✅ Complete | `frontend/src/pages/MapView.jsx` |
| Dashboard Statistics | ✅ Complete | `frontend/src/pages/Dashboard.jsx` |
| Priority Ranking | ✅ Complete | `backend/src/controllers/dashboardController.js` |
| Upvoting System | ✅ Complete | `backend/src/services/complaintService.js` |
| Status Management | ✅ Complete | `backend/src/services/complaintService.js` |
| REST APIs | ✅ Complete | `backend/src/routes/*` |
| Firestore Integration | ✅ Complete | `backend/src/config/firebase.js` |
| Firebase Auth | ✅ Complete | `frontend/src/context/AuthContext.jsx` |
| Cloud Run Ready | ✅ Complete | `backend/Dockerfile` |
| Firebase Hosting Ready | ✅ Complete | `frontend/Dockerfile` |
| Docker Compose | ✅ Complete | `docker-compose.yml` |
| CI/CD Pipeline | ✅ Complete | `.github/workflows/ci-cd.yml` |

---

## 🚀 Next Steps

1. **Setup**: Follow QUICKSTART.md
2. **Develop**: Create branches and contribute
3. **Test**: Run locally and test all features
4. **Deploy**: Follow DEPLOYMENT.md
5. **Monitor**: Setup logging and alerts
6. **Scale**: Optimize based on usage

---

## 📞 Support & Community

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: support@civicecho.com

---

**Built for the Community ❤️**

---

*Last Updated: January 2024*
