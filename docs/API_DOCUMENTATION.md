# CivicEcho - API Documentation

## Base URL
```
Development: http://localhost:8000/api
Production: https://civicecho-backend-xxxxx.run.app/api
```

## Authentication
All protected endpoints require Firebase ID token:
```
Authorization: Bearer <firebase_id_token>
```

---

## Endpoints

### 1. Create Complaint
**POST** `/complaints`

Create a new civic issue complaint.

**Request Body:**
```json
{
  "description": "Water leaking from main pipe at intersection",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "complaintType": "text",
  "audioUrl": null,
  "userId": "user_uid_123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "complaint_1701234567890_abc123",
    "description": "Water leaking from main pipe",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "category": "water_leak",
    "severity": "high",
    "status": "reported",
    "upvotes": 0,
    "clusterId": "cluster_xyz789",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Complaint created successfully"
}
```

**Error (400):**
```json
{
  "error": "Missing required fields: description, latitude, longitude, userId"
}
```

**Error (500):**
```json
{
  "error": "Failed to create complaint",
  "details": "NLP analysis failed"
}
```

---

### 2. Get All Complaints
**GET** `/complaints`

Retrieve all complaints with optional filters.

**Query Parameters:**
- `category` (optional): water_leak, garbage_waste, road_damage, power_outage, safety_issue
- `status` (optional): reported, verified, in_progress, resolved, closed
- `severity` (optional): low, medium, high, critical

**Example:**
```
GET /complaints?category=water_leak&status=reported
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "complaint_123",
      "description": "Water leak",
      "category": "water_leak",
      "severity": "high",
      "status": "reported",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "upvotes": 5,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

---

### 3. Get Single Complaint
**GET** `/complaints/:id`

Retrieve details of a specific complaint.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "complaint_123",
    "description": "Water leak",
    "category": "water_leak",
    "severity": "high",
    "status": "reported",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "upvotes": 5,
    "clusterId": "cluster_456",
    "sentiment": {
      "score": -0.8,
      "magnitude": 1.5
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error (404):**
```json
{
  "error": "Complaint not found",
  "details": "Complaint not found"
}
```

---

### 4. Update Complaint Status
**PATCH** `/complaints/:id/status`

Update the status of a complaint (Authority only).

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Request Body:**
```json
{
  "status": "in_progress"
}
```

**Valid Status Values:**
- `reported` - Initial status
- `verified` - Authority verified
- `in_progress` - Being worked on
- `resolved` - Issue fixed
- `closed` - Complaint closed

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "complaint_123",
    "status": "in_progress",
    "updatedAt": "2024-01-15T11:00:00Z"
  },
  "message": "Complaint status updated"
}
```

**Error (401):**
```json
{
  "error": "Invalid token"
}
```

---

### 5. Upvote Complaint
**POST** `/complaints/:id/upvote`

Toggle upvote for a complaint (citizen engagement).

**Request Body:**
```json
{
  "userId": "user_uid_123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "complaint_123",
    "upvotes": 6,
    "updatedAt": "2024-01-15T11:05:00Z"
  },
  "message": "Complaint upvote toggled"
}
```

---

### 6. Get Dashboard Statistics
**GET** `/dashboard/stats`

Retrieve dashboard statistics (Authority Dashboard).

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalComplaints": 156,
    "totalClusters": 42,
    "byStatus": {
      "reported": 45,
      "verified": 30,
      "in_progress": 55,
      "resolved": 25,
      "closed": 1
    },
    "byCategory": {
      "water_leak": 50,
      "garbage_waste": 35,
      "road_damage": 40,
      "power_outage": 20,
      "safety_issue": 11
    },
    "bySeverity": {
      "low": 30,
      "medium": 60,
      "high": 55,
      "critical": 11
    }
  }
}
```

---

### 7. Get Heatmap Data
**GET** `/dashboard/heatmap`

Retrieve coordinate data for Google Maps heatmap visualization.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "lat": 40.7128,
      "lng": -74.0060,
      "weight": 5,
      "severity": "high",
      "category": "water_leak"
    },
    {
      "lat": 40.7580,
      "lng": -73.9855,
      "weight": 3,
      "severity": "medium",
      "category": "garbage_waste"
    }
  ]
}
```

---

### 8. Get Priority Issues
**GET** `/dashboard/priority`

Retrieve top priority issues sorted by severity and upvotes.

**Headers:**
```
Authorization: Bearer <firebase_id_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "complaint_123",
      "description": "Critical water leak flooding basement",
      "category": "water_leak",
      "severity": "critical",
      "status": "reported",
      "upvotes": 12,
      "latitude": 40.7128,
      "longitude": -74.0060,
      "createdAt": "2024-01-15T09:00:00Z"
    }
  ]
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 404 | Not Found |
| 500 | Server Error |

---

## Rate Limiting

- **Free Tier**: 1000 requests/day per user
- **Premium**: Unlimited

---

## Error Handling

All errors follow this format:
```json
{
  "error": "Error message",
  "details": "Additional details (dev only)"
}
```

---

## Examples

### JavaScript/Fetch
```javascript
// Create complaint
const response = await fetch('http://localhost:8000/api/complaints', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    description: 'Water leak',
    latitude: 40.7128,
    longitude: -74.0060,
    userId: 'user_123',
    complaintType: 'text'
  })
});

const data = await response.json();
console.log(data);
```

### cURL
```bash
curl -X POST http://localhost:8000/api/complaints \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Water leak at Main St",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "userId": "user_123",
    "complaintType": "text"
  }'
```

### Python/Requests
```python
import requests

response = requests.post(
  'http://localhost:8000/api/complaints',
  json={
    'description': 'Water leak',
    'latitude': 40.7128,
    'longitude': -74.0060,
    'userId': 'user_123',
    'complaintType': 'text'
  }
)

print(response.json())
```

---

**API Documentation Last Updated**: January 2024
