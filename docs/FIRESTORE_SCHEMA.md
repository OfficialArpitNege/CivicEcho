# CivicEcho - Firestore Schema & Database Guide

## Collections Overview

### 1. **complaints** Collection
Stores individual civic issue reports from citizens.

**Document ID**: Auto-generated (recommended) or `complaint_<timestamp>`

**Fields**:
```javascript
{
  id: String,                           // Unique complaint ID
  userId: String,                       // Firebase UID of reporter
  description: String,                  // Issue description
  latitude: Number,                     // Latitude (-90 to 90)
  longitude: Number,                    // Longitude (-180 to 180)
  category: String,                     // water_leak, garbage_waste, road_damage, power_outage, safety_issue, other
  severity: String,                     // low, medium, high, critical
  status: String,                       // reported, verified, in_progress, resolved, closed
  complaintType: String,                // text, voice
  audioUrl: String | null,              // Google Cloud Storage URL (optional)
  upvotes: Number,                      // Vote count
  clusterId: String | null,             // Reference to cluster (if duplicate)
  
  // NLP Sentiment Data
  sentiment: {
    score: Number,                      // -1.0 to 1.0
    magnitude: Number                   // 0 to +inf
  },
  
  // Metadata
  createdAt: Timestamp,
  updatedAt: Timestamp,
  resolvedAt: Timestamp | null
}
```

**Indexes**:
- `category + status + createdAt` (for filtering)
- `severity + upvotes` (for priority ranking)
- `clusterId + createdAt` (for clustering)
- `status` (for dashboard queries)

**Rules** (Firestore Security):
```javascript
match /complaints/{document=**} {
  allow create: if request.auth != null;
  allow read: if request.auth != null;
  allow update: if request.auth.uid == resource.data.userId || request.auth.token.isAdmin;
  allow delete: if request.auth.token.isAdmin;
}
```

---

### 2. **clusters** Collection
Groups similar/duplicate complaints together.

**Document ID**: Auto-generated (recommended)

**Fields**:
```javascript
{
  id: String,                           // Unique cluster ID
  category: String,                     // Issue category
  severity: String,                     // Primary severity level
  location: {
    latitude: Number,
    longitude: Number,
    address: String | null              // Optional: Geocoded address
  },
  complaints: Array<String>,            // Array of complaint IDs in this cluster
  complaintCount: Number,               // Total complaints in cluster
  
  // Statistics
  avgSeverity: String,
  priorityScore: Number,                // Calculated based on frequency + severity
  
  // Status Tracking
  status: String,                       // reported, verified, in_progress, resolved
  updatedAt: Timestamp,
  createdAt: Timestamp
}
```

**Indexes**:
- `category + status + createdAt`
- `severity + complaintCount` (for priority)
- `location + status` (for map queries)

**Sub-collection** (Optional): `clusters/{clusterId}/history`
```javascript
{
  action: String,                       // created, merged, status_updated
  details: Object,
  timestamp: Timestamp,
  userId: String
}
```

---

### 3. **upvotes** Sub-collection
Tracks which users upvoted each complaint.

**Path**: `complaints/{complaintId}/upvotes/{userId}`

**Fields**:
```javascript
{
  userId: String,                       // User who upvoted
  createdAt: Timestamp
}
```

**Purpose**: Prevent duplicate upvotes, track engagement

---

### 4. **users** Collection (Optional, Auto-created by Firebase Auth)
Extends Firebase Auth with custom user data.

**Document ID**: Firebase UID (same as `auth.uid`)

**Fields**:
```javascript
{
  uid: String,                          // Firebase UID
  email: String,
  displayName: String,
  role: String,                         // citizen, authority, admin
  profilePicture: String | null,        // URL
  reportsCount: Number,                 // Total reports by user
  
  // Preferences
  preferences: {
    notifications: Boolean,
    emailUpdates: Boolean,
    language: String                    // en, es, fr, etc.
  },
  
  // Metadata
  createdAt: Timestamp,
  lastLoginAt: Timestamp,
  isActive: Boolean
}
```

---

### 5. **notifications** Collection
Stores notifications for users.

**Document ID**: Auto-generated

**Fields**:
```javascript
{
  userId: String,                       // Recipient user ID
  type: String,                         // complaint_confirmed, status_update, new_cluster
  title: String,
  message: String,
  relatedComplaintId: String | null,
  link: String | null,                  // Navigation link
  
  // Status
  read: Boolean,
  readAt: Timestamp | null,
  
  // Metadata
  createdAt: Timestamp,
  expiresAt: Timestamp
}
```

