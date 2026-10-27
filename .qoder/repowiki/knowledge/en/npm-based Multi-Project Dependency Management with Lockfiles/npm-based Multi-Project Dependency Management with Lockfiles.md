---
kind: dependency_management
name: npm-based Multi-Project Dependency Management with Lockfiles
category: dependency_management
scope:
    - '**'
source_files:
    - package.json
    - package-lock.json
    - axx-spaces-mobile/package.json
    - axx-spaces-mobile/package-lock.json
    - axxspace-admin/package.json
    - axxspace-admin/package-lock.json
---

## System / Approach

The repository is a **monorepo of three independent Node.js/JavaScript projects** (a Vite-based React SPA, an Expo/React Native mobile app, and a Create React App admin dashboard). Each project manages its own dependencies via **npm** with `package.json` manifests and corresponding `package-lock.json` lockfiles. There is **no npm workspaces configuration** at the root — each subproject is resolved independently.

No vendoring strategy is used; all third-party packages are fetched from the public npm registry (`https://registry.npmjs.org/`, as evidenced by the `resolved` URLs in the root `package-lock.json`). No private registries, `.npmrc`, `GOPRIVATE`, or vendor directories are present.

## Key Files

- `package.json` + `package-lock.json` (root) — declares the Vite/React SPA dependencies and dev tooling (Vite 8, Tailwind CSS 4, ESLint 9, React 19).
- `axx-spaces-mobile/package.json` + `package-lock.json` — declares the Expo 51 / React Native 0.74 mobile app stack (Expo Camera, Location, Notifications, Secure Store, React Navigation, Reanimated, Screens, WebView).
- `axxspace-admin/package.json` + `package-lock.json` — declares the CRA-based admin dashboard (React 19, react-scripts 5.0.1, testing-library suite).
- Root `node_modules/` contains the installed tree for the SPA only; the mobile and admin projects maintain their own `node_modules/` under their directories.

## Architecture and Conventions

- **Per-project isolation**: Each of the three apps has its own `package.json`, `package-lock.json`, and `node_modules`. The root `package.json` does not declare shared dependencies across projects.
- **Version ranges**: Dependencies use caret (`^`) semver ranges (e.g. `"axios": "^1.16.0"`, `"react": "^19.2.4"`), allowing minor/patch updates that stay within the declared range. The mobile app pins some peer-compatible versions more tightly (e.g. `"react-native": "0.74.5"`, `"@react-native-async-storage/async-storage": "1.23.1"`).
- **Lockfile pinning**: All three projects commit `package-lock.json` files, which fix the exact transitive dependency tree and integrity hashes (`sha512` entries in the lockfile) so installs are reproducible.
- **Dev vs runtime split**: Runtime libraries live under `dependencies`; build/lint/test tooling lives under `devDependencies` (Vite, ESLint, PostCSS, Tailwind, Babel, testing-library).
- **No shared workspace**: Because there is no `workspaces` field, duplicate packages (e.g. `react`, `react-dom`, `axios`, `qrcode`, `react-router-dom`) exist separately in each project's `node_modules`, potentially leading to multiple copies of the same library in the repo.
- **Platform-specific stacks**: The mobile app uses Expo-managed native dependencies (Camera, Location, Notifications, Secure Store) alongside standard JS packages; the admin app uses CRA (`react-scripts 5.0.1`) while the SPA uses Vite — these are separate build systems per project.

## Conventions and Constraints

- **Observed convention**: Every project maintains its own `package.json` + `package-lock.json` pair; there is no root-level dependency hoisting or shared manifest.
- **Observed constraint**: All packages are sourced from the public npm registry — no `.npmrc` or private registry configuration was found in the repository.
- **Observed constraint**: Version ranges use caret (`^`) semantics rather than tilde (`~`) or exact pinning, except where platform compatibility requires tighter pinning (notably in the Expo mobile app).
- **Not enforced by tooling**: There is no automated dependency update bot (e.g. Dependabot, Renovate) or lockfile validation script visible in the repository.