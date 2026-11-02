// Bottom tab definitions mapped to REAL routes on the Axxspace website
// (see axx-spaces-frontend/src/App.jsx). The WebView navigates to
// `${WEBSITE_URL}${path}`. Kept intentionally small and app-focused.
//
// `match` lists the URL prefixes that should keep a tab highlighted, so
// deep pages (e.g. /listings/123) still light up the right tab.
export const TABS = [
  {
    key: 'home',
    label: 'Home',
    path: '/',
    icon: '🏠',
    match: ['/'],
  },
  {
    key: 'properties',
    label: 'Properties',
    path: '/listings',
    icon: '🔑',
    match: ['/listings', '/property', '/upload'],
  },
  {
    key: 'stay',
    label: 'Stay',
    path: '/accommodation',
    icon: '🏨',
    match: ['/accommodation', '/my-bookings'],
  },
  {
    key: 'market',
    label: 'Market',
    path: '/axxbiashara',
    icon: '🛍️',
    match: ['/axxbiashara', '/business', '/quicksales', '/materials'],
  },
  {
    key: 'profile',
    label: 'Profile',
    path: '/profile',
    icon: '👤',
    match: ['/profile', '/login', '/user-login', '/register', '/user-register', '/settings', '/wallet', '/saved', '/messages', '/notifications', '/dashboard', '/member'],
  },
];

// Resolve which tab should be active for a given path.
export function activeTabForPath(path) {
  if (!path) return 'home';
  const clean = (path || '/').split('?')[0].replace(/\/$/, '') || '/';
  let best = 'home';
  let bestLen = -1;
  for (const tab of TABS) {
    for (const prefix of tab.match) {
      const norm = prefix === '/' ? '/' : prefix;
      const isMatch =
        norm === '/'
          ? clean === '/'
          : clean === norm || clean.startsWith(norm + '/');
      if (isMatch && norm.length > bestLen) {
        best = tab.key;
        bestLen = norm.length;
      }
    }
  }
  return best;
}

export default TABS;
