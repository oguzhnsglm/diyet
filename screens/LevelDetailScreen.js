import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRoute } from '@react-navigation/native';
import { usePractice } from '../context/PracticeContext';
import WordProgressList from '../components/WordProgressList';

export default function LevelDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { levelId = 1 } = route.params ?? {};
  const { levels } = usePractice();

  const level = levels.find((item) => item.id === levelId) ?? levels[0];

  const progressData = useMemo(
    () =>
      level.words.map((word, index) => ({
        word,
        status: level.progress[index] ?? 'pending',
      })),
    [level],
  );

  return (
    <LinearGradient
      colors={['#f6f0ff', '#efe6ff', '#f7f5ff']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.levelNumber}>Bolum {level.id}</Text>
          <Text style={styles.title}>{level.title}</Text>
          <Text style={styles.subtitle}>{level.description}</Text>
        </View>
        <Pressable onPress={() => navigation.navigate('Levels')}>
          <Text style={styles.backLink}>Bolumlere don</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <WordProgressList progress={progressData} currentIndex={0} style={styles.list} />

        <Pressable
          onPress={() => navigation.navigate('Practice', { levelId: level.id })}
          style={({ pressed }) => [styles.buttonShell, pressed && styles.buttonPressed]}
        >
          <LinearGradient
            colors={['#7059ff', '#ae7bff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.button}
          >
            <Text style={styles.buttonLabel}>
              {level.completed ? 'Bolumu Yeniden Calistir' : 'Pratige Basla'}
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  levelNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5c3cd6',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#2f184f',
    letterSpacing: 0.7,
    marginTop: 4,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: '#4d3274',
    lineHeight: 22,
    maxWidth: 360,
  },
  backLink: {
    color: '#5c3cd6',
    fontWeight: '600',
  },
  content: {
    marginTop: 36,
    gap: 24,
    alignItems: 'center',
  },
  list: {
    width: '100%',
    maxWidth: 360,
  },
  buttonShell: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    overflow: 'hidden',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 20,
    shadowColor: '#6146d6',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.92,
  },
});

