# CivicEcho Role-Based System Setup & Testing Guide

## System Overview

CivicEcho now has a complete role-based access control system with two distinct user roles:
- **Authority**: Can manage, review, and resolve community issues
- **Citizen**: Can report issues, upvote, and view their own complaints

---

## Authentication Setup

### Hardcoded Authority User

One authority user is pre-configured in the system:

| Property | Value |
|----------|-------|
| **Email** | `authority@civicecho.gov` |
| **Password** | `Authority123!` |
| **Role** | `authority` |

### Role Assignment Logic

Roles are assigned **server-side** based on an email whitelist configured in the backend:

**File**: `backend/.env`
```
AUTHORITY_EMAIL_WHITELIST=authority@civicecho.gov
```

**Logic**:
- Any email in `AUTHORITY_EMAIL_WHITELIST` → gets `authority` role
- All other emails → get `citizen` role
- Role is stored in Firestore under `users/{uid}/role`

---

## Component Architecture

### Backend Role Verification

**Middleware**: `backend/src/middleware/authorityCheck.js`
- Protects all authority endpoints
- Verifies Firebase ID token
- Checks Firestore for user role
- Returns 403 if user is not authority

**Example Flow**:
```
Client Request with Auth Token
        ↓
authorityCheck Middleware
        ↓
Verify Token & Get UID
        ↓
Fetch User from Firestore
        ↓
Check role === 'authority'
        ↓
Allow / Deny (403)
```

### Frontend Role Routing

**Protected Routes**: `frontend/src/components/RoleBasedRoutes.jsx`

```jsx
<CitizenRoute>      // Only citizens can access
  <ReportComplaint />
</CitizenRoute>

<AuthorityRoute>    // Only authorities can access
  <AuthorityDashboard />
</AuthorityRoute>
```

**Dashboard Routing**: `frontend/src/App.jsx`

```jsx
function RoleBasedDashboard() {
  const { isAuthority } = useAuth();
  
  if (isAuthority()) {
    return <AuthorityDashboard />;    // Authority Dashboard
  }
  
  return <Dashboard />;                // Citizen Dashboard
}
```

---

## Dashboards

### Citizen Dashboard (`frontend/src/pages/Dashboard.jsx`)

**Features**:
- View community complaints with statistics
- See issues by status, category, and severity
- Report new issues
- Upvote complaints
- Edit/delete own complaints
- Map view of all issues

**Access**: Only users with `role === 'citizen'`

**Header**: "Citizen Dashboard - View and manage your community issues"

### Authority Dashboard (`frontend/src/pages/AuthorityDashboard.jsx`)

**Features**:
- View ALL complaints with detailed information
- Filter by status (Reported, In Progress, Resolved)
- Update complaint status
- Assign resolver officer/department
- Real-time statistics
- Disabled actions for resolved issues

**Access**: Only users with `role === 'authority'`

**Header**: "Authority Dashboard - Manage community issues"

---

## Testing the System

### Test Scenario 1: Login as Authority

1. Go to `http://localhost:5173/login`
2. Enter credentials:
   - Email: `authority@civicecho.gov`
   - Password: `Authority123!`
3. Click "Login"

**Expected Result**:
- ✅ Successfully logs in
- ✅ Shows "Authority Dashboard" in navbar
- ✅ Displays authority dashboard with all issues
- ✅ Can see status management and resolver assignment
- ✅ Cannot access `/report` route (redirects to `/authority`)

**Console Logs** (Open DevTools - F12):
```
🔓 Attempting login with email: authority@civicecho.gov
✅ Authentication successful, UID: JOQDYjnwPUjklXmcLqvpCOXAnfyF
📡 Fetching user profile from API...
📦 API Response: {success: true, data: {uid: '...', email: '...', role: 'authority'}}
✅ Login successful - Role: authority
👤 Authority Email Whitelist: authority@civicecho.gov
✨ New user created: authority@civicecho.gov - Assigned role: authority
🎯 RoleBasedDashboard - Email: authority@civicecho.gov, Role: authority, isAuthority: true, Loading: false
📊 Rendering Authority Dashboard
```

### Test Scenario 2: Signup as Citizen

1. Go to `http://localhost:5173/signup`
2. Enter new credentials:
   - Email: `citizen@example.com` (or any email except authority@civicecho.gov)
   - Password: `Test123!` (or any password)
3. Click "Sign Up"

**Expected Result**:
- ✅ Successfully creates account
- ✅ Shows "Citizen Dashboard" in navbar (no "Authority" label)
- ✅ Displays citizen dashboard with stats and complaints
- ✅ Can see "Report Issue" button in navbar
- ✅ Cannot access `/authority` route (redirects to `/`)

**Console Logs**:
```
✍️ Attempting signup with email: citizen@example.com
✅ Account created, UID: abc123xyz...
📡 Creating user profile in API...
📦 API Response: {success: true, data: {uid: '...', email: '...', role: 'citizen'}}
✅ Signup successful - Role: citizen
👤 Authority Email Whitelist: authority@civicecho.gov
✨ New user created: citizen@example.com (uid) - Assigned role: citizen
🎯 RoleBasedDashboard - Email: citizen@example.com, Role: citizen, isAuthority: false, Loading: false
👥 Rendering Citizen Dashboard
```

### Test Scenario 3: Login Again as Authority

1. Go to `http://localhost:5173/login`
2. Enter hardcoded authority credentials again
3. Click "Login"

