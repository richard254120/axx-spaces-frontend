import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS } from '../constants/appTheme';

// Native app header. Gives the WebView a persistent app identity (wordmark +
// current page) and app-style actions instead of a browser URL bar.
export default function TopBar({
  title,
  canGoBack,
  loading,
  onBack,
  onRefresh,
  onShare,
}) {
  return (
    <View style={styles.bar}>
      {canGoBack ? (
        <TouchableOpacity style={styles.iconBtn} onPress={onBack} accessibilityLabel="Go back">
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.brand}>
          <View style={styles.brandDot} />
          <Text style={styles.brandText}>AXXSPACE</Text>
        </View>
      )}

      <Text style={styles.title} numberOfLines={1}>{title || 'Axxspace'}</Text>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.iconBtn} onPress={onRefresh} accessibilityLabel="Refresh">
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={styles.actionText}>⟳</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn} onPress={onShare} accessibilityLabel="Share">
          <Text style={styles.actionText}>↗</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    paddingHorizontal: 12,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  brand: { flexDirection: 'row', alignItems: 'center', minWidth: 92 },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    marginRight: 7,
  },
  brandText: {
    color: COLORS.text,
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.8,
  },
  title: {
    flex: 1,
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  actions: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { color: COLORS.primary, fontSize: 20, fontWeight: '700' },
  backChevron: { color: COLORS.primary, fontSize: 30, fontWeight: '700', marginTop: -6 },
});
