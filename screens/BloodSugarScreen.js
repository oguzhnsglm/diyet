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
    stats.gde < 30 ? 'Stabil' : stats.gde < 60 ? 'Orta dalgalanma' : 'Yüksek dalgalanma';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <Text style={styles.title}>Kan Şekeri Takibi</Text>
      <Text style={styles.subtitle}>
        Gün boyunca yaptığın ölçümleri kaydet, tahmini A1C ve dalgalanma durumunu gör.
      </Text>

      {/* ÖZET KARTLAR */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Ortalama</Text>
          <Text style={styles.summaryValue}>
            {stats.avg ? `${stats.avg.toFixed(0)} mg/dL` : '-'}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Açlık Ort.</Text>
          <Text style={styles.summaryValue}>
            {stats.fasting ? `${stats.fasting.toFixed(0)} mg/dL` : '-'}
          </Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Tokluk Ort.</Text>
          <Text style={styles.summaryValue}>
            {stats.postMeal ? `${stats.postMeal.toFixed(0)} mg/dL` : '-'}
          </Text>
        </View>
      </View>

      {/* A1C & GDE */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Tahmini A1C Aralığı</Text>
        <Text style={styles.a1cValue}>
          {stats.a1c.min}% – {stats.a1c.max}%
        </Text>
        <Text style={styles.cardText}>
          Bu değer son ölçümlerin ortalamasına göre matematiksel bir tahmindir, gerçek
          laboratuvar sonucunun yerini tutmaz.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>GDE Skoru (Glikoz Dalgalanma Endeksi)</Text>
        <Text style={styles.gdeValue}>{stats.gde}</Text>
        <Text style={styles.gdeLabel}>{riskLabel}</Text>
        <Text style={styles.cardText}>
          GDE, kan şekerinin gün içindeki oynaklığını gösterir. Daha düşük skorlar genelde
          daha stabil seyri ifade eder.
        </Text>
      </View>

      {/* ÖLÇÜM EKLEME ALANI */}
      <Text style={styles.sectionTitle}>Yeni Ölçüm Ekle</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Açlık (mg/dL)</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Örn: 95"
            value={fastingInput}
            onChangeText={setFastingInput}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addMeasurement('fasting', fastingInput)}
          >
            <Text style={styles.addButtonText}>Ekle</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Tokluk (mg/dL)</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Örn: 145"
            value={postMealInput}
            onChangeText={setPostMealInput}
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => addMeasurement('postMeal', postMealInput)}
          >
            <Text style={styles.addButtonText}>Ekle</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Diğer Ölçüm</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            placeholder="Örn: 180"
            value={otherInput}
            onChangeText={setOtherInput}
          />
          <TouchableOpacity
            style={styles.addButtonSecondary}
            onPress={() => addMeasurement('other', otherInput)}
          >
            <Text style={styles.addButtonTextSecondary}>Ekle</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* LİSTE */}
      <Text style={styles.sectionTitle}>Son Ölçümler</Text>
      {measurements.length === 0 ? (
        <Text style={styles.emptyText}>Henüz ölçüm eklenmedi.</Text>
      ) : (
        measurements.map(m => (
          <View key={m.id} style={styles.measureItem}>
            <View>
              <Text style={styles.measureValue}>{m.value} mg/dL</Text>
              <Text style={styles.measureType}>
                {m.type === 'fasting'
                  ? 'Açlık'
                  : m.type === 'postMeal'
                  ? 'Tokluk'
                  : 'Diğer'}
              </Text>
            </View>
            <Text style={styles.measureTime}>
              {m.time.toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
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
    backgroundColor: '#F0F7FF',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0059C1',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#4b5563',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    elevation: 2,
  },
  summaryLabel: { fontSize: 11, color: '#6b7280' },
  summaryValue: { fontSize: 16, fontWeight: '700', color: '#111827' },
  card: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 14,
    elevation: 3,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1f2933', marginBottom: 6 },
  a1cValue: { fontSize: 26, fontWeight: '900', color: '#1E88E5' },
  gdeValue: { fontSize: 30, fontWeight: '900', color: '#DC2626' },
  gdeLabel: { fontSize: 14, fontWeight: '700', color: '#374151', marginTop: 2 },
  cardText: { fontSize: 12, color: '#4b5563', marginTop: 6 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginTop: 10,
    marginBottom: 6,
  },
  inputGroup: { marginBottom: 8 },
  inputLabel: { fontSize: 13, color: '#374151', marginBottom: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f9fafb',
    fontSize: 13,
  },
  addButton: {
    marginLeft: 8,
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  addButtonText: { color: 'white', fontWeight: '700', fontSize: 13 },
  addButtonSecondary: {
    marginLeft: 8,
    backgroundColor: '#6b7280',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  addButtonTextSecondary: { color: 'white', fontWeight: '700', fontSize: 13 },
  emptyText: { fontSize: 13, color: '#6b7280', marginBottom: 16 },
  measureItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    elevation: 1,
  },
  measureValue: { fontSize: 16, fontWeight: '700', color: '#111827' },
  measureType: { fontSize: 11, color: '#6b7280' },
  measureTime: { fontSize: 11, color: '#6b7280', alignSelf: 'center' },
});
