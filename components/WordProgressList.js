import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const STATUS_INDICATOR = {
  success: { color: '#2e8b57', label: '+' },
  fail: { color: '#d0455b', label: '-' },
  pending: { color: '#7857d8', label: 'o' },
};

export default function WordProgressList({ progress, currentIndex, style }) {
  const itemCount = progress.length || 0;
  const computedCurrent = itemCount > 0 ? currentIndex % itemCount : 0;

  return (
    <LinearGradient
      colors={['rgba(122, 94, 230, 0.35)', 'rgba(191, 155, 255, 0.25)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.wrapper, style]}
    >
      <Text style={styles.title}>Kelime Yolculugu</Text>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {progress.map((item, index) => {
          const status = item.status ?? 'pending';
          const isCurrent = index === computedCurrent;
          const indicator = STATUS_INDICATOR[status] ?? STATUS_INDICATOR.pending;

          return (
            <View
              key={`${item.word}-${index}`}
              style={[
                styles.wordItem,
                status === 'success' && styles.wordSuccess,
                status === 'fail' && styles.wordFail,
                status === 'pending' && styles.wordPending,
                isCurrent && styles.wordActive,
              ]}
            >
              <View
                style={[
                  styles.indicator,
                  { backgroundColor: indicator.color },
                  isCurrent && styles.indicatorActive,
                ]}
              >
                <Text style={styles.indicatorLabel}>{indicator.label}</Text>
              </View>
              <Text style={[styles.wordLabel, isCurrent && styles.wordLabelActive]}>
                {item.word}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 28,
    paddingVertical: 26,
    paddingHorizontal: 20,
    shadowColor: '#5a33d6',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    width: '100%',
    maxHeight: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2f1b4e',
    marginBottom: 18,
    letterSpacing: 0.4,
  },
  scrollContent: {
    gap: 12,
    paddingBottom: 8,
  },
  wordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    gap: 12,
  },
  wordPending: {
    borderColor: 'rgba(142, 118, 222, 0.35)',
  },
  wordSuccess: {
    borderColor: 'rgba(44, 162, 95, 0.4)',
    backgroundColor: 'rgba(76, 175, 119, 0.15)',
  },
  wordFail: {
    borderColor: 'rgba(214, 71, 97, 0.4)',
    backgroundColor: 'rgba(214, 71, 135, 0.15)',
  },
  wordActive: {
    borderWidth: 2,
    borderColor: '#6c63ff',
    transform: [{ scale: 1.02 }],
    shadowColor: '#6c63ff',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  indicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7857d8',
  },
  indicatorActive: {
    shadowColor: '#6c63ff',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  indicatorLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  wordLabel: {
    fontSize: 18,
    color: '#362153',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  wordLabelActive: {
    color: '#2b0b73',
    fontWeight: '700',
  },
});

