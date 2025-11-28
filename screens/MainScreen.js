import React, { useState, useCallback, useEffect } from 'react';
import { SafeAreaView, ScrollView, Text, View, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LATEST_GLUCOSE_STATS_KEY = 'latest_glucose_stats';
const LATEST_NUTRITION_STATS_KEY = 'latest_nutrition_stats';
const DEFAULT_GLUCOSE_STATS = {
  lastValue: null,
  time: null,
  a1cRange: { min: 5.5, max: 6.0 },
};
const DEFAULT_NUTRITION_STATS = {
  calories: 0,
  carbs: 0,
  sugar: 0,
  protein: 0,
  fat: 0,
  updatedAt: null,
};

const formatStoredTime = isoString => {
  if (!isoString) return null;
  try {
    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date.toLocaleString('tr-TR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch (error) {
    console.warn('Glucose time parse failed', error);
    return null;
  }
};

const MainScreen = ({ navigation }) => {
  const route = useRoute();
  const [glucoseStats, setGlucoseStats] = useState(
    route.params?.glucoseStats || { ...DEFAULT_GLUCOSE_STATS }
  );
  const [nutritionStats, setNutritionStats] = useState(
    route.params?.nutritionStats || { ...DEFAULT_NUTRITION_STATS }
  );

  useEffect(() => {
    if (route.params?.glucoseStats) {
      setGlucoseStats(route.params.glucoseStats);
    }
  }, [route.params?.glucoseStats]);

  useEffect(() => {
    if (route.params?.nutritionStats) {
      setNutritionStats(prev => ({
        ...prev,
        ...route.params.nutritionStats,
      }));
    }
  }, [route.params?.nutritionStats]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadStoredStats = async () => {
        try {
          const [glucoseRaw, nutritionRaw] = await Promise.all([
            AsyncStorage.getItem(LATEST_GLUCOSE_STATS_KEY),
            AsyncStorage.getItem(LATEST_NUTRITION_STATS_KEY),
          ]);
          if (!isActive) return;

          if (glucoseRaw) {
            const parsed = JSON.parse(glucoseRaw);
            setGlucoseStats({
              lastValue: parsed?.lastValue ?? null,
              time:
                formatStoredTime(parsed?.timeISO) ||
                parsed?.time ||
                DEFAULT_GLUCOSE_STATS.time,
              a1cRange:
                parsed?.a1cRange &&
                typeof parsed.a1cRange.min === 'number' &&
                typeof parsed.a1cRange.max === 'number'
                  ? parsed.a1cRange
                  : { ...DEFAULT_GLUCOSE_STATS.a1cRange },
            });
          } else if (!route.params?.glucoseStats) {
            setGlucoseStats({ ...DEFAULT_GLUCOSE_STATS });
          }

          if (nutritionRaw) {
            const parsedNutrition = JSON.parse(nutritionRaw);
            setNutritionStats({
              calories: parsedNutrition?.calories ?? 0,
              carbs: parsedNutrition?.carbs ?? 0,
              sugar: parsedNutrition?.sugar ?? 0,
              protein: parsedNutrition?.protein ?? 0,
              fat: parsedNutrition?.fat ?? 0,
              updatedAt: parsedNutrition?.updatedAt || null,
            });
          } else if (!route.params?.nutritionStats) {
            setNutritionStats({ ...DEFAULT_NUTRITION_STATS });
          }
        } catch (error) {
          console.warn('Dashboard stat load failed', error);
        }
      };

      loadStoredStats();

      return () => {
        isActive = false;
      };
    }, [route.params?.glucoseStats, route.params?.nutritionStats])
  );

  const menuOptions = [
    {
      id: 1,
      title: '🩸 Kan Şekeri Günlüğü',
      description: 'Ölçümlerini kaydet, A1C ve dalgalanma durumunu takip et.',
      color: '#0ea5e9',
      screen: 'BloodSugar',
    },
    {
      id: 2,
      title: '🍽️ Öğün & Karbonhidrat Takibi',
      description: 'Yediğin öğünlerin karbonhidrat ve şeker miktarını hesapla.',
      color: '#4CAF50',
      screen: 'DietPlan',
    },
    {
      id: 3,
      title: '🏃‍♀️ Egzersiz & Aktivite',
      description: 'Fazla kalori ve şekeri dengelemek için egzersiz önerileri.',
      color: '#3b82f6',
      screen: 'ExerciseLibrary',
    },
    {
      id: 4,
      title: '🚑 Acil Durum Bilgileri',
      description: 'Hipoglisemi / hiperglisemi olduğunda ne yapman gerektiğini öğren.',
      color: '#dc2626',
      screen: 'Emergency',
    },
    {
      id: 5,
      title: '📚 Sağlıklı Tarifler',
      description: 'Düşük şekerli, dengeli ve diyabete uygun tarifler.',
      color: '#FF9800',
      screen: 'HealthyRecipes',
    },
    {
      id: 6,
      title: '📘 Diyabet Bilgi Merkezi',
      description: 'GI, GY, A1C, GDE ve tüm diyabet bilgilerini öğren.',
      color: '#0ea5e9',
      screen: 'DiabetesInfo',
    },
    {
      id: 7,
      title: '📅 Günlük Takvim',
      description: 'Sağlıklı / zor günlerini renkli takvimde işaretle.',
      color: '#1d4ed8',
      screen: 'GlucoseCalendar',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#E0F2FE', '#F5F7FA']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Diyabet Asistanın</Text>
            <Text style={styles.headerSubtitle}>
              Kan şekerini, öğünlerini ve egzersizini tek yerden yönet.
            </Text>
          </View>

          <View style={styles.glucoseCard}>
            <Text style={styles.glucoseTitle}>Bugünkü Kan Şekeri Özeti</Text>

            <View style={styles.glucoseRow}>
              <View style={styles.glucoseBox}>
                <Text style={styles.glucoseLabel}>Son Ölçüm</Text>
                <Text style={styles.glucoseValue}>
                  {glucoseStats.lastValue ? `${glucoseStats.lastValue} mg/dL` : '-'}
                </Text>
                <Text style={styles.glucoseSub}>
                  {glucoseStats.time || 'Detaylı liste için günlüğü aç.'}
                </Text>
              </View>
              <View style={styles.glucoseBox}>
                <Text style={styles.glucoseLabel}>Tahmini A1C</Text>
                <Text style={styles.glucoseValue}>
                  {glucoseStats.a1cRange
                    ? `${glucoseStats.a1cRange.min}% – ${glucoseStats.a1cRange.max}%`
                    : '5.5% – 6.0%'}
                </Text>
                <Text style={styles.glucoseSub}>Kesin sonuç için laboratuvar testi gerekir.</Text>
              </View>
            </View>

            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionTitle}>Bugünkü Öğün Özeti (isteğe bağlı)</Text>
              <Text style={styles.nutritionText}>
                Kalori: {nutritionStats.calories || 0} kcal • Karbonhidrat: {nutritionStats.carbs || 0} g • Şeker: {nutritionStats.sugar || 0} g
              </Text>
            </View>

            <Pressable
              style={styles.glucoseButton}
              onPress={() => navigation.navigate('BloodSugar')}
            >
              <Text style={styles.glucoseButtonText}>Kan Şekeri Günlüğünü Aç</Text>
            </Pressable>
          </View>

          {menuOptions.map(option => (
            <Pressable
              key={option.id}
              style={[styles.menuCard, { borderLeftColor: option.color }]}
              onPress={() => navigation.navigate(option.screen)}
            >
              <View style={styles.menuInner}>
                <Text style={styles.menuTitle}>{option.title}</Text>
                <Text style={styles.menuDescription}>{option.description}</Text>
                <View style={[styles.menuBadge, { backgroundColor: option.color }]}>
                  <Text style={styles.menuBadgeText}>Git →</Text>
                </View>
              </View>
            </Pressable>
          ))}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Bu uygulama tıbbi tedavinin yerini tutmaz. Diyet ve ilaç değişiklikleri için her zaman doktoruna danışmayı unutma.
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2933',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  glucoseCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  glucoseTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1D4ED8',
    marginBottom: 10,
  },
  glucoseRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  glucoseBox: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  glucoseLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  glucoseValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  glucoseSub: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  nutritionRow: {
    marginTop: 4,
    marginBottom: 10,
  },
  nutritionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  nutritionText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  glucoseButton: {
    marginTop: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#0EA5E9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  glucoseButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 13,
  },
  menuCard: {
    borderRadius: 16,
    marginBottom: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 6,
    backgroundColor: 'white',
  },
  menuInner: {
    padding: 18,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  menuDescription: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 18,
  },
  menuBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  menuBadgeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    marginTop: 10,
    padding: 14,
    backgroundColor: '#DCFCE7',
    borderRadius: 12,
  },
  footerText: {
    fontSize: 12,
    color: '#166534',
    textAlign: 'center',
  },
});

export default MainScreen;
