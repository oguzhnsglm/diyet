import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';

const DEFAULT_GOAL = 74;

const WaterTrackerScreen = () => {
  const [water, setWater] = useState(72);

  const addCup = () => setWater(prev => Math.min(DEFAULT_GOAL, prev + 8));
  const removeCup = () => setWater(prev => Math.max(0, prev - 8));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Water Tracker</Text>
            <Text style={styles.goal}>Goal: {DEFAULT_GOAL} fl oz</Text>
          </View>
          <Text style={styles.amount}>{water} fl oz</Text>
          <View style={styles.cups}>
            {Array.from({ length: 8 }).map((_, index) => {
              const filled = index * 8 < water;
              return (
                <View
                  key={index}
                  style={[styles.cup, filled ? styles.cupFilled : styles.cupEmpty]}
                />
              );
            })}
            <Pressable style={[styles.cup, styles.cupAdd]} onPress={addCup}>
              <Text style={styles.cupAddText}>+</Text>
            </Pressable>
          </View>
          <View style={styles.actions}>
            <Pressable style={styles.actionButton} onPress={removeCup}>
              <Text style={styles.actionText}>- 1 Cup</Text>
            </Pressable>
            <Pressable style={[styles.actionButton, styles.primary]} onPress={addCup}>
              <Text style={[styles.actionText, styles.primaryText]}>+ 1 Cup</Text>
            </Pressable>
          </View>
          <Text style={styles.caption}>+ Water from food: 0.0 fl oz</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  content: {
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 20,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  goal: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  amount: {
    fontSize: 40,
    fontWeight: '700',
    color: '#0f172a',
    marginVertical: 16,
  },
  cups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 18,
  },
  cup: {
    width: 44,
    height: 60,
    borderRadius: 14,
    borderWidth: 2,
  },
  cupFilled: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  cupEmpty: {
    borderColor: '#bae6fd',
    backgroundColor: '#e0f2fe',
  },
  cupAdd: {
    borderColor: '#d4d4d8',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cupAddText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionText: {
    fontWeight: '600',
    color: '#111827',
  },
  primary: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  primaryText: {
    color: '#fff',
  },
  caption: {
    marginTop: 16,
    color: '#6b7280',
    fontSize: 13,
  },
});

export default WaterTrackerScreen;
