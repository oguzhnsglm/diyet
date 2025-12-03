import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';

const workouts = [
  { id: 'walk', title: 'Morning Walk', calories: 120, duration: '30 min' },
  { id: 'yoga', title: 'Gentle Yoga', calories: 95, duration: '25 min' },
  { id: 'cycle', title: 'Indoor Cycling', calories: 210, duration: '40 min' },
];

const ActivitiesScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Activities</Text>
            <Text style={styles.subtitle}>Automatic Tracking</Text>
          </View>
          <Pressable style={styles.connectButton}>
            <Text style={styles.connectText}>Connect tracker</Text>
          </Pressable>
          <Pressable>
            <Text style={styles.link}>Track steps manually</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Today</Text>
          {workouts.map(item => (
            <View key={item.id} style={styles.workoutRow}>
              <View>
                <Text style={styles.workoutTitle}>{item.title}</Text>
                <Text style={styles.workoutMeta}>{item.duration} • {item.calories} Cal</Text>
              </View>
              <Pressable style={styles.addButton}>
                <Text style={styles.addText}>Add</Text>
              </Pressable>
            </View>
          ))}
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
    gap: 18,
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
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontWeight: '600',
    color: '#94a3b8',
  },
  connectButton: {
    backgroundColor: '#0f172a',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  connectText: {
    color: '#fff',
    fontWeight: '700',
  },
  link: {
    color: '#0ea5e9',
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  workoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  workoutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  workoutMeta: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: '#f4f4f5',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  addText: {
    fontWeight: '600',
    color: '#111827',
  },
});

export default ActivitiesScreen;
