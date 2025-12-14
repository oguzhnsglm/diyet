import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';

const LATEST_GLUCOSE_STATS_KEY = 'latest_glucose_stats';

// Basit A1C tahmin fonksiyonu
function estimateA1C(avgGlucose) {
  if (!avgGlucose || isNaN(avgGlucose)) {
    return { min: 5.5, max: 6.0 };
  }
  const est = (avgGlucose + 46.7) / 28.7; // yaklaşık formül
  const min = Math.max(4.5, Number((est - 0.3).toFixed(1)));
  const max = Number((est + 0.3).toFixed(1));
  return { min, max };
}

// Glikoz dalgalanma endeksi (GDE) – standart sapma tabanlı basit skor
function calculateGDE(values) {
  if (!values || values.length < 2) return 10;
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  const variance =
    values.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / values.length;
  const sd = Math.sqrt(variance);
  let score = Math.min(100, Math.round(sd * 1.5));
  if (isNaN(score)) score = 10;
  return score;
}

export default function BloodSugarScreen() {
  const { isDarkMode, colors } = useTheme();
  const [fastingInput, setFastingInput] = useState('');
  const [postMealInput, setPostMealInput] = useState('');
  const [otherInput, setOtherInput] = useState('');

  // ölçüm listesi: {id, type, value, time}
  const [measurements, setMeasurements] = useState([]);

  const addMeasurement = (type, valueStr) => {
    const value = Number(valueStr.replace(',', '.'));
    if (!value || isNaN(value)) return;
    const entry = {
      id: Date.now().toString(),
      type, // 'fasting' | 'postMeal' | 'other'
      value,
      time: new Date(),
    };
    setMeasurements(prev => [entry, ...prev]);

    if (type === 'fasting') setFastingInput('');
    if (type === 'postMeal') setPostMealInput('');
    if (type === 'other') setOtherInput('');
  };

  // Özet hesaplamalar
  const stats = useMemo(() => {
    if (measurements.length === 0) {
      return {
        avg: null,
        fasting: null,
        postMeal: null,
        gde: 10,
        a1c: { min: 5.5, max: 6.0 },
      };
    }
    const values = measurements.map(m => m.value);
    const avg = values.reduce((s, v) => s + v, 0) / values.length;

    const fastingValues = measurements
      .filter(m => m.type === 'fasting')
      .map(m => m.value);
    const postValues = measurements
      .filter(m => m.type === 'postMeal')
      .map(m => m.value);

    const fastingAvg =
      fastingValues.length > 0
        ? fastingValues.reduce((s, v) => s + v, 0) / fastingValues.length
        : null;
    const postAvg =
      postValues.length > 0
        ? postValues.reduce((s, v) => s + v, 0) / postValues.length
        : null;

    const gde = calculateGDE(values);
    const a1c = estimateA1C(avg);

    return {
      avg,
      fasting: fastingAvg,
      postMeal: postAvg,
      gde,
      a1c,
    };
  }, [measurements]);

  useEffect(() => {
    const persistLatestStats = async () => {
      try {
        if (measurements.length === 0) {
          await AsyncStorage.removeItem(LATEST_GLUCOSE_STATS_KEY);
          return;
        }

        const latest = measurements[0];
        const payload = {
          lastValue: latest.value,
          timeISO: latest.time.toISOString(),
          a1cRange: stats.a1c,
        };
        await AsyncStorage.setItem(
          LATEST_GLUCOSE_STATS_KEY,
          JSON.stringify(payload)
        );
      } catch (error) {
        console.warn('Glucose stats persist failed', error);
      }
    };

    persistLatestStats();
  }, [measurements, stats.a1c]);

  const riskLabel =
    stats.gde < 30 ? 'Düşük' : stats.gde < 60 ? 'Orta' : 'Yüksek';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      <Text style={[styles.title, { color: colors.text }]}>Kan Şekeri</Text>

      {/* ANA DAIRE GRAFIK - Ortalama */}
      <View style={[styles.mainCircleCard, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.bigCircle}>
          <Text style={[styles.bigCircleValue, { color: colors.text }]}>
            {stats.avg ? stats.avg.toFixed(0) : '--'}
          </Text>
          <Text style={[styles.bigCircleUnit, { color: colors.secondaryText }]}>mg/dL</Text>
          <Text style={[styles.bigCircleLabel, { color: colors.secondaryText }]}>Ortalama</Text>
        </View>
      </View>

      {/* STATS GRID */}
      <View style={styles.statsGrid}>
        <View style={[styles.statBox, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.statBoxValue, { color: colors.text }]}>
            {stats.fasting ? stats.fasting.toFixed(0) : '-'}
          </Text>
          <Text style={[styles.statBoxLabel, { color: colors.secondaryText }]}>Açlık</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxValue}>
            {stats.postMeal ? stats.postMeal.toFixed(0) : '-'}
          </Text>
          <Text style={styles.statBoxLabel}>Tokluk</Text>
        </View>
      </View>

      {/* A1C & GDE GRID */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statBoxValue}>
            {stats.a1c.min}–{stats.a1c.max}%
          </Text>
          <Text style={styles.statBoxLabel}>Tahmini A1C</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxValue}>{stats.gde}</Text>
          <Text style={styles.statBoxLabel}>GDE · {riskLabel}</Text>
        </View>
      </View>

      {/* ÖLÇÜM EKLEME ALANI */}
      <Text style={styles.sectionTitle}>Ölçüm Ekle</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>🌅 Açlık</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="95"
            value={fastingInput}
            onChangeText={setFastingInput}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addMeasurement('fasting', fastingInput)}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>🍽️ Tokluk</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="145"
            value={postMealInput}
            onChangeText={setPostMealInput}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addMeasurement('postMeal', postMealInput)}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>📊 Diğer</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="180"
            value={otherInput}
            onChangeText={setOtherInput}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addMeasurement('other', otherInput)}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* LİSTE */}
      <Text style={styles.sectionTitle}>Son Ölçümler</Text>
      {measurements.length === 0 ? (
        <Text style={styles.emptyText}>Henüz ölçüm yok</Text>
      ) : (
        measurements.map(m => (
          <View key={m.id} style={styles.measureItem}>
            <View>
              <Text style={styles.measureValue}>{m.value} mg/dL</Text>
              <Text style={styles.measureType}>
                {m.type === 'fasting' ? '🌅 Açlık' : m.type === 'postMeal' ? '🍽️ Tokluk' : '📊 Diğer'}
              </Text>
            </View>
            <Text style={styles.measureTime}>
              {m.time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
    padding: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 32,
    letterSpacing: -0.5,
  },
  mainCircleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 40,
    marginBottom: 24,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    alignItems: 'center',
  },
  bigCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#F8FAFC',
    borderWidth: 16,
    borderColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  bigCircleValue: {
    fontSize: 68,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 68,
    letterSpacing: -1.5,
  },
  bigCircleUnit: {
    fontSize: 20,
    fontWeight: '700',
    color: '#64748B',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  bigCircleLabel: {
    fontSize: 14,
    color: '#94A3B8',
    marginTop: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  statBoxValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  statBoxLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 24,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 10,
    letterSpacing: -0.1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    fontSize: 17,
    color: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  addButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    width: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  emptyText: {
    fontSize: 15,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 24,
    fontWeight: '500',
  },
  measureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  measureValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  measureType: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  measureTime: {
    fontSize: 15,
    color: '#94A3B8',
    fontWeight: '600',
  },
});
