import React from 'react';
import { SafeAreaView, ScrollView, Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const STATUS_COLORS = {
  good: '#22c55e',
  warn: '#f59e0b',
  alert: '#dc2626',
};

const SAMPLE_CHECKS = [
  {
    id: 'ketone',
    label: 'Keton Seviyesi',
    status: 'warn',
    value: '15 mg/dL',
    note: 'Bol su iç ve karbonhidratı hafifçe artırmayı düşün.',
  },
  {
    id: 'protein',
    label: 'Protein İzleri',
    status: 'good',
    value: 'Negatif',
    note: 'Böbrek yükün stabil görünüyor, aynen devam.',
  },
  {
    id: 'glucose',
    label: 'İdrarda Glukoz',
    status: 'alert',
    value: '250 mg/dL',
    note: 'Diyet planını gözden geçir ve endokrin ekibinle temas kur.',
  },
];

const GUIDES = [
  'İdrar striplerini aynı günün aynı saatinde oku.',
  'Ölçümlerini Libre ya da glukometre verinle eşleştir.',
  'Keton artışı gördüğünde su + elektrolit desteğini artır.',
  'Uzun süren protein ya da glukoz pozitifliği için uzmana danış.',
];

const UrineAnalysisScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#eef2ff', '#fdf4ff']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <Text style={styles.title}>İdrar Analizi</Text>
            <Text style={styles.subtitle}>
              Strip sonuçlarını kaydedip diyet planı ve insulin hassasiyetiyle eşle.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bugünkü Okumalar</Text>
            {SAMPLE_CHECKS.map((item) => (
              <View key={item.id} style={styles.readingCard}>
                <View>
                  <Text style={styles.readingLabel}>{item.label}</Text>
                  <Text style={[styles.readingValue, { color: STATUS_COLORS[item.status] }]}>
                    {item.value}
                  </Text>
                </View>
                <Text style={styles.readingNote}>{item.note}</Text>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Analiz İpuçları</Text>
            {GUIDES.map((guide) => (
              <View key={guide} style={styles.tipRow}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>{guide}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
    gap: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#4b5563',
    marginTop: 8,
    lineHeight: 20,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f3e8ff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#312e81',
    marginBottom: 12,
  },
  readingCard: {
    borderWidth: 1,
    borderColor: '#e0e7ff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#f8fafc',
  },
  readingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  readingValue: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },
  readingNote: {
    marginTop: 6,
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    marginRight: 8,
    color: '#a21caf',
    fontSize: 16,
    lineHeight: 20,
  },
  tipText: {
    flex: 1,
    color: '#1f2937',
    fontSize: 13,
    lineHeight: 18,
  },
});

export default UrineAnalysisScreen;