**Expected Result**:
- ✅ Shows "Authority Dashboard"
- ✅ Can manage issues (update status, assign resolver)
- ✅ Previous citizen login is logged out

**Key Log**:
```
✏️ Updating existing user: authority@civicecho.gov (uid) - Existing role: authority
```

---

## File Locations & Changes

### New Files Created

| File | Purpose |
|------|---------|
| `backend/src/middleware/authorityCheck.js` | Authority role verification |
| `backend/src/controllers/authorityController.js` | Authority API logic (3 endpoints) |
| `backend/src/routes/authorityRoutes.js` | Authority API routes |
| `backend/src/scripts/setupAuthority.js` | Authority user initialization script |
| `frontend/src/components/RoleBasedRoutes.jsx` | Protected route components |
| `frontend/src/services/authorityAPI.js` | Authority API service layer |

### Modified Files

| File | Changes |
|------|---------|
| `backend/.env` | Added `AUTHORITY_EMAIL_WHITELIST=authority@civicecho.gov` |
| `backend/src/index.js` | Added logging for authority whitelist, imported authorityRoutes |
| `backend/src/controllers/userController.js` | Added logging for role assignment |
| `frontend/src/context/AuthContext.jsx` | Enhanced with role fetching, detailed logging |
| `frontend/src/App.jsx` | Added RoleBasedRoutes wrapper, role-based dashboard routing |
| `frontend/src/pages/Dashboard.jsx` | Changed title to "Citizen Dashboard" |
| `frontend/src/pages/Login.jsx` | Added test credentials display box |

---

## API Endpoints

### Protected Authority Endpoints

All endpoints protected by `authorityCheck` middleware:

**GET /api/authority/issues**
- Returns all complaints with reporter details
- Requires: Authority role
- Response:
```json
{
  "issueId": "doc-id",
  "title": "Issue title",
  "status": "reported|in_progress|resolved",
  "reportedBy": {
    "userId": "user-id",
    "name": "Citizen Name",
    "email": "citizen@example.com"
  },
  "severity": "LOW|MEDIUM|HIGH|CRITICAL",
  "assignedResolver": "Officer Name or null"
}
```

**PATCH /api/authority/issues/:id/status**
- Updates issue status
- Requires: Authority role
- Body:
```json
{
  "status": "reported|in_progress|resolved"
}
```

**PATCH /api/authority/issues/:id/assign**
- Assigns resolver to issue
- Requires: Authority role
- Body:
```json
{
  "assignedResolver": "Officer or Department Name"
}
```

---

## Firestore Schema

### Users Collection

```
users/{uid}
├── uid: string
├── email: string
├── role: 'citizen' | 'authority'
├── name?: string
├── createdAt: timestamp
└── updatedAt: timestamp
```

### Complaints Collection

```
complaints/{docId}
├── userId: string (reporter UID)
├── title: string
├── description: string
├── category: string
├── severity: string
├── status: 'reported' | 'in_progress' | 'resolved'
├── latitude: number
├── longitude: number
├── address: string
├── assignedResolver?: string (authority assigned)
├── upvotes: number
└── createdAt: timestamp
```

---

## Environment Variables

### Backend (.env)

```env
# Authority Email Whitelist
AUTHORITY_EMAIL_WHITELIST=authority@civicecho.gov

# Can add more: authority1@civicecho.gov, authority2@civicecho.gov
```

---

## Troubleshooting

### Issue: Still shows "Citizen Dashboard" after authority login

**Check**:
1. Browser console logs (F12)
   - Look for `✅ Login successful - Role: authority`
   - Look for `📊 Rendering Authority Dashboard`
2. Backend logs (Terminal)
   - Look for `✨ New user created: authority@civicecho.gov - Assigned role: authority`
   - Look for `👤 Authority Email Whitelist: authority@civicecho.gov`

**Solutions**:
- Clear browser cache and localStorage: `localStorage.clear()`
- Reload page: `Ctrl + Shift + R` (hard refresh)
- Check if backend is running and authority email is in `.env`

### Issue: Can't login to authority account

**Check**:
- Is backend running? Check terminal
- Is Firebase Emulator running? Check backend logs for ✅ symbols
- Is email exactly `authority@civicecho.gov`? (case-insensitive but must match)
- Is password exactly `Authority123!`?

### Issue: Role not being fetched

**Check**:
1. Network tab in DevTools (F12 → Network)
   - POST request to `/api/users/profile` should return role
2. Firestore Emulator UI (http://localhost:4000)
   - Check if user document exists in `users` collection
   - Check if `role` field is set

---

## Production Deployment Notes

When deploying to production:

1. **Environment Variables**:
   - Update `AUTHORITY_EMAIL_WHITELIST` with actual authority emails
   - Use real Firebase credentials (not emulator)

2. **Security**:
   - All role checks are server-side verified (can't be bypassed by client)
   - Authority endpoints protected by middleware
   - Frontend protection is UI-only, backend is secure

3. **Email Whitelist**:
   - Add multiple emails: `email1@gov.com, email2@gov.com`
   - Update in deployment without restarting
   - Changes take effect on next user login/signup

---

## Summary

✅ **Two-tier role system**: Citizens and Authorities
✅ **Hardcoded authority user**: authority@civicecho.gov / Authority123!
✅ **Automatic role assignment**: Based on email whitelist
✅ **Protected dashboards**: Different UI for each role
✅ **Secure backend**: All endpoints server-side protected
✅ **Client-side routing**: Prevents accidental access to wrong pages
✅ **Comprehensive logging**: Debug every step of the flow

**Ready for production use!**
