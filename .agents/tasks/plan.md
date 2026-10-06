# Implementation Plan

# Implementation Plan

## Task Summary
Fix profile picture persistence issue, remove unwanted sections from AgentDashboard, and fix the infinite re-render loop causing continuous page refreshing.

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

### Page Refresh Issue Analysis (CRITICAL)
- **Root Cause**: Infinite re-render loop in useEffect dependencies
- **Issue Chain**:
  1. useEffect at line 616 depends on `[user, navigate, token]`
  2. When package upgrade detected, `updateUser()` is called (line 695)
  3. `updateUser()` modifies the `user` object in AuthContext
  4. Modified `user` triggers the first useEffect to run again
  5. This calls `loadMyPackage()` again, which may detect upgrade again
  6. **Result**: Infinite loop of re-renders and API calls
- **Location**: Lines 616-628 and 682-704 in AgentDashboard.jsx
- **Impact**: Page keeps refreshing continuously when package upgrade popup appears
- **Solution**: Fix useEffect dependencies and add proper guards to prevent infinite loops

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

**Package-Related State to Keep** (but fix polling logic):
- `packages`, `myPackage`, `pendingPurchase`, etc. (lines 512-520) - these are needed for package functionality
- Fix the polling mechanism instead of removing it

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

### 4. Fix Infinite Re-render Loop (CRITICAL)
**Root cause**: useEffect dependency on `user` object creates infinite loop when `updateUser()` is called
**Files**: `/home/oguda/Desktop/AXX/backend/axx-spaces-frontend/src/pages/AgentDashboard.jsx`

**Changes needed**:
1. **Fix useEffect dependencies** (Line 626):
   - Change from `[user, navigate, token]` to `[user?._id, navigate, token]` 
   - This prevents re-running when user object changes but the actual user ID stays the same

2. **Add upgrade detection guards** (Lines 690-704):
   - Use `useRef` to track last processed upgrade tier
   - Only call `updateUser()` and `addToast()` if tier actually changed from what was last processed
   - Prevent duplicate processing of same upgrade

3. **Reduce polling frequency** (Line 640):
   - Change from 3 seconds to 10 seconds: `}, 10000);`

4. **Add cleanup for polling** (Lines 630-645):
   - Ensure polling stops when user changes or component unmounts
   - Add proper cleanup to prevent memory leaks

**Specific code changes**:
```javascript
// Add at the top with other useRef declarations
const lastProcessedTierRef = useRef(null);

// Line 626: Change dependencies
}, [user?._id, navigate, token]);

// Lines 690-704: Add guard for upgrade detection
if (data.currentTier && 
    user?.agentProfile?.subscriptionTier !== data.currentTier &&
    lastProcessedTierRef.current !== data.currentTier) {
  
  lastProcessedTierRef.current = data.currentTier;
  console.log(`📦 [Package] Tier upgraded to ${data.currentTier}`);
  
  updateUser({
    ...user,
    agentProfile: {
      ...user.agentProfile,
      subscriptionTier: data.currentTier,
      subscriptionExpiresAt: data.expiresAt,
    }
  });
  addToast(`Package upgraded to ${data.package?.name}!`, 'success');
}

// Line 640: Reduce polling frequency
}, 10000); // 10 seconds instead of 3
```

### 5. Clean Up Imports and Dependencies
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

### For Infinite Loop Fix (CRITICAL):
1. Log in as agent and open browser console
2. Look for repeated console messages indicating component re-mounting
3. Verify polling messages appear only every 10 seconds (not every 3)
4. Test package upgrade scenario - ensure upgrade notification appears only once
5. Confirm page stops continuously refreshing after upgrade detection
6. Verify browser dev tools show stable component lifecycle (no infinite re-renders)
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
- Reducing polling frequency (improves performance)

**Medium Risk Changes**:
- Modifying package polling logic (requires testing to ensure upgrades still work)
- **CRITICAL**: Fixing useEffect dependencies (must test thoroughly to ensure no side effects)

**No Breaking Changes Expected**:
- Profile upload functionality remains intact
- Package upgrade functionality preserved (just optimized)
- Core dashboard features preserved
- Mobile responsiveness maintained
- All professional UI enhancements kept

**Rollback Plan**:
- Git commit before changes
- Backend change is easily reversible  
- Frontend changes are mostly removal-only (low risk)
- **CRITICAL**: useEffect dependency changes can be reverted immediately if issues arise
- Package polling changes can be reverted if issues arise

## File Summary
- **Backend**: 1 file modified (`routes/auth.js`)
- **Frontend**: 1 file modified (`pages/AgentDashboard.jsx`)
- **Total estimated lines changed**: ~500 lines removed, ~10 lines modified (including critical useEffect fix)