# Navigation System

<cite>
**Referenced Files in This Document**
- [App.js](file://axx-spaces-mobile/App.js)
- [AppNavigator.js](file://axx-spaces-mobile/src/navigation/AppNavigator.js)
- [app-tabs.tsx](file://axx-spaces-mobile/src/components/app-tabs.tsx)
- [app-tabs.web.tsx](file://axx-spaces-mobile/src/components/app-tabs.web.tsx)
- [_layout.tsx](file://axx-spaces-mobile/src/app/_layout.tsx)
- [index.tsx](file://axx-spaces-mobile/src/app/index.tsx)
- [explore.tsx](file://axx-spaces-mobile/src/app/explore.tsx)
- [package.json](file://axx-spaces-mobile/package.json)
- [HomeScreen.js](file://axx-spaces-mobile/src/screens/HomeScreen.js)
- [PropertyDetailScreen.js](file://axx-spaces-mobile/src/screens/PropertyDetailScreen.js)
- [AuthContext.js](file://axx-spaces-mobile/src/context/AuthContext.js)
- [DashboardScreen.js](file://axx-spaces-mobile/src/screens/DashboardScreen.js)
- [LoginScreen.js](file://axx-spaces-mobile/src/screens/LoginScreen.js)
- [RegisterScreen.js](file://axx-spaces-mobile/src/screens/RegisterScreen.js)
</cite>

## Update Summary
**Changes Made**
- Added comprehensive documentation for role-based navigation system with user role handling
- Updated authentication context to support multiple roles (landlord, tenant, mover, business, tourism)
- Enhanced dashboard screen with conditional rendering based on user roles
- Added role selection UI components in login and registration screens
- Documented community account handling and workspace vs community navigation patterns
- Updated navigation flows to support role-based menu structures and conditional access

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Role-Based Navigation System](#role-based-navigation-system)
6. [Authentication and User Roles](#authentication-and-user-roles)
7. [Detailed Component Analysis](#detailed-component-analysis)
8. [Dependency Analysis](#dependency-analysis)
9. [Performance Considerations](#performance-considerations)
10. [Troubleshooting Guide](#troubleshooting-guide)
11. [Conclusion](#conclusion)
12. [Appendices](#appendices)

## Introduction
This document explains the mobile navigation system for the AXX Spaces frontend, focusing on:
- React Navigation setup and stack configuration
- Tab-based navigation using app-tabs components (native vs web)
- Screen routing patterns and parameter passing between screens
- **Enhanced role-based navigation with user role handling**
- Community account handling and conditional rendering based on user roles (landlord, agent, host, tenant, mover, business)
- Platform-specific navigation behaviors
- How to add new navigation flows, implement deep linking, and manage navigation state

The codebase uses both Expo Router file-based routing (for the app shell) and a legacy React Navigation stack (for a WebView entry point). Tabs are implemented with platform-specific components that render native tabs on mobile and a custom tab bar on web. The system now supports multiple user roles with conditional menu structures and role-based access control.

## Project Structure
At a high level:
- App entry wraps the navigation container and error boundary
- The root navigator defines a minimal stack used by the WebView entry
- The app shell uses Expo Router layout and tabs
- Screens under src/screens use React Navigation's navigation API for programmatic navigation
- **Enhanced authentication context manages user roles and permissions**
- **Role-based dashboard and conditional menu rendering**

```mermaid
graph TB
Entry["App.js<br/>Entry + ErrorBoundary"] --> RootNav["AppNavigator.js<br/>NavigationContainer + Stack"]
RootNav --> WebViewScreen["WebViewScreen (referenced)"]
Shell["_layout.tsx<br/>ThemeProvider + AppTabs"] --> TabsNative["app-tabs.tsx<br/>NativeTabs"]
Shell --> TabsWeb["app-tabs.web.tsx<br/>Tabs (web)"]
TabsNative --> HomeRoute["src/app/index.tsx"]
TabsNative --> ExploreRoute["src/app/explore.tsx"]
Auth["AuthContext.js<br/>User Role Management"] --> Dashboard["DashboardScreen.js<br/>Role-Based Rendering"]
Auth --> Login["LoginScreen.js<br/>Role Selection"]
Auth --> Register["RegisterScreen.js<br/>Role Registration"]
```

**Diagram sources**
- [App.js:48-56](file://axx-spaces-mobile/App.js#L48-L56)
- [AppNavigator.js:9-29](file://axx-spaces-mobile/src/navigation/AppNavigator.js#L9-L29)
- [_layout.tsx:10-17](file://axx-spaces-mobile/src/app/_layout.tsx#L10-L17)
- [app-tabs.tsx:6-31](file://axx-spaces-mobile/src/components/app-tabs.tsx#L6-L31)
- [app-tabs.web.tsx:18-34](file://axx-spaces-mobile/src/components/app-tabs.web.tsx#L18-L34)
- [index.tsx:31-61](file://axx-spaces-mobile/src/app/index.tsx#L31-L61)
- [explore.tsx:14-125](file://axx-spaces-mobile/src/app/explore.tsx#L14-L125)
- [AuthContext.js:8-136](file://axx-spaces-mobile/src/context/AuthContext.js#L8-L136)
- [DashboardScreen.js:13-123](file://axx-spaces-mobile/src/screens/DashboardScreen.js#L13-L123)
- [LoginScreen.js:16-120](file://axx-spaces-mobile/src/screens/LoginScreen.js#L16-L120)
- [RegisterScreen.js:18-223](file://axx-spaces-mobile/src/screens/RegisterScreen.js#L18-L223)

**Section sources**
- [App.js:1-110](file://axx-spaces-mobile/App.js#L1-L110)
- [AppNavigator.js:1-30](file://axx-spaces-mobile/src/navigation/AppNavigator.js#L1-L30)
- [_layout.tsx:1-19](file://axx-spaces-mobile/src/app/_layout.tsx#L1-L19)
- [app-tabs.tsx:1-33](file://axx-spaces-mobile/src/components/app-tabs.tsx#L1-L33)
- [app-tabs.web.tsx:1-116](file://axx-spaces-mobile/src/components/app-tabs.web.tsx#L1-L116)
- [index.tsx:1-99](file://axx-spaces-mobile/src/app/index.tsx#L1-L99)
- [explore.tsx:1-181](file://axx-spaces-mobile/src/app/explore.tsx#L1-L181)

## Core Components
- App entry and error boundary:
  - Wraps the app with GestureHandlerRootView and an ErrorBoundary, then renders the root navigator.
- Root navigator:
  - Uses NavigationContainer and createStackNavigator to host a single screen (WebView entry).
- App tabs:
  - Native implementation uses expo-router's unstable-native-tabs for bottom tabs.
  - Web implementation uses expo-router/ui Tabs with a custom tab list and styling.
- App shell layout:
  - Provides theme provider and splash overlay, then renders AppTabs.
- File-based routes:
  - index.tsx and explore.tsx define the two tab screens.
- **Enhanced Authentication Context:**
  - Manages user sessions, roles, and authentication state across the application.
- **Role-Based Dashboard:**
  - Conditional rendering of dashboard actions and statistics based on user roles.

Key responsibilities:
- App.js: Application bootstrap and error handling
- AppNavigator.js: Root navigation container and stack definition
- app-tabs.tsx / app-tabs.web.tsx: Platform-specific tab UI and route triggers
- _layout.tsx: Theme and splash integration around tabs
- index.tsx / explore.tsx: Tab content screens
- **AuthContext.js: User authentication, role management, and session persistence**
- **DashboardScreen.js: Role-based dashboard with conditional action menus**

**Section sources**
- [App.js:48-56](file://axx-spaces-mobile/App.js#L48-L56)
- [AppNavigator.js:9-29](file://axx-spaces-mobile/src/navigation/AppNavigator.js#L9-L29)
- [app-tabs.tsx:6-31](file://axx-spaces-mobile/src/components/app-tabs.tsx#L6-L31)
- [app-tabs.web.tsx:18-34](file://axx-spaces-mobile/src/components/app-tabs.web.tsx#L18-L34)
- [_layout.tsx:10-17](file://axx-spaces-mobile/src/app/_layout.tsx#L10-L17)
- [AuthContext.js:8-136](file://axx-spaces-mobile/src/context/AuthContext.js#L8-L136)
- [DashboardScreen.js:13-123](file://axx-spaces-mobile/src/screens/DashboardScreen.js#L13-L123)

## Architecture Overview
The application has two coexisting navigation approaches:
- Legacy React Navigation stack for a WebView entry point
- Expo Router file-based routing for the main app shell with tabs
- **Enhanced role-based authentication system with conditional navigation flows**

```mermaid
sequenceDiagram
participant App as "App.js"
participant Root as "AppNavigator.js"
participant Stack as "createStackNavigator"
participant WebView as "WebViewScreen"
participant Shell as "_layout.tsx"
participant Tabs as "app-tabs.*"
participant RouteIndex as "src/app/index.tsx"
participant RouteExplore as "src/app/explore.tsx"
participant Auth as "AuthContext.js"
participant Dashboard as "DashboardScreen.js"
App->>Root : Render RootNavigator
Root->>Stack : Create Stack Navigator
Stack-->>WebView : Mount WebHome screen
Note over Root,WebView : Legacy stack entry point
Shell->>Tabs : Render AppTabs
Tabs->>RouteIndex : Navigate to Home (tab)
Tabs->>RouteExplore : Navigate to Explore (tab)
Note over Tabs,RouteExplore : Expo Router file-based tabs
Auth->>Dashboard : Provide user role context
Dashboard->>Dashboard : Filter actions by role
```

**Diagram sources**
- [App.js:48-56](file://axx-spaces-mobile/App.js#L48-L56)
- [AppNavigator.js:9-29](file://axx-spaces-mobile/src/navigation/AppNavigator.js#L9-L29)
- [_layout.tsx:10-17](file://axx-spaces-mobile/src/app/_layout.tsx#L10-L17)
- [app-tabs.tsx:10-30](file://axx-spaces-mobile/src/components/app-tabs.tsx#L10-L30)
- [app-tabs.web.tsx:20-33](file://axx-spaces-mobile/src/components/app-tabs.web.tsx#L20-L33)
- [index.tsx:31-61](file://axx-spaces-mobile/src/app/index.tsx#L31-L61)
- [explore.tsx:14-125](file://axx-spaces-mobile/src/app/explore.tsx#L14-L125)
- [AuthContext.js:8-136](file://axx-spaces-mobile/src/context/AuthContext.js#L8-L136)
- [DashboardScreen.js:13-123](file://axx-spaces-mobile/src/screens/DashboardScreen.js#L13-L123)

## Role-Based Navigation System

### User Role Management
The enhanced navigation system now supports multiple user roles with conditional rendering and access control:

**Supported Roles:**
- `landlord`: Property owners who can manage properties and tourism listings
- `tenant`: Users who rent properties
- `mover`: Moving service providers with specialized registration forms
- `business`: Business owners managing commercial spaces
- `tourism`: Tourism listing providers
- `agent`: Real estate agents with property management capabilities

**Role-Based Dashboard Actions:**
```javascript
const dashboardActions = [
  { id: 1, title: 'Add Property', icon: '➕', screen: 'AddProperty', role: 'landlord' },
  { id: 2, title: 'Add Tourism Listing', icon: '➕', screen: 'AddTourism', role: 'landlord' },
  { id: 3, title: 'Add Business', icon: '➕', screen: 'AddBusiness', role: 'business' },
  { id: 4, title: 'My Bookings', icon: '📅', screen: 'Bookings', role: 'all' },
  { id: 5, title: 'Analytics', icon: '📊', screen: 'Analytics', role: 'all' },
  { id: 6, title: 'Settings', icon: '⚙️', screen: 'Settings', role: 'all' },
];
```

**Conditional Action Filtering:**
```javascript
const availableActions = dashboardActions.filter(
  action => action.role === 'all' || action.role === user?.role
);
```

### Community Account Handling
The system distinguishes between workspace users (providers) and community accounts (members/explorers):

**Workspace Users:**
- Have dedicated dashboards and workspaces
- Can upload and manage properties/listings
- Access role-specific features and tools

**Community Accounts:**
- Limited to browsing and basic interactions
- Single entry point through "My Hub & Activities"
- Simplified navigation without workspace features

```mermaid
flowchart TD
User["User Login"] --> RoleCheck{"User Role Check"}
RoleCheck --> |landlord/business/tourism| Workspace["Workspace User"]
RoleCheck --> |member/user/guest| Community["Community Account"]
Workspace --> WorkspaceDash["Role-Specific Dashboard"]
Community --> MemberHub["Member Hub & Activities"]
WorkspaceDash --> RoleActions["Role-Based Actions"]
MemberHub --> BasicFeatures["Basic Features Only"]
```

**Diagram sources**
- [DashboardScreen.js:31-59](file://axx-spaces-mobile/src/screens/DashboardScreen.js#L31-L59)
- [Navbar.jsx:519-529](file://src/components/Navbar.jsx#L519-L529)

**Section sources**
- [DashboardScreen.js:48-59](file://axx-spaces-mobile/src/screens/DashboardScreen.js#L48-L59)
- [Navbar.jsx:519-529](file://src/components/Navbar.jsx#L519-L529)

## Authentication and User Roles

### Enhanced Authentication Context
The authentication system has been enhanced to support multiple roles and provide role-based functionality:

**Key Features:**
- Multi-role login support with default landlord role
- Role-based user data persistence
- Secure token storage with Expo SecureStore
- User profile management with role information

**Authentication Flow:**
```javascript
const login = async (email, password, role = 'landlord') => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, role }),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Login failed');
  
  setToken(data.token);
  setUser(data.user);
  await SecureStore.setItemAsync('token', data.token);
  await AsyncStorage.setItem('user', JSON.stringify(data.user));
};
```

### Role Selection Interface
Both login and registration screens include role selection interfaces:

**Login Screen Role Selector:**
- Visual role buttons for Landlord, Tenant, and Mover
- Active state highlighting for selected role
- Default role set to 'landlord'

**Registration Screen Role Handling:**
- Role-based form fields (e.g., mover-specific fields)
- Conditional field rendering based on selected role
- Photo upload capability for movers

```mermaid
sequenceDiagram
participant User as "User"
participant Login as "LoginScreen"
participant Auth as "AuthContext"
participant API as "Backend API"
participant Storage as "SecureStorage"
User->>Login : Select Role & Enter Credentials
Login->>Auth : login(email, password, role)
Auth->>API : POST /auth/login
API-->>Auth : {token, user}
Auth->>Storage : Store token & user data
Auth-->>Login : Success response
Login->>User : Navigate to Dashboard
```

**Diagram sources**
- [LoginScreen.js:16-36](file://axx-spaces-mobile/src/screens/LoginScreen.js#L16-L36)
- [AuthContext.js:31-60](file://axx-spaces-mobile/src/context/AuthContext.js#L31-L60)

**Section sources**
- [AuthContext.js:8-136](file://axx-spaces-mobile/src/context/AuthContext.js#L8-L136)
- [LoginScreen.js:16-120](file://axx-spaces-mobile/src/screens/LoginScreen.js#L16-L120)
- [RegisterScreen.js:18-223](file://axx-spaces-mobile/src/screens/RegisterScreen.js#L18-L223)

## Detailed Component Analysis

### Root Navigator (Legacy Stack)
- Purpose: Hosts a minimal stack used by the WebView entry point.
- Configuration:
  - NavigationContainer wraps the entire navigation tree.
  - createStackNavigator defines a single screen named "WebHome" pointing to WebViewScreen.
  - Global options hide headers and set a dark background.

```mermaid
flowchart TD
Start(["AppNavigator"]) --> Container["NavigationContainer"]
Container --> Stack["Stack.Navigator"]
Stack --> Screen["Stack.Screen 'WebHome' -> WebViewScreen"]
Screen --> End(["Rendered"])
```

**Diagram sources**
- [AppNavigator.js:9-29](file://axx-spaces-mobile/src/navigation/AppNavigator.js#L9-L29)

**Section sources**
- [AppNavigator.js:1-30](file://axx-spaces-mobile/src/navigation/AppNavigator.js#L1-L30)

### App Tabs (Platform-Specific)
- Native tabs:
  - Uses expo-router/unstable-native-tabs with a trigger per tab ("index", "explore").
  - Applies theme-aware colors and icons.
- Web tabs:
  - Uses expo-router/ui Tabs with a custom tab list and styled buttons.
  - Maps tab names to href paths ("/", "/explore").

```mermaid
classDiagram
class AppTabs_Native {
+NativeTabs
+Trigger("index")
+Trigger("explore")
}
class AppTabs_Web {
+Tabs
+TabList
+TabTrigger("/")
+TabTrigger("/explore")
}
AppTabs_Native <.. AppTabs_Web : "same component name<br/>platform-specific files"
```

**Diagram sources**
- [app-tabs.tsx:6-31](file://axx-spaces-mobile/src/components/app-tabs.tsx#L6-L31)
- [app-tabs.web.tsx:18-34](file://axx-spaces-mobile/src/components/app-tabs.web.tsx#L18-L34)

**Section sources**
- [app-tabs.tsx:1-33](file://axx-spaces-mobile/src/components/app-tabs.tsx#L1-L33)
- [app-tabs.web.tsx:1-116](file://axx-spaces-mobile/src/components/app-tabs.web.tsx#L1-L116)

### App Shell Layout
- Provides theme provider based on color scheme.
- Renders animated splash overlay and AppTabs.

```mermaid
flowchart TD
Layout["_layout.tsx"] --> Theme["ThemeProvider"]
Theme --> Splash["AnimatedSplashOverlay"]
Theme --> Tabs["AppTabs"]
```

**Diagram sources**
- [_layout.tsx:10-17](file://axx-spaces-mobile/src/app/_layout.tsx#L10-L17)

**Section sources**
- [_layout.tsx:1-19](file://axx-spaces-mobile/src/app/_layout.tsx#L1-L19)

### File-Based Routes (Expo Router)
- Two tab screens:
  - Home: src/app/index.tsx
  - Explore: src/app/explore.tsx
- These are automatically routed by Expo Router based on file structure.

```mermaid
graph LR
Index["src/app/index.tsx"] --> |Tab "Home"| ViewIndex["Home Screen"]
Explore["src/app/explore.tsx"] --> |Tab "Explore"| ViewExplore["Explore Screen"]
```

**Diagram sources**
- [index.tsx:31-61](file://axx-spaces-mobile/src/app/index.tsx#L31-L61)
- [explore.tsx:14-125](file://axx-spaces-mobile/src/app/explore.tsx#L14-L125)

**Section sources**
- [index.tsx:1-99](file://axx-spaces-mobile/src/app/index.tsx#L1-L99)
- [explore.tsx:1-181](file://axx-spaces-mobile/src/app/explore.tsx#L1-L181)

### Screen Routing Patterns and Parameter Passing
Screens under src/screens use React Navigation's imperative API:
- Programmatic navigation via navigation.navigate
- Passing parameters through route.params
- Example flows:
  - List item press navigates to detail with id
  - Detail screen reads params and navigates to messaging with propertyId and landlordId

```mermaid
sequenceDiagram
participant List as "HomeScreen.js"
participant Nav as "React Navigation"
participant Detail as "PropertyDetailScreen.js"
participant Chat as "MessagesScreen.js"
List->>Nav : navigate('PropertyDetail', { id })
Nav-->>Detail : Render with route.params.id
Detail->>Nav : navigate('Messages', { propertyId, landlordId })
Nav-->>Chat : Render with route.params
```

**Diagram sources**
- [HomeScreen.js:45-73](file://axx-spaces-mobile/src/screens/HomeScreen.js#L45-L73)
- [PropertyDetailScreen.js:17-82](file://axx-spaces-mobile/src/screens/PropertyDetailScreen.js#L17-L82)

**Section sources**
- [HomeScreen.js:45-73](file://axx-spaces-mobile/src/screens/HomeScreen.js#L45-L73)
- [PropertyDetailScreen.js:17-82](file://axx-spaces-mobile/src/screens/PropertyDetailScreen.js#L17-L82)

### Enhanced Dashboard with Role-Based Rendering
The dashboard screen now provides role-specific functionality:

**Role-Based Statistics Loading:**
```javascript
if (user?.role === 'landlord') {
  const properties = await propertyAPI.getProperties({ landlordId: user._id });
  setStats(prev => ({ ...prev, properties: properties.properties?.length || 0 }));
} else if (user?.role === 'tourism') {
  const tourism = await tourismAPI.getListings({ providerId: user._id });
  setStats(prev => ({ ...prev, tourism: tourism.listings?.length || 0 }));
} else if (user?.role === 'business') {
  const business = await businessAPI.getBusinesses({ ownerId: user._id });
  setStats(prev => ({ ...prev, business: business.businesses?.length || 0 }));
}
```

**Conditional Action Menu:**
- Filters available actions based on user role
- Supports universal actions (role: 'all')
- Provides role-specific quick actions

**Section sources**
- [DashboardScreen.js:27-59](file://axx-spaces-mobile/src/screens/DashboardScreen.js#L27-L59)

### Adding New Navigation Flows
- For Expo Router file-based routes:
  - Add a new file under src/app/<route>.tsx
  - Link from existing screens or tabs using href or router.push
- For legacy stack navigation:
  - Register a new Stack.Screen in AppNavigator.js
  - Navigate programmatically from any screen using navigation.navigate
- **For role-based navigation:**
  - Define role requirements in route configuration
  - Implement role checks in ProtectedRoute components
  - Handle role-based redirects and access control

Best practices:
- Keep route names consistent and descriptive
- Validate and sanitize route params before use
- Centralize common navigation actions in hooks or services if reused
- **Implement role-based access control consistently across all navigation flows**

[No sources needed since this section provides general guidance]

### Implementing Deep Linking
- Expo Router supports URL-based routing out of the box; ensure your app.json config includes prefixes and linking rules.
- For legacy stacks, configure linking inside NavigationContainer to map URLs to routes and params.
- **For role-based deep linking:**
  - Ensure deep links respect user roles and permissions
  - Redirect unauthorized users to appropriate dashboards
  - Handle role-specific deep link parameters

Steps:
- Define prefixes in app.json
- Map URL segments to route names and params
- Test on each platform (iOS, Android, web)
- **Validate user roles for deep link access**

[No sources needed since this section provides general guidance]

### Handling Navigation State Management
- Use React Navigation's navigation state listeners to sync analytics or persistence when routes change.
- For Expo Router, leverage built-in state persistence and back button behavior.
- Avoid storing large objects in route params; prefer IDs and fetch data on destination screens.
- **For role-based state management:**
  - Persist user role information securely
  - Sync navigation state with user permissions
  - Handle role changes during navigation

[No sources needed since this section provides general guidance]

## Dependency Analysis
The navigation layer depends on:
- @react-navigation/native and @react-navigation/stack for the legacy stack
- expo-router for file-based routing and tabs
- react-native-gesture-handler for gesture support
- expo-status-bar for status bar styling
- **@react-native-async-storage/async-storage for user data persistence**
- **expo-secure-store for secure token storage**

```mermaid
graph TB
AppJS["App.js"] --> RNStack["@react-navigation/stack"]
AppJS --> RNNative["@react-navigation/native"]
AppJS --> Gesture["react-native-gesture-handler"]
Shell["_layout.tsx"] --> ExpoRouter["expo-router"]
TabsNative["app-tabs.tsx"] --> ExpoRouter
TabsWeb["app-tabs.web.tsx"] --> ExpoRouterUI["expo-router/ui"]
Auth["AuthContext.js"] --> AsyncStorage["@react-native-async-storage/async-storage"]
Auth --> SecureStore["expo-secure-store"]
```

**Diagram sources**
- [App.js:1-6](file://axx-spaces-mobile/App.js#L1-L6)
- [AppNavigator.js:1-4](file://axx-spaces-mobile/src/navigation/AppNavigator.js#L1-L4)
- [_layout.tsx:1-6](file://axx-spaces-mobile/src/app/_layout.tsx#L1-L6)
- [app-tabs.tsx:1-4](file://axx-spaces-mobile/src/components/app-tabs.tsx#L1-L4)
- [app-tabs.web.tsx:1-10](file://axx-spaces-mobile/src/components/app-tabs.web.tsx#L1-L10)
- [AuthContext.js:1-4](file://axx-spaces-mobile/src/context/AuthContext.js#L1-L4)
- [package.json:14-34](file://axx-spaces-mobile/package.json#L14-L34)

**Section sources**
- [package.json:14-34](file://axx-spaces-mobile/package.json#L14-L34)

## Performance Considerations
- Prefer file-based routing (Expo Router) for better performance and reduced bundle size.
- Avoid heavy computations in route components; defer to lazy loading where possible.
- Minimize prop drilling; use context or hooks for shared navigation state.
- Use image optimization and lazy loading for tab icons and assets.
- **Optimize role-based rendering by filtering actions efficiently**
- **Use secure storage judiciously to avoid unnecessary re-renders**

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and resolutions:
- Blank screen after navigation:
  - Ensure NavigationContainer is mounted once at the root.
  - Verify route names match exactly.
- Params not received:
  - Confirm route.params exists and handle undefined cases.
- Tabs not switching on web:
  - Check app-tabs.web.tsx href mappings and ensure routes exist.
- Status bar misalignment:
  - Verify StatusBar configuration and safe area usage.
- **Role-based navigation issues:**
  - Ensure user role is properly set in authentication context
  - Verify role-based action filtering logic
  - Check that role-specific screens are properly registered
- **Authentication problems:**
  - Verify token storage and retrieval from secure storage
  - Check user data persistence in async storage
  - Ensure role information is correctly passed during login

**Section sources**
- [App.js:8-46](file://axx-spaces-mobile/App.js#L8-L46)
- [AppNavigator.js:9-29](file://axx-spaces-mobile/src/navigation/AppNavigator.js#L9-L29)
- [app-tabs.web.tsx:18-34](file://axx-spaces-mobile/src/components/app-tabs.web.tsx#L18-L34)
- [AuthContext.js:17-29](file://axx-spaces-mobile/src/context/AuthContext.js#L17-L29)
- [DashboardScreen.js:27-59](file://axx-spaces-mobile/src/screens/DashboardScreen.js#L27-L59)

## Conclusion
The navigation system combines a legacy React Navigation stack for a WebView entry point with Expo Router's file-based routing and platform-specific tabs for the main app shell. The system has been significantly enhanced with role-based navigation, supporting multiple user roles (landlord, tenant, mover, business, tourism, agent) with conditional menu structures and access control. Screens pass parameters via route.params and navigate imperatively. To extend the system:
- Add file-based routes under src/app for Expo Router
- Register stack screens in AppNavigator.js for legacy flows
- Configure deep linking in app.json and NavigationContainer
- Manage navigation state carefully to avoid unnecessary re-renders
- **Implement role-based access control for new navigation flows**
- **Handle community accounts vs workspace users appropriately**

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### Quick Reference: Key Files and Responsibilities
- App.js: Entry point, error boundary, and root navigator wrapper
- AppNavigator.js: Root stack configuration
- app-tabs.tsx: Native tabs implementation
- app-tabs.web.tsx: Web tabs implementation
- _layout.tsx: Theme provider and splash overlay
- index.tsx: Home tab screen
- explore.tsx: Explore tab screen
- package.json: Navigation dependencies
- **AuthContext.js: Enhanced authentication with role management**
- **DashboardScreen.js: Role-based dashboard with conditional rendering**
- **LoginScreen.js: Role selection interface for login**
- **RegisterScreen.js: Role-based registration with conditional fields**

**Section sources**
- [App.js:48-56](file://axx-spaces-mobile/App.js#L48-L56)
- [AppNavigator.js:9-29](file://axx-spaces-mobile/src/navigation/AppNavigator.js#L9-L29)
- [app-tabs.tsx:6-31](file://axx-spaces-mobile/src/components/app-tabs.tsx#L6-L31)
- [app-tabs.web.tsx:18-34](file://axx-spaces-mobile/src/components/app-tabs.web.tsx#L18-L34)
- [_layout.tsx:10-17](file://axx-spaces-mobile/src/app/_layout.tsx#L10-L17)
- [index.tsx:31-61](file://axx-spaces-mobile/src/app/index.tsx#L31-L61)
- [explore.tsx:14-125](file://axx-spaces-mobile/src/app/explore.tsx#L14-L125)
- [package.json:14-34](file://axx-spaces-mobile/package.json#L14-L34)
- [AuthContext.js:8-136](file://axx-spaces-mobile/src/context/AuthContext.js#L8-L136)
- [DashboardScreen.js:13-123](file://axx-spaces-mobile/src/screens/DashboardScreen.js#L13-L123)
- [LoginScreen.js:16-120](file://axx-spaces-mobile/src/screens/LoginScreen.js#L16-L120)
- [RegisterScreen.js:18-223](file://axx-spaces-mobile/src/screens/RegisterScreen.js#L18-L223)