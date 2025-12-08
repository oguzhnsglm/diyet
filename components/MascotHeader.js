import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function MascotHeader({ onBack, showBack = false, theme = 'dark', onToggleTheme }) {
  const isDark = theme === 'dark';
  const bgColors = isDark
    ? ['rgba(15,23,42,0.9)', 'rgba(15,23,42,0.6)']
    : ['rgba(248,250,252,0.95)', 'rgba(226,232,240,0.9)'];

  return (
    <View style={styles.safeHeader}>
      <LinearGradient colors={bgColors} style={styles.headerCard}>
        <View style={styles.rowTop}>
          <View style={styles.leftControls}>
            {showBack ? (
              <Pressable style={styles.iconButton} onPress={onBack} hitSlop={12}>
                <Text style={[styles.iconText, isDark ? styles.iconTextDark : styles.iconTextLight]}>←</Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.rightControls}>
            {onToggleTheme ? (
              <Pressable style={styles.iconButton} onPress={onToggleTheme} hitSlop={12}>
                <Text style={[styles.iconText, isDark ? styles.iconTextDark : styles.iconTextLight]}>
                  {isDark ? '🌞' : '🌙'}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={styles.rowBottom}>
          <View style={styles.mascotBubble}>
            <Text style={styles.mascotEmoji}>🫑</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.mascotTitle}>Merhaba, ben Nutri!</Text>
              <Text style={styles.mascotSubtitle}>Bugün de iyi gidiyorsun! Böyle devam et. 💚</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  safeHeader: {
    paddingHorizontal: 20,
    paddingTop: 4,
    marginBottom: 8,
  },
  headerCard: {
    borderRadius: 28,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 10,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  leftControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.12)',
  },
  iconText: {
    fontSize: 16,
    fontWeight: '600',
  },
  iconTextDark: {
    color: '#E5F2FF',
  },
  iconTextLight: {
    color: '#0F172A',
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mascotBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mascotEmoji: {
    fontSize: 36,
  },
  mascotTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E5F2FF',
    marginBottom: 2,
  },
  mascotSubtitle: {
    fontSize: 13,
    color: '#C7D2FE',
  },
});
