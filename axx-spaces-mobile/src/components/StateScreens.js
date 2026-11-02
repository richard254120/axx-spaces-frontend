import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { COLORS } from '../constants/appTheme';

function Pulse({ children }) {
  const v = new Animated.Value(0);
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: 900, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [v]);
  const scale = v.interpolate({ inputRange: [0, 1], outputRange: [1, 1.12] });
  return <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>;
}

// Friendly no-connection screen with a retry action.
export function OfflineScreen({ onRetry, refreshing }) {
  return (
    <View style={styles.center}>
      <View style={styles.card}>
        <Pulse>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>📡</Text>
          </View>
        </Pulse>
        <Text style={styles.title}>You&apos;re offline</Text>
        <Text style={styles.subtitle}>
          Axxspace needs a connection to load the latest listings and updates. Reconnect and try
          again.
        </Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={onRetry} disabled={refreshing}>
          <Text style={styles.primaryBtnText}>{refreshing ? 'Reconnecting…' : 'Try again'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Load/SSL/render failure screen with reload + open-in-browser fallbacks.
export function ErrorScreen({ message, onRetry, onOpenBrowser }) {
  return (
    <View style={styles.center}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>⚠️</Text>
        </View>
        <Text style={styles.title}>Couldn&apos;t load Axxspace</Text>
        <Text style={styles.subtitle}>{message || 'Something went wrong while loading.'}</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={onRetry}>
          <Text style={styles.primaryBtnText}>Reload</Text>
        </TouchableOpacity>
        {onOpenBrowser ? (
          <TouchableOpacity style={styles.secondaryBtn} onPress={onOpenBrowser}>
            <Text style={styles.secondaryBtnText}>Open in browser</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

// Native APK update banner (site content updates are automatic; this is only
// for the app shell itself).
export function UpdateBanner({ info, onUpdate, onDismiss }) {
  if (!info) return null;
  return (
    <View style={styles.banner}>
      <View style={styles.bannerText}>
        <Text style={styles.bannerTitle}>New version v{info.latestVersion}</Text>
        <Text style={styles.bannerDesc}>{info.releaseNotes || 'Tap to update the Axxspace app.'}</Text>
      </View>
      <TouchableOpacity style={styles.bannerBtn} onPress={onUpdate}>
        <Text style={styles.bannerBtnText}>Update</Text>
      </TouchableOpacity>
      {!info.forceUpdate ? (
        <TouchableOpacity style={styles.bannerClose} onPress={onDismiss}>
          <Text style={styles.bannerCloseText}>✕</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 22,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(251,191,36,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  icon: { fontSize: 34 },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 22 },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  primaryBtnText: { color: COLORS.background, fontWeight: '800', fontSize: 15 },
  secondaryBtn: {
    marginTop: 12,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  secondaryBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 14 },
  banner: {
    position: 'absolute',
    top: 66,
    left: 12,
    right: 12,
    zIndex: 60,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 10,
  },
  bannerText: { flex: 1, marginRight: 8 },
  bannerTitle: { color: COLORS.primary, fontWeight: '800', fontSize: 13, marginBottom: 2 },
  bannerDesc: { color: COLORS.textMuted, fontSize: 12, lineHeight: 16 },
  bannerBtn: { backgroundColor: COLORS.primary, paddingVertical: 7, paddingHorizontal: 14, borderRadius: 8 },
  bannerBtnText: { color: COLORS.background, fontWeight: '800', fontSize: 13 },
  bannerClose: { padding: 6, marginLeft: 4 },
  bannerCloseText: { color: COLORS.textMuted, fontSize: 15, fontWeight: '700' },
});
