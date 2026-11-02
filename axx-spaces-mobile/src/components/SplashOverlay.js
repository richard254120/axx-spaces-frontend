import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated, Easing } from 'react-native';
import { COLORS } from '../constants/appTheme';

const LOGO = require('../../assets/images/icon.png');

// Branded full-screen splash shown natively while the first page loads, so the
// user sees an app opening (not a blank browser). Fades itself out on demand.
export default function SplashOverlay({ visible, onDone }) {
  const fade = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const bar = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 6 }),
      Animated.loop(
        Animated.timing(bar, {
          toValue: 1,
          duration: 1100,
          easing: Easing.linear,
          useNativeDriver: false,
        })
      ),
    ]).start();
  }, [scale, bar]);

  useEffect(() => {
    if (!visible) {
      Animated.timing(fade, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished && onDone) onDone();
      });
    }
  }, [visible, fade, onDone]);

  if (!visible && fade.__getValue() === 0) return null;

  const barWidth = bar.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '60%'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fade }]} pointerEvents={visible ? 'auto' : 'none'}>
      <Animated.View style={{ alignItems: 'center', transform: [{ scale }] }}>
        <View style={styles.logoWrap}>
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.title}>AXXSPACE</Text>
        <Text style={styles.subtitle}>Kenya&apos;s Premier Property &amp; Services Platform</Text>
      </Animated.View>

      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { width: barWidth }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    padding: 24,
  },
  logoWrap: {
    width: 108,
    height: 108,
    borderRadius: 26,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logo: { width: 78, height: 78 },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1.5,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
  barTrack: {
    position: 'absolute',
    bottom: 96,
    width: 160,
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(251,191,36,0.15)',
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
});
