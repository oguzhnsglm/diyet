import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@water-tracker-v1';
const DEFAULT_GOAL = 2000; // ml
const MIN_GOAL = 500;
const MAX_GOAL = 6000;
const MAX_AMOUNT = 6000;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const WaterTracker = () => {
  const [goal, setGoal] = useState(DEFAULT_GOAL);
  const [amount, setAmount] = useState(0);
  const [goalText, setGoalText] = useState(String(DEFAULT_GOAL));

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (mounted) {
            if (typeof parsed.amount === 'number' && parsed.amount >= 0) {
              setAmount(clamp(parsed.amount, 0, MAX_AMOUNT));
            }
            if (typeof parsed.goal === 'number') {
              const safeGoal = clamp(parsed.goal, MIN_GOAL, MAX_GOAL);
              setGoal(safeGoal);
              setGoalText(String(safeGoal));
            }
          }
        }
      } catch (error) {
        console.error('Su takibi verisi yüklenemedi', error);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setGoalText(String(goal));
  }, [goal]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ goal, amount })).catch((error) =>
      console.error('Su takibi verisi kaydedilemedi', error)
    );
  }, [goal, amount]);

  const add = (ml) => {
    setAmount((prev) => clamp(prev + ml, 0, MAX_AMOUNT));
  };

  const remove = (ml) => {
    setAmount((prev) => clamp(prev - ml, 0, MAX_AMOUNT));
  };

  const reset = () => {
    setAmount(0);
  };

  const progress = useMemo(() => {
    if (goal <= 0) return 0;
    return Math.min(100, Math.round((amount / goal) * 100));
  }, [amount, goal]);

  const remaining = Math.max(goal - amount, 0);

  const handleGoalChange = (text) => {
    setGoalText(text);
    if (!text) {
      return;
    }
    const parsed = Number(text.replace(/[^0-9]/g, ''));
    if (!Number.isNaN(parsed) && parsed > 0) {
      const nextGoal = clamp(parsed, MIN_GOAL, MAX_GOAL);
      if (nextGoal !== goal) {
        setGoal(nextGoal);
      }
    }
  };

  return (
    <View style={styles.section}>
      <Text style={styles.title}>💧 Su Takipçisi</Text>
      <Text style={styles.subtitle}>Günlük hedef: {goal} ml</Text>

      <View style={styles.card}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Toplam: <Text style={styles.progressStrong}>{amount} ml</Text></Text>
          <Text style={styles.progressLabel}>Hedef: {goal} ml</Text>
        </View>

        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.percent}>{progress}%</Text>
        <Text style={styles.remaining}>
          {remaining > 0
            ? `Hedefe ulaşmak için ${remaining} ml daha içmelisin`
            : 'Harika! Günlük su hedefini tamamladın 💚'}
        </Text>

        <View style={styles.buttonRow}>
          <Pressable style={[styles.button, styles.primaryButton]} onPress={() => add(250)}>
            <Text style={styles.buttonTextPrimary}>+ 1 bardak (250 ml)</Text>
          </Pressable>
          <Pressable style={styles.button} onPress={() => add(125)}>
            <Text style={styles.buttonText}>+ ½ bardak (125 ml)</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.ghostButton]} onPress={() => remove(250)}>
            <Text style={styles.buttonGhostText}>− 1 bardak</Text>
          </Pressable>
          <Pressable style={[styles.button, styles.ghostButton]} onPress={reset}>
            <Text style={styles.buttonGhostText}>Sıfırla</Text>
          </Pressable>
        </View>

        <View style={styles.goalRow}>
          <Text style={styles.goalLabel}>Günlük hedef (ml):</Text>
          <TextInput
            keyboardType="number-pad"
            value={goalText}
            onChangeText={handleGoalChange}
            style={styles.goalInput}
            maxLength={4}
          />
          <Text style={styles.goalHint}>Örn: 2000 ml ≈ 8 bardak</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#ecfeff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 13,
    color: '#0f172a',
  },
  progressStrong: {
    fontWeight: '700',
  },
  progressBarBackground: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#0ea5e9',
  },
  percent: {
    marginTop: 6,
    fontSize: 12,
    color: '#0f766e',
    fontWeight: '600',
  },
  remaining: {
    marginTop: 4,
    fontSize: 12,
    color: '#4b5563',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  button: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#e0f2fe',
  },
  primaryButton: {
    backgroundColor: '#0ea5e9',
  },
  buttonTextPrimary: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  buttonText: {
    color: '#0369a1',
    fontSize: 12,
    fontWeight: '500',
  },
  ghostButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5f5',
  },
  buttonGhostText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '500',
  },
  goalRow: {
    marginTop: 16,
  },
  goalLabel: {
    fontSize: 12,
    color: '#334155',
    marginBottom: 6,
  },
  goalInput: {
    width: 100,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    fontSize: 13,
    marginBottom: 4,
  },
  goalHint: {
    fontSize: 11,
    color: '#64748b',
  },
});

export default WaterTracker;
