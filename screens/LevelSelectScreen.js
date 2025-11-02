import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { usePractice } from '../context/PracticeContext';

const { width } = Dimensions.get('window');

export default function LevelSelectScreen() {
  const navigation = useNavigation();
  const { levels } = usePractice();

  return (
    <LinearGradient
      colors={['#f6f0ff', '#efe6ff', '#f7f5ff']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Text style={styles.header}>Konusma Yolculugu</Text>
      <Text style={styles.subtitle}>
        Bolumleri sirayla tamamla, kilitleri ac ve telaffuzunu guclendir.
      </Text>

      <View style={styles.grid}>
        {levels.map((level) => {
          const locked = !level.unlocked;
          const completed = level.completed;

          return (
            <Pressable
              key={level.id}
              onPress={() => {
                if (!locked) {
                  navigation.navigate('LevelDetail', { levelId: level.id });
                }
              }}
              style={({ pressed }) => [
                styles.cardShell,
                pressed && !locked ? styles.cardPressed : null,
              ]}
            >
              <LinearGradient
                colors={
                  completed
                    ? ['#74d39d', '#a7f0c4']
                    : locked
                    ? ['#c7b5ff', '#d9cbff']
                    : ['#7b69ff', '#b184ff']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.card}
              >
                <View style={styles.cardTop}>
                  <Text style={styles.levelNumber}>Bolum {level.id}</Text>
                  <Text style={styles.levelTitle}>{level.title}</Text>
                </View>
                <Text style={styles.levelDescription} numberOfLines={2}>
                  {level.description}
                </Text>
                <View style={styles.badgeRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{level.words.length} kelime</Text>
                  </View>
                  {completed ? (
                    <View style={[styles.badge, styles.successBadge]}>
                      <Text style={[styles.badgeText, styles.successBadgeText]}>Tamamlandi</Text>
                    </View>
                  ) : null}
                </View>
                {locked ? (
                  <View style={styles.lockOverlay}>
                    <Text style={styles.lockIcon}>LOCK</Text>
                    <Text style={styles.lockText}>Onceki bolumu tamamla</Text>
                  </View>
                ) : null}
              </LinearGradient>
            </Pressable>
          );
        })}
      </View>
    </LinearGradient>
  );
}

const CARD_WIDTH = width > 640 ? width / 2.5 - 24 : width / 2 - 20;

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#301854',
    letterSpacing: 0.6,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: '#4c3274',
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 28,
    gap: 16,
    justifyContent: 'center',
  },
  cardShell: {
    width: Math.max(220, Math.min(280, CARD_WIDTH)),
    borderRadius: 28,
    overflow: 'hidden',
    shadowColor: '#6a44df',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.92,
  },
  card: {
    paddingVertical: 22,
    paddingHorizontal: 18,
    minHeight: 170,
  },
  cardTop: {
    gap: 4,
  },
  levelNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    opacity: 0.9,
    letterSpacing: 0.5,
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  levelDescription: {
    marginTop: 12,
    fontSize: 14,
    color: '#f6f0ff',
    opacity: 0.95,
  },
  badgeRow: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 10,
  },
  badge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  badgeText: {
    color: '#ffffff',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  successBadge: {
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  successBadgeText: {
    color: '#2e8b57',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(47, 27, 84, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockIcon: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f4e9ff',
    marginBottom: 6,
  },
  lockText: {
    color: '#f4e9ff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 12,
  },
});

