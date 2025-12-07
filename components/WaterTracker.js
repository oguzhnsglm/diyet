import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Polyline } from 'react-native-svg';

const STORAGE_KEY = '@water-tracker-v1';
const DEFAULT_GOAL = 2400; // ml (10 bardak x 240ml)
const GLASS_SIZE = 240; // ml (8 fl oz)
const MIN_GOAL = 500;
const MAX_GOAL = 6000;
const MAX_AMOUNT = 6000;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Bardak SVG İkonu
const GlassIcon = ({ filled, hasCheckmark }) => (
  <View style={styles.glassContainer}>
    <Svg width="28" height="32" viewBox="0 0 28 32">
      <Path
        d="M4 2 L24 2 L22 30 L6 30 Z"
        fill={filled ? '#3B82F6' : '#E0F2FE'}
        stroke="#3B82F6"
        strokeWidth="2"
      />
    </Svg>
    {hasCheckmark && (
      <View style={styles.checkmarkOverlay}>
        <Svg width="16" height="16" viewBox="0 0 24 24">
          <Polyline
            points="20 6 9 17 4 12"
            fill="none"
            stroke="#10B981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    )}
  </View>
);

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

  const addGlass = () => {
    add(GLASS_SIZE);
  };

  const progress = useMemo(() => {
    if (goal <= 0) return 0;
    return Math.min(100, Math.round((amount / goal) * 100));
  }, [amount, goal]);

  const glassCount = Math.floor(amount / GLASS_SIZE);
  const totalGlasses = Math.floor(goal / GLASS_SIZE);
  const currentFlOz = Math.round((amount / 29.5735) * 10) / 10;
  const goalFlOz = Math.round((goal / 29.5735) * 10) / 10;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Su Takibi</Text>
      
      <View style={styles.headerInfo}>
        <Text style={styles.smallText}>Su – Hedef: {goalFlOz} fl oz</Text>
      </View>

      <Text style={styles.bigValue}>{currentFlOz} fl oz</Text>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.glassesRow}
      >
        {[...Array(totalGlasses)].map((_, index) => (
          <GlassIcon 
            key={index} 
            filled={index < glassCount} 
            hasCheckmark={index === 4 && index < glassCount}
          />
        ))}
        <Pressable onPress={addGlass} style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </Pressable>
      </ScrollView>

      <Text style={styles.footerText}>+ Yemeklerden su: 0.0 fl oz</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 26,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 12,
  },
  headerInfo: {
    marginBottom: 8,
  },
  smallText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  bigValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 20,
  },
  glassesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  glassContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkOverlay: {
    position: 'absolute',
    top: 6,
    right: 2,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 2,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  addButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: '600',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 16,
  },
});

export default WaterTracker;
