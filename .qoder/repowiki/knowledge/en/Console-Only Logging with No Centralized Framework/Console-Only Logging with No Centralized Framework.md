---
kind: logging_system
name: Console-Only Logging with No Centralized Framework
category: logging_system
scope:
    - '**'
source_files:
    - src/api/api.js
    - axx-spaces-mobile/App.js
    - axx-spaces-mobile/src/context/AuthContext.js
    - axx-spaces-mobile/src/screens/WebViewScreen.js
    - src/components/ErrorBoundary.jsx
---

# Logging System

## What system/approach is used

The repository has **no centralized logging framework**. There are no imports of `winston`, `pino`, `bunyan`, `loglevel`, `debug`, `log4js`, or any other structured logger across the three packages (`src/` web SPA, `axx-spaces-mobile/`, `axxspace-admin/`). All output goes directly through the browser/runtime native `console` API — specifically `console.log`, `console.error`, and a few `console.warn` calls.

There is no log-level strategy, no formatter, no sink abstraction, and no way to disable logs in production via configuration. The only environment-driven behavior is that the main frontend's axios interceptors (in `src/api/api.js`) emit request/response traces unconditionally.

## Key files and packages

- `src/api/api.js` — the only place where HTTP traffic is logged. Axios request/response interceptors print every outgoing request URL/data and every response/error, including status codes and error payloads.
- `axx-spaces-mobile/App.js` — top-level `console.error('Unhandled App Error:', error, errorInfo)` for global React Native errors.
- `axx-spaces-mobile/src/context/AuthContext.js` — `console.error` on auth load/login/register/logout failures.
- `axx-spaces-mobile/src/screens/*.js` — each screen catches fetch errors and prints them via `console.error` (BusinessScreen, DashboardScreen, HomeScreen, MaterialsScreen, MessagesScreen, MoversScreen, NotificationsScreen, PropertiesScreen, PropertyDetailScreen, SavedScreen, TourismScreen, WalletScreen).
- `axx-spaces-mobile/src/screens/WebViewScreen.js` — uses both `console.log` and `console.warn` for WebView lifecycle events.
- `src/components/ErrorBoundary.jsx` — `console.error("UI error:", error, info)` for React component crashes.
- `src/hooks/useDevToolsProtection.js` — contains a `debugger;` statement guarded by a dev-only check.

No dedicated `log/`, `logging/`, or logger utility module exists under any package.

## Architecture and conventions

Observed patterns (descriptive):

1. **Error-first, info-light**: Most `console.error` calls follow the pattern `console.error('Error loading <resource>:', error)`, embedding the failing resource name in the message string rather than passing structured fields.
2. **HTTP tracing lives in one place**: The main frontend centralizes request/response logging inside the single axios instance in `src/api/api.js`; screens themselves do not log HTTP details.
3. **Mobile screens mirror the same pattern**: Each screen in `axx-spaces-mobile/src/screens/` independently catches its own fetch errors and emits a descriptive `console.error` — there is no shared error handler or service layer doing it centrally.
4. **No log levels**: Calls use whichever of `log`/`warn`/`error` is most appropriate semantically; there is no application-level level enum or filter.
5. **No redaction or masking**: Sensitive data (e.g., `config.data` from axios requests, full error objects) is printed verbatim to the console.
6. **No transport/sink abstraction**: Logs go straight to the runtime console; there is no wrapper function, no custom logger class, and no pluggable destination.

## Conventions and constraints

- **Convention observed**: Errors are reported via `console.error(message, errorObject)` with a human-readable prefix describing the operation that failed.
- **Convention observed**: HTTP request/response bodies and URLs are always logged by the axios interceptors in `src/api/api.js` regardless of environment.
- **Constraint enforced by code structure**: Because there is no logger abstraction, adding a new sink (file, remote collector, etc.) would require touching every call site or refactoring all `console.*` invocations — there is no single entry point to change.
- **No documented logging policy** was found in READMEs, CLAUDE.md, AGENTS.md, BUILD_GUIDE.md, or DEPLOYMENT.md.
- **No build-time stripping**: Unlike some frameworks that strip `console.debug` in production, this repo does not configure such behavior; all `console.*` calls ship to the client as-is.