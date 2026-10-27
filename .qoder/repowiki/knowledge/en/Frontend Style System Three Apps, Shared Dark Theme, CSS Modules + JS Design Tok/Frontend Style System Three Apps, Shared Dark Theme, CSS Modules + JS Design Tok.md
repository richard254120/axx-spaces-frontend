---
kind: frontend_style
name: 'Frontend Style System: Three Apps, Shared Dark Theme, CSS Modules + JS Design Tokens'
category: frontend_style
scope:
    - '**'
source_files:
    - src/styles/theme.js
    - src/index.css
    - src/App.css
    - axx-spaces-mobile/src/constants/theme.ts
    - axx-spaces-mobile/src/global.css
    - axx-spaces-mobile/src/components/animated-icon.module.css
    - axxspace-admin/src/index.css
    - axxspace-admin/src/App.css
---

## Overview

The repository ships three separate frontend applications, each with its own styling approach but sharing a consistent dark-brand palette (red `#E31B1B` / gold `#fbbf24`, deep navy backgrounds `#0f1729`). There is no shared design-token package; instead, each app defines its own tokens and styles locally.

| App | Framework / Bundler | Styling approach | Token source |
|---|---|---|---|
| Web SPA (`src/`) | Vite + React 19 | Plain CSS files imported per component; Tailwind v4 and PostCSS are installed in devDependencies but not configured as the primary style system — most components use inline JS objects or plain `.css` files. | `src/styles/theme.js` |
| Mobile (`axx-spaces-mobile/`) | Expo / React Native | React Native `StyleSheet` + CSS modules for web-only variants (`*.web.tsx`, `animated-icon.module.css`). | `axx-spaces-mobile/src/constants/theme.ts` + `axx-spaces-mobile/src/global.css` |
| Admin (`axxspace-admin/`) | Create React App (`react-scripts`) | Plain `.css` files co-located with JSX components; global CSS variables in `index.css`. | `axxspace-admin/src/index.css` |

## Key Files

- **Web design tokens**: `src/styles/theme.js` — exports `COLORS`, `SPACING`, `BORDER_RADIUS`, `FONT_SIZES`, `FONT_WEIGHTS`, plus prebuilt `buttonStyles`, `inputStyles`, `cardStyles`, `pageStyles`, `heroStyles`, `sectionHeaderStyles` objects consumed via inline styles throughout pages/components.
- **Web globals**: `src/index.css` — resets, Leaflet overrides (popups, zoom controls, attribution bar) forced to match the dark theme, horizontal-scroll prevention, responsive image rules.
- **Web app shell**: `src/App.css` — leftover Vite scaffolding styles (hero, next-steps, ticks); not used by the actual application code.
- **Mobile theme**: `axx-spaces-mobile/src/constants/theme.ts` — light/dark `Colors`, platform-specific `Fonts` via `Platform.select`, numeric `Spacing`, `BottomTabInset`, `MaxContentWidth = 800`.
- **Mobile globals**: `axx-spaces-mobile/src/global.css` — CSS custom properties for font families (`--font-display`, `--font-mono`, `--font-rounded`, `--font-serif`) consumed by the mobile web build.
- **Admin globals**: `axxspace-admin/src/index.css` — CSS custom properties under `:root` (`--gold`, `--emerald`, `--rose`, `--blue`, `--bg-deep`, `--bg-sidebar`, `--bg-card`, `--text-main`, `--shadow-gold`, …), body gradient mesh background, scrollbar styling, `fadeIn` / `pulseGlow` / `bell-ring` keyframes.
- **Admin app shell**: `axxspace-admin/src/App.css` — animated gradient background on `.App`, floating orb blobs (`.orb-gold`, `.orb-blue`, `.orb-teal`, `.orb-purple`, `.orb-cyan`) with blur/glow animations.

## Architecture & Conventions

1. **JS-driven design tokens over CSS frameworks.** The web app centralizes all visual constants in `src/styles/theme.js` and applies them through inline `style={}` objects rather than utility classes. This is the dominant pattern across pages and components.
2. **Dark-first brand palette.** All three apps target a dark UI: the web uses `background: #0f1729 !important` at the root; the admin uses `--bg-deep: #070c18` with layered radial gradients; the mobile defaults to dark mode colors (`background: '#000000'`).
3. **Brand colors are red + gold.** Primary brand red `#E31B1B` (with `primaryDark: #C01010`, `primaryLight: #FF4D4D`) and accent gold `#fbbf24` (`accentDark: #f59e0b`) appear consistently across the web theme, admin CSS variables, and Leaflet overrides.
4. **Component-scoped CSS files.** Both the web and admin apps colocate a `.css` file alongside each component/page (e.g. `components/AppUpdateNotifier.css`, `pages/MobileAppDownload.css`, `components/AdminHeader.css`, `pages/Login.css`). No BEM naming convention is enforced — class names are flat component identifiers.
5. **No shared CSS framework in production.** Tailwind v4 and PostCSS are listed as devDependencies of the top-level workspace but there is no `tailwind.config.*` or `postcss.config.*` in the repo tree; the web app does not import Tailwind utilities. The admin app uses CRA's default CSS setup. The mobile app uses React Native StyleSheet plus a small CSS module (`animated-icon.module.css`) for the web target.
6. **Third-party library theming via global overrides.** Leaflet is styled by overriding `.leaflet-*` selectors in `src/index.css` with `!important` to force popups, zoom controls, and attribution into the dark theme.
7. **Responsive strategy is ad-hoc.** Breakpoints are written as raw `@media (max-width: ...)` rules inside component CSS files (e.g. `1024px` in `src/App.css`, `800` as `MaxContentWidth` in mobile). No design-system breakpoint tokens exist.
8. **Animations live in CSS.** The admin app defines several `@keyframes` (`fadeIn`, `pulseGlow`, `bell-ring`, `gradientShift`, `orbFloat`, `orbPulse`, `orbRotate`, `glow`) in its global/app CSS files; the web app relies mostly on `transition: all 0.2s` from the theme's button/input/card styles.

## Conventions & Constraints

- **Design tokens are centralized per app** in a single JS/TS file (`src/styles/theme.js`, `axx-spaces-mobile/src/constants/theme.ts`, `axxspace-admin/src/index.css` `:root` variables). New colors, spacing values, and fonts should be added there rather than hard-coded in components.
- **Inline style objects are the primary styling mechanism** in the web app — components spread `buttonStyles.primary`, `inputStyles.dark`, `cardStyles.light`, etc. from `theme.js` rather than using CSS classes.
- **Leaflet must be themed globally.** `src/index.css` contains extensive `!important` overrides for `.leaflet-*` selectors; any new map usage must respect these overrides or add matching ones.
- **Mobile web vs native separation:** Platform-specific styling goes in `*.web.tsx` files (e.g. `animated-icon.web.tsx`, `app-tabs.web.tsx`) and CSS modules (`*.module.css`) for web-only styles; native styles stay in TSX via `StyleSheet.create`.
- **Admin app uses CSS custom properties exclusively** for theming — new colors should extend the `:root` variable set in `axxspace-admin/src/index.css` rather than introducing new hex literals in components.
- **Tailwind is present only as a devDependency** and is not wired up; it should not be relied upon until a `tailwind.config.*` and PostCSS pipeline are added.