**TTL Policy**: Auto-delete after 30 days

---

### 6. **analytics** Collection
Store aggregated analytics data.

**Document ID**: `YYYY-MM-DD` (daily) or `YYYY-MM` (monthly)

**Fields**:
```javascript
{
  date: String,                         // YYYY-MM-DD
  totalReports: Number,
  totalResolved: Number,
  avgResolutionTime: Number,            // in hours
  byCategory: {
    water_leak: Number,
    garbage_waste: Number,
    road_damage: Number,
    power_outage: Number,
    safety_issue: Number
  },
  bySeverity: {
    low: Number,
    medium: Number,
    high: Number,
    critical: Number
  },
  topAreas: Array<{
    latitude: Number,
    longitude: Number,
    count: Number
  }>,
  
  // Engagement
  totalUpvotes: Number,
  newUsers: Number,
  
  updatedAt: Timestamp
}
```

---

## Sample Firestore Queries

### Get All Active Complaints
```javascript
db.collection('complaints')
  .where('status', '!=', 'closed')
  .orderBy('status')
  .orderBy('createdAt', 'desc')
  .get();
```

### Get Priority Issues (High Severity)
```javascript
db.collection('complaints')
  .where('severity', 'in', ['high', 'critical'])
  .where('status', '!=', 'resolved')
  .orderBy('upvotes', 'desc')
  .limit(20)
  .get();
```

### Get Complaints by Category
```javascript
db.collection('complaints')
  .where('category', '==', 'water_leak')
  .where('status', '==', 'reported')
  .get();
```

### Get Clusters for Map
```javascript
db.collection('clusters')
  .where('status', '!=', 'closed')
  .get();
```

### Update Complaint Status
```javascript
db.collection('complaints')
  .doc(complaintId)
  .update({
    status: 'in_progress',
    updatedAt: new Date(),
    resolvedAt: null
  });
```

### Create Cluster
```javascript
db.collection('clusters').add({
  category: 'water_leak',
  severity: 'high',
  location: { latitude: 40.7128, longitude: -74.0060 },
  complaints: ['complaint_1', 'complaint_2'],
  complaintCount: 2,
  status: 'reported',
  createdAt: new Date(),
  updatedAt: new Date()
});
```

---

## Data Migration & Seed Data

### Seed Script (Node.js)
```javascript
const admin = require('firebase-admin');
const db = admin.firestore();

const seedComplaints = async () => {
  const complaints = [
    {
      userId: 'test-user-1',
      description: 'Water leaking from main pipe',
      latitude: 40.7128,
      longitude: -74.0060,
      category: 'water_leak',
      severity: 'high',
      status: 'reported',
      upvotes: 3
    },
    // ... more complaints
  ];

  for (const complaint of complaints) {
    await db.collection('complaints').add({
      ...complaint,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
};

seedComplaints().then(() => console.log('Seeding complete'));
```

---

## Performance Optimization

### Indexes (Auto-created by Firebase)
- Composite indexes for filtered queries
- Single-field indexes for sorting

### Query Optimization
- Use `limit()` for large result sets
- Use `where()` to filter before returning
- Paginate with `startAfter()` and `endBefore()`

### Cost Optimization
- Delete old closed complaints (after 1 year)
- Archive old analytics data
- Use TTL policies for notifications

---

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public collections
    match /complaints/{complaintId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null;
      allow update: if request.auth.uid == resource.data.userId || isAdmin();
      allow delete: if isAdmin();
      
      // Upvotes sub-collection
      match /upvotes/{userId} {
        allow create, delete: if request.auth.uid == userId;
        allow read: if request.auth != null;
      }
    }
    
    match /clusters/{clusterId} {
      allow read, create: if request.auth != null;
      allow update: if isAdmin();
    }
    
    match /users/{userId} {
      allow read, create, update: if request.auth.uid == userId;
      allow read: if isAdmin();
    }
    
    // Admin functions
    function isAdmin() {
      return request.auth.token.isAdmin == true;
    }
  }
}
```

---

## Backup & Recovery

### Automated Backups
Enable in Firebase Console:
- Settings → Manage all → Backups
- Configure daily/weekly backups

### Manual Export
```bash
gcloud firestore export gs://your-bucket/firestore-backup
```

### Restore from Backup
```bash
gcloud firestore restore gs://your-bucket/firestore-backup
```

---

This schema is production-ready and scalable for MVP to scale!
