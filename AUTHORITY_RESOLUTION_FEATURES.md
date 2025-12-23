# Authority Resolution Features Implementation

## Overview
The authority side has been enhanced to allow authorities to not only view complaints but also change their status and resolve them with detailed notes.

## Features Implemented

### 1. **Status Management**
Authorities can now manage complaint workflow through three main statuses:
- **Reported** - Initial status when complaint is submitted
- **In Progress** - When authority starts working on the complaint
- **Resolved** - When the complaint is fully resolved

### 2. **Backend Enhancements**

#### Updated Complaint Service (`backend/src/services/complaintService.js`)
- Enhanced `updateComplaintStatus()` function now accepts:
  - `complaintId` - ID of the complaint
  - `status` - New status (reported, in_progress, resolved)
  - `authorityId` - UID of the authority making the update
  - `resolutionNote` - Optional detailed resolution note

- New fields added to complaint document when resolved:
  - `updatedBy` - UID of the authority who updated it
  - `updatedAt` - Timestamp of when status was updated
  - `resolutionNote` - Detailed resolution information (when resolving)
  - `resolvedAt` - Timestamp when resolved

#### Updated Complaint Controller (`backend/src/controllers/complaintController.js`)
- Enhanced `handleUpdateComplaintStatus()` with:
  - Authority role verification using `requireAuthority` middleware
  - Validation of status values (must be one of: reported, in_progress, resolved)
  - Passing authority UID and resolution note to the service
  - Better error messages for invalid status values

### 3. **Frontend Enhancements**

#### Authority Dashboard (`frontend/src/pages/AuthorityDashboard.jsx`)
New features added:
- **Start Button** - Changes status from "reported" to "in_progress"
- **Resolve Button** - Opens modal to resolve complaint with optional notes
- **Resolution Modal** - Beautiful modal dialog for resolving complaints:
  - Text area for detailed resolution notes
  - Cancel and confirm buttons
  - Loading states during submission

#### Updated Complaint Service (`frontend/src/services/complaintService.js`)
- Modified `updateComplaintStatus()` to accept optional `resolutionNote` parameter
- Sends resolution note to backend when resolving a complaint

### 4. **Authorization & Security**
- All status update endpoints require:
  - Valid Firebase authentication token (`verifyToken` middleware)
  - Authority role (`requireAuthority` middleware)
  - Status updates can only be made by authenticated authorities

### 5. **UI/UX Improvements**
- **Action Buttons** display contextually:
  - "Assign" button shown only for unassigned complaints
  - "Start" button shown only for reported complaints
  - "Resolve" button shown only for in-progress complaints
  
- **Status Badges** show color-coded statuses:
  - Red badge for "reported"
  - Yellow badge for "in_progress"
  - Green badge for "resolved"

- **Resolver Information** displayed in table showing who is handling the complaint

- **Loading States** prevent duplicate submissions during updates

## API Endpoints

### Update Complaint Status
```
PATCH /api/complaints/:id/status
Authorization: Bearer <token>
Required Role: authority

Request Body:
{
  "status": "reported|in_progress|resolved",
  "resolutionNote": "Optional detailed resolution information"
}

Response:
{
  "success": true,
  "data": {
    "id": "complaint_id",
    "status": "resolved",
    "updatedBy": "authority_uid",
    "updatedAt": "2024-12-23T10:30:00Z",
    "resolutionNote": "Issue fixed",
    "resolvedAt": "2024-12-23T10:30:00Z",
    ...
  },
  "message": "Complaint status updated to resolved"
}
```

## Database Schema Updates

Complaints now include:
```javascript
{
  id: string,
  description: string,
  status: "reported" | "in_progress" | "resolved",
  category: string,
  severity: string,
  latitude: number,
  longitude: number,
  userId: string,
  upvotes: number,
  createdAt: timestamp,
  updatedAt: timestamp,
  updatedBy: string,        // NEW: Authority UID
  resolverName: string,     // Department/resolver name
  assignedTo: string,       // Authority UID
  resolutionNote: string,   // NEW: Resolution details
  resolvedAt: timestamp,    // NEW: When resolved
  ...
}
```

## Workflow Example

1. **Citizen Reports** → Complaint created with status "reported"
2. **Authority Views** → See complaint in Authority Dashboard
3. **Authority Assigns** → Click "Assign" to assign to self/team
4. **Authority Starts** → Click "Start" to change status to "in_progress"
5. **Authority Resolves** → Click "Resolve" to:
   - Enter resolution notes (e.g., "Repaired the broken pothole")
   - Confirm resolution
   - Status changes to "resolved" with timestamp and notes

## Testing

To test the features:

1. Login as an authority user
2. Go to Authority Dashboard
3. View all complaints
4. Select a complaint with status "reported"
5. Click "Assign" to assign it
6. Click "Start" to begin work
7. Click "Resolve" and enter resolution notes
8. Confirm - status should update and complaint should move to resolved section

## Files Modified

- `backend/src/services/complaintService.js` - Enhanced status update
- `backend/src/controllers/complaintController.js` - Enhanced controller logic
- `frontend/src/pages/AuthorityDashboard.jsx` - Added resolution modal and improved UI
- `frontend/src/services/complaintService.js` - Support for resolution notes

## Security Notes

- All status updates require authentication and authority role
- Resolution notes are stored in database for audit trail
- Authority UID is tracked for accountability
- Timestamps are recorded for tracking when updates occurred
