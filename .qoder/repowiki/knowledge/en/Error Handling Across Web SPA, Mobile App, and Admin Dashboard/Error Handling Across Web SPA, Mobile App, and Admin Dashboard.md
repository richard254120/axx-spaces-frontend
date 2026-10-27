---
kind: error_handling
name: Error Handling Across Web SPA, Mobile App, and Admin Dashboard
category: error_handling
scope:
    - '**'
source_files:
    - src/components/ErrorBoundary.jsx
    - src/features/accommodation/components/ErrorAlert.jsx
    - src/api/api.js
    - axx-spaces-mobile/src/services/api.js
    - axxspace-admin/src/api/api.js
    - src/components/NotificationSystem.jsx
    - middleware/security.js
---

## Overview

The AXX Spaces monorepo is a React-based frontend (Vite) plus an Expo mobile app and a separate React admin dashboard, all calling a shared Express backend. Error handling is **not centralized around a single framework or typed error hierarchy**. Instead, it follows three complementary layers:

1. **React UI-level crash containment** via `ErrorBoundary` components.
2. **Per-app HTTP client wrappers** that log errors and re-throw them to callers.
3. **Scattered try/catch blocks** in screens/components that surface user-facing messages (often via inline state or a small `ErrorAlert` component).

There is no repository-wide error code enum, no custom error class hierarchy, and no global unhandled-rejection handler — each app handles its own failures independently.

---

## 1. React UI Crash Containment

### Main web SPA (`src/components/ErrorBoundary.jsx`)

A class component implements the standard React `getDerivedStateFromError` + `componentDidCatch` pattern:

- Sets `{ hasError: true, message }` from the thrown error's `.message` (defaulting to `"Something went wrong"`).
- Renders a dark-themed fallback page with a "Refresh" button (`window.location.reload()`) and a "Go Home" button (`window.location.href = "/"`).
- Logs the full error object and React info via `console.error("UI error:", error, info)`.

This component is used as a wrapper around route/page trees to prevent a crashed child from taking down the whole SPA.

### Mobile app (`axx-spaces-mobile/App.js`)

The same React `ErrorBoundary` pattern is duplicated inside the Expo app's entry point, providing the same kind of per-tree crash isolation for the mobile shell.

### Per-feature alert component (`src/features/accommodation/components/ErrorAlert.jsx`)

A small presentational component renders a red-bordered alert box with a message and optional `onRetry` button. It is consumed by accommodation feature screens to display API/user errors without leaking stack traces.

---

## 2. HTTP Client Wrappers

### Main web SPA (`src/api/api.js`)

An Axios instance is created with:

- `baseURL` from `import.meta.env.VITE_API_URL` or `http://localhost:1000/api`.
- A 30-second timeout.
- A request interceptor that attaches `Authorization: Bearer <token>` from `localStorage` and logs the outgoing request.
- A response interceptor that logs successful responses and, on rejection, distinguishes between `error.response`, `error.request`, and generic `error.message`, then **re-throws** the error via `Promise.reject(error)`.

Callers are expected to handle the rejected promise themselves.

### Admin dashboard (`axxspace-admin/src/api/api.js`)

A second Axios instance uses `process.env.REACT_APP_API_URL` (defaulting to the Render-hosted backend URL). It also attaches the token from `localStorage` and logs requests/responses/errors, re-throwing on failure.

### Mobile app (`axx-spaces-mobile/src/services/api.js`)

Instead of Axios, the mobile app wraps native `fetch` in an `apiCall(endpoint, options)` helper:

- Adds `Content-Type: application/json` and optionally an `Authorization` header fetched from `expo-secure-store`.
- Throws `new Error(data.error || 'API request failed')` when `response.ok` is false.
- Catches and re-throws network/JSON errors after logging via `console.error('API call error:', error)`.

All domain-specific modules (`authAPI`, `propertyAPI`, `tourismAPI`, `businessAPI`, `materialsAPI`, `moversAPI`, `userAPI`, `notificationAPI`, `walletAPI`) delegate to this single `apiCall` function.

---

## 3. Caller-Side Error Handling Patterns

Across screens and components, errors are handled locally:

- **try/catch around async calls**, with `catch (err)` / `catch (error)` blocks that either set local error state, show a toast/message, or log to console.
- **Mobile auth context** (`axx-spaces-mobile/src/context/AuthContext.js`) throws `new Error(data.error || 'Login failed')` / `'Registration failed'` on non-OK responses; callers catch and surface the message.
- **Admin dashboard components** (e.g. `BadgeManagement.jsx`, `BoostManagement.jsx`, `PaymentApprovals.jsx`, `UserBadgeManagement.jsx`) follow the same try/catch + local state pattern, often rendering a div whose className includes `"error"` when the message string contains `"Error"`.
- **Notification system** (`src/components/NotificationSystem.jsx`) falls back to `localStorage` when the server is unreachable — catching errors silently (`catch {}`) so the UI remains usable even if notifications cannot sync.

---

## 4. Backend Security Middleware (Server-Side Errors)

The Express middleware at `middleware/security.js` configures security-related error-producing behavior:

- `express-rate-limit` returns JSON `{ error: "Too many requests..." }` for both general traffic (100 req/15 min) and auth endpoints (10 req/15 min).
- `helmet`, `cors`, `mongoSanitize`, `xss-clean`, `hpp`, and `cookie-parser` are applied via `applyTo(app)`.
- No custom error-handling middleware (e.g. an Express `err => res.status(500).json(...)`) is defined in this file; it only installs defensive middleware.

---

## Key Files

- `src/components/ErrorBoundary.jsx` — main SPA UI crash boundary
- `axx-spaces-mobile/App.js` — mobile app crash boundary
- `src/features/accommodation/components/ErrorAlert.jsx` — reusable error alert component
- `src/api/api.js` — main SPA Axios client with interceptors
- `axxspace-admin/src/api/api.js` — admin dashboard Axios client
- `axx-spaces-mobile/src/services/api.js` — mobile fetch wrapper
- `src/components/NotificationSystem.jsx` — resilient notification layer with local fallback
- `middleware/security.js` — server-side rate limiting and sanitization

---

## Conventions Observed

- **No shared error type system**: there is no `errors/` directory, no custom `AppError` class, and no error-code constants shared across apps. Errors are plain `Error` objects or strings.
- **HTTP clients centralize transport concerns** (auth header injection, base URL, logging) but do not transform errors into domain types — they re-throw the original axios/fetch error.
- **Presentation-layer error display is ad-hoc**: some screens use a dedicated `ErrorAlert` component, others render inline text, and some rely on `console.error` alone.
- **Graceful degradation**: the notification system demonstrates a pattern where server failure is swallowed and a local `localStorage` cache is used instead, keeping the UI functional.
- **Rate-limited server responses** return a uniform `{ error: "..." }` shape, which downstream clients typically unwrap into a user-facing message (`data.error || '...'`).
- **No global unhandled-promise rejection handler** was found in the inspected files; uncaught rejections would propagate to the browser/console rather than being caught by a top-level handler.