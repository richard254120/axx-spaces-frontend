import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  BackHandler,
  Share,
  Linking,
  Animated,
  Easing,
} from 'react-native';
import { WebView } from 'react-native-webview';
import NetInfo from '@react-native-community/netinfo';
import CONFIG from '../config';
import { COLORS } from '../constants/appTheme';
import { INJECTED_JS } from '../utils/injected';
import TopBar from '../components/TopBar';
import SplashOverlay from '../components/SplashOverlay';
import { OfflineScreen, ErrorScreen, UpdateBanner } from '../components/StateScreens';

const TARGET_URL = CONFIG.WEBSITE_URL || 'https://axxspace.com';
const SITE_HOST = (() => {
  try { return new URL(TARGET_URL).host; } catch { return 'axxspace.com'; }
})();

function isNewerVersion(latest, current) {
  const l = latest.split('.').map(Number);
  const c = current.split('.').map(Number);
  for (let i = 0; i < Math.max(l.length, c.length); i++) {
    const a = l[i] || 0;
    const b = c[i] || 0;
    if (a > b) return true;
    if (a < b) return false;
  }
  return false;
}

export default function WebViewScreen() {
  const webViewRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [splashVisible, setSplashVisible] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const [currentPath, setCurrentPath] = useState('/');
  const [pageTitle, setPageTitle] = useState('Axxspace');
  const [canGoBack, setCanGoBack] = useState(false);

  const [isOffline, setIsOffline] = useState(false);
  const [webError, setWebError] = useState(null);
  const [retrying, setRetrying] = useState(false);

  const [updateInfo, setUpdateInfo] = useState(null);
  const [showUpdate, setShowUpdate] = useState(false);

  const progress = useRef(new Animated.Value(0)).current;

  // --- Top progress bar animation driven by the loading flag ---
  useEffect(() => {
    if (loading && !splashVisible) {
      progress.setValue(0);
      Animated.timing(progress, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    }
  }, [loading, splashVisible, progress]);

  // --- Shell (APK) self-update check. Site content updates are automatic. ---
  useEffect(() => {
    const url = `${CONFIG.VERSION_MANIFEST_URL}?t=${Date.now()}`;
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.latestVersion && isNewerVersion(data.latestVersion, CONFIG.APP_VERSION)) {
          setUpdateInfo(data);
          if (!data.forceUpdate) setShowUpdate(true);
          else setShowUpdate(true);
        }
      })
      .catch(() => {});
  }, []);

  // --- Connectivity ---
  useEffect(() => {
    const unsub = NetInfo.addEventListener((state) => {
      const offline = state.isConnected === false || state.isInternetReachable === false;
      setIsOffline(offline);
      if (!offline && hasLoadedOnce && webViewRef.current) {
        // came back online: clear the offline screen and let the WebView show again
        setWebError(null);
      }
    });
    NetInfo.fetch().then((s) => setIsOffline(s.isConnected === false));
    return () => unsub();
  }, [hasLoadedOnce]);

  // --- Android hardware back: navigate the page history, else minimize ---
  useEffect(() => {
    if (Platform.OS !== 'android') return;
    const onBack = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      BackHandler.exitApp();
      return true;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => sub.remove();
  }, [canGoBack]);

  const handleRetry = useCallback(() => {
    setRetrying(true);
    setWebError(null);
    setIsOffline(false);
    setLoading(true);
    webViewRef.current && webViewRef.current.reload();
    setTimeout(() => setRetrying(false), 1200);
  }, []);

  const handleRefresh = useCallback(() => {
    setWebError(null);
    setLoading(true);
    webViewRef.current && webViewRef.current.reload();
  }, []);

  const handleShare = useCallback(() => {
    const link = `${TARGET_URL.replace(/\/$/, '')}${currentPath}`;
    Share.share({
      message: `Check this out on Axxspace: ${link}`,
      url: link,
      title: pageTitle || 'Axxspace',
    }).catch(() => {});
  }, [currentPath, pageTitle]);

  // External protocols and off-site links
  const openExternal = (url) => {
    Linking.openURL(url).catch(() => {});
  };

  const handleShouldStartLoad = useCallback((event) => {
    const { url } = event;
    if (!url) return true;

    if (url.startsWith('about:') || url.startsWith('blob:') || url.startsWith('data:')) {
      return true;
    }

    // Non-web schemes -> native apps
    if (!/^https?:\/\//i.test(url)) {
      openExternal(url);
      return false;
    }

    let host = '';
    try { host = new URL(url).host; } catch { return true; }

    // Stay inside the app for our own site (and dev server)
    if (host === SITE_HOST || host === 'localhost' || host.endsWith(`.${SITE_HOST}`)) {
      return true;
    }

    // Everything else opens in the system browser
    openExternal(url);
    return false;
  }, []);

  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data && data.type === 'nav') {
        setCurrentPath(data.path || '/');
        if (data.title && data.title.toLowerCase() !== 'axxspace') setPageTitle(data.title);
        if (typeof data.canGoBack === 'boolean') setCanGoBack(data.canGoBack);
      }
    } catch (e) {
      /* ignore malformed messages */
    }
  }, []);

  const headerTitle =
    pageTitle && pageTitle.trim() && pageTitle.toLowerCase() !== 'axxspace'
      ? pageTitle
      : 'Axxspace';

  const widthInterp = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} translucent={false} />

      <TopBar
        title={headerTitle}
        canGoBack={canGoBack && !splashVisible}
        loading={loading}
        onBack={() => webViewRef.current && webViewRef.current.goBack()}
        onRefresh={handleRefresh}
        onShare={handleShare}
      />

      {/* thin top progress bar during page loads */}
      {loading && !splashVisible ? (
        <View style={styles.progressTrack}>
          <Animated.View style={[styles.progressFill, { width: widthInterp }]} />
        </View>
      ) : null}

      <View style={styles.content}>
        {isOffline ? (
          <OfflineScreen onRetry={handleRetry} refreshing={retrying} />
        ) : webError ? (
          <View style={{ flex: 1 }}>
            <ErrorScreen
              message={webError}
              onRetry={handleRetry}
              onOpenBrowser={() => openExternal(TARGET_URL)}
            />
          </View>
        ) : (
          <WebView
            ref={webViewRef}
            source={{ uri: TARGET_URL }}
            style={styles.webView}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            geolocationEnabled={true}
            sharedCookiesEnabled={true}
            thirdPartyCookiesEnabled={true}
            cacheEnabled={true}
            allowFileAccess={false}
            allowUniversalAccessFromFileURLs={false}
            mixedContentMode="compatibility"
            startInLoadingState={false}
            setSupportMultipleWindows={false}
            javaScriptCanOpenWindowsAutomatically={true}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
            overScrollMode="never"
            pullToRefreshEnabled={false}
            injectedJavaScriptBeforeContentLoaded={INJECTED_JS}
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            onMessage={handleMessage}
            onNavigationStateChange={(nav) => {
              setCanGoBack(nav.canGoBack);
              if (nav.title) setPageTitle(nav.title);
              if (nav.url) {
                try {
                  const u = new URL(nav.url);
                  if (u.host === SITE_HOST) {
                    setCurrentPath(u.pathname + u.search);
                  }
                } catch (e) {}
              }
            }}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => {
              setLoading(false);
              setWebError(null);
              setHasLoadedOnce(true);
              // let the splash rest briefly so the first paint is ready underneath
              setTimeout(() => setSplashVisible(false), 250);
            }}
            onError={(syn) => {
              const { nativeEvent } = syn;
              setLoading(false);
              setSplashVisible(false);
              setWebError((nativeEvent && nativeEvent.description) || 'Failed to connect to Axxspace.');
            }}
            onRenderProcessGone={() => {
              setLoading(false);
              setWebError('The app was reset. Tap reload to continue.');
            }}
          />
        )}

        {showUpdate && updateInfo ? (
          <UpdateBanner
            info={updateInfo}
            onUpdate={() =>
              openExternal(updateInfo.downloadUrl || CONFIG.DEFAULT_APK_URL)
            }
            onDismiss={() => setShowUpdate(false)}
          />
        ) : null}

        <SplashOverlay
          visible={splashVisible}
          onDone={() => setHasLoadedOnce(true)}
        />
      </View>

      <Text style={styles.footerBrand} numberOfLines={1}>
        Powered by axxspace.com · updates automatically
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    backgroundColor: COLORS.background,
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  progressTrack: {
    height: 2,
    backgroundColor: 'rgba(251,191,36,0.12)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  footerBrand: {
    textAlign: 'center',
    color: COLORS.textDim,
    fontSize: 10,
    paddingBottom: 4,
    paddingTop: 2,
    backgroundColor: COLORS.surfaceAlt,
  },
});
