// Injection bridge between the Axxspace website (inside the WebView) and the
// native shell. Injected before content loads on every document so the app is
// styled like an app from the very first paint (no browser-y flashes).

// CSS that makes the site feel native and hides browser-only chrome:
//  - the "Download our app" banner (#download-notification-banner)
//  - the web update toast (.app-update-notifier-container)
export const INJECTED_CSS = [
  '#download-notification-banner,',
  '.app-update-notifier-container,',
  '#download-notification-cta { display: none !important; }',
  'html { -webkit-text-size-adjust: 100%; overscroll-behavior-y: none; }',
  'html, body { -webkit-tap-highlight-color: transparent; }',
  'a, button, [role="button"] { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }',
  'input, textarea, [contenteditable="true"] { -webkit-user-select: text; user-select: text; }',
].join('\n');

// Builds the JS bridge string, embedding the CSS safely.
function buildBridge(css) {
  const lines = [
    '(function () {',
    '  if (window.__AXX_APP__) { return "booted"; }',
    '  window.__AXX_APP__ = true;',
    // Style the document like an app as soon as <head> is available.
    '  function injectCss() {',
    '    try {',
    '      if (document.getElementById("axx-native-shell-css")) return;',
    '      var s = document.createElement("style");',
    '      s.id = "axx-native-shell-css";',
    `      s.textContent = ${JSON.stringify(css)};`,
    '      (document.head || document.documentElement).appendChild(s);',
    '    } catch (e) {}',
    '  }',
    '  injectCss();',
    '  if (!document.head) { document.addEventListener("DOMContentLoaded", injectCss); }',
    // Report current location to native so the tab bar + header stay in sync.
    '  function report() {',
    '    try {',
    '      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {',
    '        window.ReactNativeWebView.postMessage(JSON.stringify({',
    '          type: "nav",',
    '          path: location.pathname + location.search,',
    '          url: location.href,',
    '          title: document.title || "Axxspace",',
    '          canGoBack: history.length > 1,',
    '        }));',
    '      }',
    '    } catch (e) {}',
    '  }',
    // React Router v6 calls history.pushState/replaceState for soft navigations,
    // so wrapping them captures in-app route changes without a full reload.
    '  var _ps = history.pushState.bind(history);',
    '  var _rs = history.replaceState.bind(history);',
    '  history.pushState = function () { _ps.apply(history, arguments); report(); };',
    '  history.replaceState = function () { _rs.apply(history, arguments); report(); };',
    '  window.addEventListener("popstate", report);',
    '  window.addEventListener("hashchange", report);',
    '  window.addEventListener("load", report);',
    '  document.addEventListener("DOMContentLoaded", report);',
    '  setTimeout(report, 300);',
    // Native -> web soft navigation. Falls back to a full load if needed.
    '  window.__axxGo = function (path) {',
    '    try {',
    '      history.pushState({}, "", path);',
    '      window.dispatchEvent(new PopStateEvent("popstate", { state: {} }));',
    '      report();',
    '      return true;',
    '    } catch (e) {',
    '      location.assign(path);',
    '      return false;',
    '    }',
    '  };',
    '  return "ok";',
    '})();',
  ];
  return lines.join('\n');
}

export const INJECTED_JS = buildBridge(INJECTED_CSS);

// Snippet the native side runs to switch tabs via the bridge (soft nav).
export function goScript(base, path) {
  const fullUrl = base.replace(/\/$/, '') + path;
  return [
    '(function(){',
    `  var full = ${JSON.stringify(fullUrl)};`,
    '  try {',
    '    if (typeof window.__axxGo === "function") { window.__axxGo(full); return; }',
    '  } catch (e) {}',
    '  try { if (location.href !== full) { location.assign(full); } } catch (e) {}',
    '})(); true;',
  ].join('\n');
}

export default INJECTED_JS;
