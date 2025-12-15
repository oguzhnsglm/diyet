import React, { useMemo } from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import BottomNavBar from '../components/BottomNavBar';
import BackButton from '../components/BackButton';

const LibreStatsScreen = ({ navigation }) => {
  const { isDarkMode, colors } = useTheme();
  const dailyTrends = useMemo(
    () => [
      { id: 'mon', label: 'Pzt', avg: 108, min: 85, max: 132 },
      { id: 'tue', label: 'Sal', avg: 112, min: 92, max: 145 },
      { id: 'wed', label: 'Çar', avg: 106, min: 88, max: 131 },
      { id: 'thu', label: 'Per', avg: 118, min: 96, max: 154 },
      { id: 'fri', label: 'Cum', avg: 111, min: 90, max: 140 },
      { id: 'sat', label: 'Cmt', avg: 115, min: 94, max: 150 },
      { id: 'sun', label: 'Paz', avg: 104, min: 82, max: 126 },
    ],
    []
  );

  const metrics = useMemo(
    () => [
      { label: 'Hedef aralıkta', value: '82%' },
      { label: 'Ort. glukoz', value: '109 mg/dL' },
      { label: 'Düşük olaylar', value: '1 / hafta' },
      { label: 'Yüksek olaylar', value: '2 / hafta' },
    ],
    []
  );

  // Dynamic styles - useMemo ile cache'leniyor
  const dynamicStyles = useMemo(() => ({
    metricBox: { backgroundColor: isDarkMode ? '#2C2C2E' : '#f1f5f9' },
    tableHeader: { backgroundColor: isDarkMode ? '#2C2C2E' : '#f1f5f9' },
    tableRow: { borderColor: isDarkMode ? '#3A3A3C' : '#f1f5f9' },
  }), [isDarkMode]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <BackButton navigation={navigation} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.text }]}>FreeStyle Libre</Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>Son senkronizasyon: 10 dk önce</Text>
          </View>
          <View style={styles.metricRow}>
            {metrics.map(item => (
              <View key={item.label} style={[styles.metricBox, dynamicStyles.metricBox]}>
                <Text style={[styles.metricLabel, { color: colors.secondaryText }]}>{item.label}</Text>
                <Text style={[styles.metricValue, { color: colors.text }]}>{item.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Günlük Trend</Text>
          <View style={[styles.tableHeader, dynamicStyles.tableHeader]}>
            <Text style={[styles.cell, styles.cellHeader, { color: colors.text }]}>Gün</Text>
            <Text style={[styles.cell, styles.cellHeader, { color: colors.text }]}>Ort.</Text>
            <Text style={[styles.cell, styles.cellHeader, { color: colors.text }]}>Min</Text>
            <Text style={[styles.cell, styles.cellHeader, { color: colors.text }]}>Maks</Text>
          </View>
          {dailyTrends.map(row => (
            <View key={row.id} style={[styles.tableRow, dynamicStyles.tableRow]}>
              <Text style={[styles.cell, { color: colors.text }]}>{row.label}</Text>
              <Text style={[styles.cell, { color: colors.text }]}>{row.avg} mg/dL</Text>
              <Text style={[styles.cell, { color: colors.text }]}>{row.min} mg/dL</Text>
              <Text style={[styles.cell, { color: colors.text }]}>{row.max} mg/dL</Text>
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

function LibreStatsScreenWithNav({ navigation }) {
  return (
    <>
      <LibreStatsScreen navigation={navigation} />
      <BottomNavBar navigation={navigation} activeKey="Diary" />
    </>
  );
}

export default LibreStatsScreenWithNav;
