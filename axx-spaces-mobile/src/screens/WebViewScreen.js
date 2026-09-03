import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  BackHandler,
  SafeAreaView,
  StatusBar,
  Platform,
  RefreshControl,
  ScrollView,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import NetInfo from '@react-native-community/netinfo';
import CONFIG from '../config';

const TARGET_URL = CONFIG.WEBSITE_URL || 'https://axxspace.com';
const CHROME_USER_AGENT =
  'Mozilla/5.0 (Linux; Android 13; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';

export default function WebViewScreen() {
  const webViewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [webError, setWebError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Monitor network connectivity status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected === false) {
        setIsOffline(true);
      } else if (state.isConnected === true && isOffline) {
        setIsOffline(false);
      }
    });

    return () => unsubscribe();
  }, [isOffline]);

  // Handle Android hardware back button
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true; // prevent default back behavior
      }
      return false; // allow default app exit/back behavior
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [canGoBack]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setWebError(null);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleRetry = () => {
    setIsOffline(false);
    setWebError(null);
    setIsLoading(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const handleOpenBrowser = () => {
    Linking.openURL(TARGET_URL).catch((err) => console.log('Error launching browser:', err));
  };

  const handleShouldStartLoad = (event) => {
    const { url } = event;
    if (!url) return true;

    // Allow blob/data URLs for canvas exports, posters, and dynamic media
    if (url.startsWith('blob:') || url.startsWith('data:')) {
      return true;
    }

    // Allow standard HTTP/HTTPS web links in WebView
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('about:')) {
      return true;
    }

    // External protocols like tel:, mailto:, whatsapp:, etc. open in external system apps
    try {
      Linking.canOpenURL(url)
        .then((supported) => {
          if (supported) {
            Linking.openURL(url);
          } else {
            Linking.openURL(url).catch(() => {});
          }
        })
        .catch((err) => console.log('Error opening external link:', err));
    } catch (e) {
      console.log('Error checking external URL:', e);
    }
    return false;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f1729" translucent={false} />

      {isOffline ? (
        <ScrollView
          contentContainerStyle={styles.offlineContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#fbbf24"
              colors={['#fbbf24']}
            />
          }
        >
          <View style={styles.offlineCard}>
            <View style={styles.iconCircle}>
              <Text style={styles.wifiIcon}>📶</Text>
            </View>
            <Text style={styles.offlineTitle}>No Internet Connection</Text>
            <Text style={styles.offlineSubtitle}>
              Please check your mobile data or Wi-Fi connection and tap retry to open Axxspace.
            </Text>
            <TouchableOpacity style={styles.retryButton} activeOpacity={0.8} onPress={handleRetry}>
              <Text style={styles.retryText}>Retry Connection</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.webViewWrapper}>
          <WebView
            ref={webViewRef}
            source={{ uri: TARGET_URL }}
            style={styles.webView}
            userAgent={CHROME_USER_AGENT}
            originWhitelist={['*']}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowFileAccess={false}
            allowUniversalAccessFromFileURLs={false}
            javaScriptCanOpenWindowsAutomatically={true}
            startInLoadingState={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            mixedContentMode="always"
            thirdPartyCookiesEnabled={true}
            sharedCookiesEnabled={true}
            allowsBackForwardNavigationGestures={true}
            setSupportMultipleWindows={false}
            androidLayerType="hardware"
            onShouldStartLoadWithRequest={handleShouldStartLoad}
            onNavigationStateChange={(navState) => {
              setCanGoBack(navState.canGoBack);
            }}
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => {
              setIsLoading(false);
              setWebError(null);
            }}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView load error: ', nativeEvent);
              setWebError(nativeEvent.description || 'Failed to connect to Axxspace website.');
            }}
            onRenderProcessGone={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView render process killed: ', nativeEvent);
              setIsLoading(false);
              setWebError('WebView system process reset. Tap Reload to restore.');
            }}
            onReceivedSslError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              console.warn('WebView SSL notice: ', nativeEvent);
            }}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#fbbf24" />
                <Text style={styles.loadingText}>Loading Axxspace...</Text>
              </View>
            )}
          />

          {webError && (
            <View style={styles.errorOverlay}>
              <Text style={styles.errorTitle}>Unable to load Axxspace</Text>
              <Text style={styles.errorSubtitle}>{webError}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                <Text style={styles.retryText}>Reload Page</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.retryButton, { marginTop: 12, backgroundColor: 'transparent', borderWidth: 1, borderColor: '#fbbf24' }]}
                onPress={handleOpenBrowser}
              >
                <Text style={[styles.retryText, { color: '#fbbf24' }]}>Open in Browser</Text>
              </TouchableOpacity>
            </View>
          )}

          {isLoading && !webError && (
            <View style={styles.topProgressBar}>
              <ActivityIndicator size="small" color="#fbbf24" />
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1729',
  },
  webViewWrapper: {
    flex: 1,
    backgroundColor: '#0f1729',
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: '#0f1729',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0f1729',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    marginTop: 14,
    color: '#94a3b8',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  topProgressBar: {
    position: 'absolute',
    top: 10,
    right: 15,
    zIndex: 20,
    backgroundColor: 'rgba(15, 23, 41, 0.8)',
    borderRadius: 20,
    padding: 6,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0f1729',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    zIndex: 30,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
  },
  offlineContainer: {
    flexGrow: 1,
    backgroundColor: '#0f1729',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  offlineCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  wifiIcon: {
    fontSize: 32,
  },
  offlineTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 10,
    textAlign: 'center',
  },
  offlineSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#fbbf24',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  retryText: {
    color: '#0f1729',
    fontWeight: '700',
    fontSize: 15,
  },
});
