import React, { useMemo } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView } from 'react-native';

const LibreStatsScreen = () => {
  const dailyTrends = useMemo(
    () => [
      { id: 'mon', label: 'Mon', avg: 108, min: 85, max: 132 },
      { id: 'tue', label: 'Tue', avg: 112, min: 92, max: 145 },
      { id: 'wed', label: 'Wed', avg: 106, min: 88, max: 131 },
      { id: 'thu', label: 'Thu', avg: 118, min: 96, max: 154 },
      { id: 'fri', label: 'Fri', avg: 111, min: 90, max: 140 },
      { id: 'sat', label: 'Sat', avg: 115, min: 94, max: 150 },
      { id: 'sun', label: 'Sun', avg: 104, min: 82, max: 126 },
    ],
    []
  );

  const metrics = useMemo(
    () => [
      { label: 'Time in range', value: '82%' },
      { label: 'Avg glucose', value: '109 mg/dL' },
      { label: 'Low events', value: '1 / week' },
      { label: 'High events', value: '2 / week' },
    ],
    []
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>FreeStyle Libre</Text>
            <Text style={styles.subtitle}>Last sync 10 mins ago</Text>
          </View>
          <View style={styles.metricRow}>
            {metrics.map(item => (
              <View key={item.label} style={styles.metricBox}>
                <Text style={styles.metricLabel}>{item.label}</Text>
                <Text style={styles.metricValue}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Daily trend</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.cell, styles.cellHeader]}>Day</Text>
            <Text style={[styles.cell, styles.cellHeader]}>Avg</Text>
            <Text style={[styles.cell, styles.cellHeader]}>Min</Text>
            <Text style={[styles.cell, styles.cellHeader]}>Max</Text>
          </View>
          {dailyTrends.map(row => (
            <View key={row.id} style={styles.tableRow}>
              <Text style={styles.cell}>{row.label}</Text>
              <Text style={styles.cell}>{row.avg} mg/dL</Text>
              <Text style={styles.cell}>{row.min} mg/dL</Text>
              <Text style={styles.cell}>{row.max} mg/dL</Text>
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
    gap: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 20,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricBox: {
    flex: 1,
    minWidth: '45%',
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    padding: 14,
  },
  metricLabel: {
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111827',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    padding: 12,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  cell: {
    flex: 1,
    fontWeight: '600',
    color: '#111827',
  },
  cellHeader: {
    color: '#94a3b8',
    textTransform: 'uppercase',
    fontSize: 12,
  },
});

export default LibreStatsScreen;
