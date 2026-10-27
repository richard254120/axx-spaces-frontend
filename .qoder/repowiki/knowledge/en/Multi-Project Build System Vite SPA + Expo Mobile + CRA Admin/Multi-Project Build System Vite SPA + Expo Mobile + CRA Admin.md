---
kind: build_system
name: 'Multi-Project Build System: Vite SPA + Expo Mobile + CRA Admin'
category: build_system
scope:
    - '**'
source_files:
    - package.json
    - vite.config.js
    - vercel.json
    - axx-spaces-mobile/package.json
    - axx-spaces-mobile/eas.json
    - axx-spaces-mobile/build-apk.js
    - axx-spaces-mobile/version-manager.js
    - axxspace-admin/package.json
    - axxspace-admin/start.sh
    - setup-frontend.sh
---

## Overview

This repository is a monorepo containing three independently built frontend projects, each with its own build toolchain and deployment target:

1. **Web SPA** (`src/`, root `package.json`) — React + Vite + Tailwind CSS
2. **Mobile App** (`axx-spaces-mobile/`) — Expo / React Native (Android APK via EAS)
3. **Admin Dashboard** (`axxspace-admin/`) — Create React App (react-scripts)

There is no top-level Makefile, Dockerfile, or CI pipeline in this repo. Build orchestration is per-project via `package.json` scripts, with platform-specific tooling.

## Web SPA (Vite)

- **Build tool**: Vite 8 (`vite.config.js`).
- **Scripts** (`package.json`): `dev` (`vite`), `build` (`vite build`), `preview` (`vite preview`), `lint` (`eslint .`).
- **Output**: `dist/` directory (configured via `vite.config.js` `build.outDir`).
- **Bundler config** (`vite.config.js`):
  - Dev server on port `5173`, auto-open.
  - Security headers in dev: `X-Content-Type-Options`, `X-Frame-Options: DENY`, `X-XSS-Protection`, `Referrer-Policy`.
  - Production builds disable sourcemaps (`sourcemap: false`).
  - Rollup output uses hashed filenames: `assets/[name]-[hash].js` for JS and assets.
  - Global constant `import.meta.env.VITE_APP_NAME = 'axx-spaces'` injected at build time.
- **Deployment**: Vercel via `vercel.json`. The file defines:
  - SPA rewrites: all non-asset/non-download routes fall back to `/index.html`.
  - `/downloads/:path*` served as-is with `Content-Type: application/vnd.android.package-archive` and `Content-Disposition: attachment` for APK downloads.
  - CSP header restricting script/style/connect/frame sources to `self`, Google OAuth/analytics, OpenStreetMap tiles, and the backend `https://axx-spaces-backend-1.onrender.com`.
  - Additional security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`.

## Mobile App (Expo)

- **Framework**: Expo ~51.0.0, React Native 0.74.5.
- **Scripts** (`axx-spaces-mobile/package.json`):
  - `start`: `expo start`
  - `android` / `ios`: `expo run:<platform>`
  - `web`: `expo start --web`
  - `build:apk`: `eas build --platform android --profile preview`
  - `build:android`: `eas build --platform android --profile production`
  - `submit:android`: `eas submit --platform android`
- **EAS profiles** (`axx-spaces-mobile/eas.json`):
  - `development`: development client, internal distribution.
  - `preview`: Android `apk` buildType, iOS simulator, internal distribution.
  - `production`: Android `apk` buildType, iOS `autoIncrement`.
  - Requires EAS CLI >= 5.2.0.
- **APK helper** (`axx-spaces-mobile/build-apk.js`): Node script that runs `eas build --platform android --profile preview --non-interactive`; artifacts are downloaded from the Expo dashboard rather than produced locally.
- **Version management** (`axx-spaces-mobile/version-manager.js`): CLI tool supporting `current`, `bump [major|minor|patch]`, `set <version>`, and `changelog` commands. It updates both `package.json#version` and `app.json#expo.version` atomically, and prepends entries to `CHANGELOG.md` with ISO timestamps.
- **Native build**: Android Gradle under `axx-spaces-mobile/android/` (standard Expo-generated project). Release APKs are also cached in `public/downloads/` (e.g. `axx-spaces-mobile-v1.0.0.apk`, `axx-spaces-manager-v1.0.0.apk`).

## Admin Dashboard (Create React App)

- **Framework**: `react-scripts` 5.0.1 (CRA).
- **Scripts** (`axxspace-admin/package.json`): `start`, `build`, `build:debug` (`--verbose`), `test`, `eject`.
- **Testing**: Jest via `@testing-library/react` and `@testing-library/jest-dom`.
- **Browserslist** targets last Chrome/Firefox/Safari versions in dev; broader coverage in production.
- **Startup helper** (`axxspace-admin/start.sh`): hard-coded path to `npm start` inside the admin project directory.

## Versioning Strategy

- Web SPA version is fixed at `0.0.0` in root `package.json` (no build-time version injection beyond `VITE_APP_NAME`).
- Mobile app version lives in `axx-spaces-mobile/package.json` (`1.0.1`) and is mirrored into `app.json#expo.version` by `version-manager.js`.
- Admin app version is `0.1.0` in `axxspace-admin/package.json`.
- APK artifacts published under `public/downloads/` follow the naming pattern `axx-spaces-mobile-v<major>.<minor>.<patch>.apk`.

## Linting & Code Quality

- Root ESLint config: `eslint.config.js` (flat config format, ESLint 9+).
- Admin project extends CRA's default ESLint preset (`react-app`, `react-app/jest`).

## Setup Script

- `setup-frontend.sh` is a scaffolding script that creates a minimal Vite/React project structure (`src/pages`, `src/components`, `src/api`, `src/layouts`, plus boilerplate `App.jsx`, `main.jsx`, `Home.jsx`, `Listings.jsx`, `api.js`, `index.css`). It is not used by the actual build — it appears to be a template/generator rather than part of the live build pipeline.

## Notable Absences

- No `Makefile`, no `Dockerfile`, no `.github/workflows/` CI configuration found in the repository.
- No top-level dependency lockfile aggregation (each subproject has its own `package-lock.json`).
- No cross-compilation or shared build logic between the three projects; they are built independently.