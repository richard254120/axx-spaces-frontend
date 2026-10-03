# Implementation Plan

## Task Summary
Fix profile picture persistence issue and remove unwanted sections from AgentDashboard based on user requirements.

## Investigation Findings

### Profile Picture Persistence Issue
- **Root Cause**: The login endpoint in `/backend/routes/auth.js` only returns basic user fields (`_id`, `name`, `email`, `phone`, `role`, `landlordType`, `isApproved`) but does NOT include `profileImage` in the response
- **Secondary Issue**: The `formatUserResponse` utility in `/backend/utils/formatUser.js` includes `profileImage` but the login endpoint bypasses this formatter
- **Frontend Issue**: AuthContext properly stores and retrieves user data from localStorage, so the issue is purely backend

### AgentDashboard Structure Analysis
- File: `/frontend/src/pages/AgentDashboard.jsx` (1,700+ lines)
- Contains 4 main tabs: "My Houses", "Accommodation Hosts", "Landlords", "My Requests"
- Profile picture upload functionality is already implemented and working for upload
- Sections to remove: Hosts tab, Landlords tab, Requests tab (includes state, API calls, UI components)

## Implementation Plan

### 1. Fix Profile Picture Persistence in Backend
**Root cause**: Login endpoint doesn't return profileImage field
**Files**: `/home/oguda/Desktop/AXX/backend/axx-spaces-backend/routes/auth.js`
**Fix**: Update the login response to include profileImage field in the user object

**Changes needed**:
- Line ~190 in auth.js: Change the hardcoded user response object to use `formatUserResponse(user)` or manually add `profileImage: user.profileImage || ""`
- This ensures profileImage is returned on login and stored in frontend localStorage

**Verification**: Log in as agent, upload profile picture, logout, login again - profile picture should persist

### 2. Remove Unwanted Sections from AgentDashboard
**Files**: `/home/oguda/Desktop/AXX/backend/axx-spaces-frontend/src/pages/AgentDashboard.jsx`

**State Variables to Remove**:
- `providers` (line ~37)
- `landlords` (line ~38) 
- `myRequests` (line ~39)
- `selectedProvider` (line ~42)
- `message` (line ~43)
- `sending` (line ~44)
- `hoveredProvider` (line ~49)
- `requestStatusFilter` (line ~52)

**API Calls to Remove from loadData() function** (lines ~155-180):
- Fetch to `/agent-requests/providers` endpoint
- Split into providers/landlords arrays
- Fetch to `/agent-requests` endpoint
- All related error handling

**Functions to Remove**:
- `getRequestStatus()` (lines ~230-235)
- `handleSendRequest()` (lines ~237-262)
- `filteredRequests()` (lines ~145-150)
- `requestCounts` object (lines ~151-157)

**JSX/UI Components to Remove**:
- "Accommodation Hosts" tab button (line ~390-395)
- "Landlords" tab button (line ~396-401) 
- "My Requests" tab button (line ~402-407)
- All content for `activeTab === "hosts"` (lines ~550-620)
- All content for `activeTab === "landlords"` (lines ~622-692)
- All content for `activeTab === "requests"` (lines ~694-790)
- Modal for sending requests (lines ~795-840)

**Keep These Components**:
- Profile section with picture upload
- Stats overview section
- "My Houses" tab and all its functionality
- QR code generation
- Mobile responsiveness
- Professional UI enhancements
- Toast notifications system

### 3. Update Tab State Management
**Files**: `/home/oguda/Desktop/AXX/backend/axx-spaces-frontend/src/pages/AgentDashboard.jsx`
**Changes**: 
- Remove tab switching logic for removed tabs
- Ensure `activeTab` defaults to "houses" and only allows "houses" value
- Remove tab validation for non-existent tabs

### 4. Clean Up Imports and Dependencies
**Files**: `/home/oguda/Desktop/AXX/backend/axx-spaces-frontend/src/pages/AgentDashboard.jsx`
**Changes**:
- Remove any unused imports related to request functionality
- Verify all remaining imports are still needed

## Verification Steps

### For Profile Picture Fix:
1. Build and start the backend server: `cd /home/oguda/Desktop/AXX/backend/axx-spaces-backend && npm start`
2. Start frontend dev server: `cd /home/oguda/Desktop/AXX/backend/axx-spaces-frontend && npm run dev`  
3. Log in as agent, upload profile picture
4. Log out completely and log back in
5. Verify profile picture is displayed correctly

### For Dashboard Cleanup:
1. Navigate to agent dashboard
2. Verify only "My Houses" tab is visible
3. Verify all removed sections (Hosts, Landlords, Requests) are gone
4. Verify profile upload, QR generation, and house management still work
5. Test mobile responsiveness
6. Check browser console for any JavaScript errors

## Dependencies and Risk Assessment

**Low Risk Changes**:
- Backend login endpoint fix (isolated change)
- Removing unused state variables and functions
- Removing UI components

**No Breaking Changes Expected**:
- Profile upload functionality remains intact
- Core dashboard features preserved
- Mobile responsiveness maintained
- All professional UI enhancements kept

**Rollback Plan**:
- Git commit before changes
- Backend change is easily reversible
- Frontend changes are removal-only (low risk)

## File Summary
- **Backend**: 1 file modified (`routes/auth.js`)
- **Frontend**: 1 file modified (`pages/AgentDashboard.jsx`)
- **Total estimated lines changed**: ~500 lines removed, ~1 line modified