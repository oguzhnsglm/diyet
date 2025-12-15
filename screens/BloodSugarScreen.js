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
import { useLanguage } from '../context/LanguageContext';
import BottomNavBar from '../components/BottomNavBar';
import BackButton from '../components/BackButton';

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

function BloodSugarScreen({ navigation }) {
  const { isDarkMode, colors } = useTheme();
  const { t } = useLanguage();
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
      <View style={styles.headerRow}>
        <BackButton navigation={navigation} />
        <Text style={[styles.title, { color: colors.text }]}>{t('common.bloodSugar')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ANA DAIRE GRAFIK - Ortalama */}
      <View style={[styles.mainCircleCard, { backgroundColor: colors.cardBackground }]}>
        <View style={[styles.bigCircle, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F8FAFC' }]}>
          <Text style={[styles.bigCircleValue, { color: colors.text }]}>
            {stats.avg ? stats.avg.toFixed(0) : '--'}
          </Text>
          <Text style={[styles.bigCircleUnit, { color: colors.secondaryText }]}>mg/dL</Text>
          <Text style={[styles.bigCircleLabel, { color: colors.secondaryText }]}>{t('bloodSugarScreen.average')}</Text>
        </View>
      </View>

      {/* STATS GRID */}
      <View style={styles.statsGrid}>
        <View style={[styles.statBox, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.statBoxValue, { color: colors.text }]}>
            {stats.fasting ? stats.fasting.toFixed(0) : '-'}
          </Text>
          <Text style={[styles.statBoxLabel, { color: colors.secondaryText }]}>{t('bloodSugarScreen.fasting')}</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.statBoxValue, { color: colors.text }]}>
            {stats.postMeal ? stats.postMeal.toFixed(0) : '-'}
          </Text>
          <Text style={[styles.statBoxLabel, { color: colors.secondaryText }]}>{t('bloodSugarScreen.postMeal')}</Text>
        </View>
      </View>

      {/* A1C & GDE GRID */}
      <View style={styles.statsGrid}>
        <View style={[styles.statBox, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.statBoxValue, { color: colors.text }]}>
            {stats.a1c.min}–{stats.a1c.max}%
          </Text>
          <Text style={[styles.statBoxLabel, { color: colors.secondaryText }]}>{t('bloodSugarScreen.estimatedA1C')}</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.statBoxValue, { color: colors.text }]}>{stats.gde}</Text>
          <Text style={[styles.statBoxLabel, { color: colors.secondaryText }]}>GDE · {riskLabel}</Text>
        </View>
      </View>

      {/* ÖLÇÜM EKLEME ALANI */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('bloodSugarScreen.addMeasurement')}</Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>🌅 {t('bloodSugarScreen.fasting')}</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
            keyboardType="numeric"
            placeholder="95"
            placeholderTextColor={colors.secondaryText}
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
        <Text style={[styles.inputLabel, { color: colors.text }]}>🍽️ {t('bloodSugarScreen.postMeal')}</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
            keyboardType="numeric"
            placeholder="145"
            placeholderTextColor={colors.secondaryText}
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
        <Text style={[styles.inputLabel, { color: colors.text }]}>📊 {t('bloodSugarScreen.other')}</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
            keyboardType="numeric"
            placeholder="180"
            placeholderTextColor={colors.secondaryText}
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
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Son Ölçümler</Text>
      {measurements.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.secondaryText }]}>Henüz ölçüm yok</Text>
      ) : (
        measurements.map(m => (
          <View key={m.id} style={[styles.measureItem, { backgroundColor: colors.cardBackground }]}>
            <View>
              <Text style={[styles.measureValue, { color: colors.text }]}>{m.value} mg/dL</Text>
              <Text style={[styles.measureType, { color: colors.secondaryText }]}>
                {m.type === 'fasting' ? '🌅 Açlık' : m.type === 'postMeal' ? '🍽️ Tokluk' : '📊 Diğer'}
              </Text>
            </View>
            <Text style={[styles.measureTime, { color: colors.secondaryText }]}>
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
    padding: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  mainCircleCard: {
    borderRadius: 28,
    padding: 40,
    marginBottom: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 4,
    alignItems: 'center',
  },
  bigCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
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
    lineHeight: 68,
    letterSpacing: -1.5,
  },
  bigCircleUnit: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.3,
  },
  bigCircleLabel: {
    fontSize: 14,
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
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 12,
    elevation: 2,
  },
  statBoxValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  statBoxLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
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
    marginBottom: 10,
    letterSpacing: -0.1,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    borderRadius: 16,
    padding: 18,
    fontSize: 17,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 1 },
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
    textAlign: 'center',
    marginTop: 24,
    fontWeight: '500',
  },
  measureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 18,
    padding: 20,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  measureValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  measureType: {
    fontSize: 14,
    fontWeight: '500',
  },
  measureTime: {
    fontSize: 15,
    fontWeight: '600',
  },
});

function BloodSugarScreenWithNav({ navigation }) {
  return (
    <>
      <BloodSugarScreen navigation={navigation} />
      <BottomNavBar navigation={navigation} activeKey="BloodSugar" />
    </>
  );
}

export default BloodSugarScreenWithNav;
