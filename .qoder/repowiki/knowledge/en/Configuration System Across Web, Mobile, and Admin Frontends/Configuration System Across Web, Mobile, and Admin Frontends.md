---
kind: configuration_system
name: Configuration System Across Web, Mobile, and Admin Frontends
category: configuration_system
scope:
    - '**'
source_files:
    - src/api/api.js
    - vite.config.js
    - vercel.json
    - axx-spaces-mobile/src/config.js
    - axx-spaces-mobile/src/services/api.js
    - axx-spaces-mobile/app.json
    - axx-spaces-mobile/eas.json
    - axxspace-admin/.env
    - axxspace-admin/src/api/api.js
---

## Overview

The monorepo contains three independently configured frontends — a Vite/React web app (`src/`), an Expo/React Native mobile app (`axx-spaces-mobile/`), and a Create-React-Admin dashboard (`axxspace-admin/`) — each with its own configuration strategy. There is no shared configuration library; instead, each project loads environment variables through its framework's built-in mechanism and exposes them via a small local config module.

## Per-project configuration sources

### Web frontend (Vite)

- **Runtime env vars**: `import.meta.env.VITE_API_URL` in `src/api/api.js`, falling back to `http://localhost:1000/api`. The variable name prefix `VITE_` is the Vite convention for client-side env exposure.
- **Build-time constants**: `vite.config.js` defines `import.meta.env.VITE_APP_NAME` via the `define` block, hardcoding it as `'axx-spaces'` at build time.
- **Security headers**: Both `vite.config.js` (dev server) and `vercel.json` (production) set `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, plus a CSP header on Vercel that whitelists the backend domain `https://axx-spaces-backend-1.onrender.com` and Google OAuth/analytics domains.
- **SPA routing**: `vercel.json` rewrites all non-asset routes to `/index.html` and serves APKs under `/downloads/*` with `application/vnd.android.package-archive` + `Content-Disposition: attachment`.

### Mobile app (Expo)

- **App-level metadata**: `app.json` declares `expo.name`, `slug`, `version`, bundle IDs (`com.axxspaces.mobile`), Android permissions (INTERNET, CAMERA, location, storage), `usesCleartextTraffic: true`, splash screen, and EAS project ID under `extra.eas.projectId`.
- **Build profiles**: `eas.json` defines `development`, `preview`, and `production` profiles — preview builds APKs and simulator iOS; production auto-increments version numbers.
- **Runtime API URL**: `src/config.js` exports a `CONFIG` object whose `API_URL` switches between `http://localhost:1001/api` (when `__DEV__` is truthy) and `https://axxspace.com/api` otherwise. This is the single source of truth consumed by `src/services/api.js`.
- **Feature flags**: `CONFIG.FEATURES` toggles push notifications, location services, camera, and offline mode.
- **Other runtime settings**: Pagination defaults, image upload limits (5 MB, 10 images, jpeg/png/jpg), and cache TTL (1 hour, 50 MB image cache) live in the same `CONFIG` object.
- **Auth token storage**: `src/services/api.js` reads the bearer token from `expo-secure-store` via `SecureStore.getItemAsync('token')` before attaching it to requests.

### Admin dashboard (Create React App)

- **Env file**: `.env` sets `REACT_APP_API_URL=https://axx-spaces-backend-1.onrender.com/api` (the CRA convention for client env vars).
- **Axios instance**: `src/api/api.js` creates an axios client with `baseURL` sourced from `process.env.REACT_APP_API_URL`, defaulting to the Render backend URL.
- **Interceptors**: Request interceptor injects `Authorization: Bearer <token>` read from `localStorage('token')`; response/request interceptors log URLs and payloads for debugging.

## Conventions observed

- Each frontend has its own `api.js` that centralizes the HTTP client creation and base URL resolution.
- Environment-variable naming follows the bundler/framework convention per project: `VITE_*` for the web app, `REACT_APP_*` for the admin dashboard, and a custom `__DEV__` global for the mobile app.
- API URLs are never hardcoded in feature code; they are resolved once at the API layer and passed down (mobile uses `CONFIG.API_URL`, web/admin use axios `baseURL`).
- Authentication tokens are stored per platform: `localStorage` for web/admin, `expo-secure-store` for mobile.
- Build/deployment configuration lives alongside the app: `vercel.json` for the web deploy target, `eas.json` + `app.json` for Expo/EAS, and `vite.config.js` for the Vite build pipeline.
- Security headers are declared in two places for the web app: development headers in `vite.config.js` and production headers (including CSP) in `vercel.json`.

## Notable constraints

- The mobile app's `API_URL` falls back to `https://axxspace.com/api` when not in dev; this differs from the web and admin apps which point at `https://axx-spaces-backend-1.onrender.com/api`, indicating separate deployment targets or environments.
- `app.json` enables `usesCleartextTraffic: true` for Android, allowing HTTP connections (consistent with the dev `localhost:1001` API URL).
- `vercel.json` CSP `connect-src` explicitly allows `https://axx-spaces-backend-1.onrender.com` and its `wss://` counterpart, constraining which origins the browser may connect to at runtime.