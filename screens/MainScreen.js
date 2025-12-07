import React, { useState, useCallback, useEffect, useRef } from 'react';
import { SafeAreaView, ScrollView, Text, View, Pressable, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayHealthSummary } from '../logic/healthSync';
import { 
  getTodayGoalProgress, 
  checkAndAwardBadges, 
  analyzePersonality, 
  generateSmartNotification 
} from '../logic/smartGoals';
import WaterTracker from '../components/WaterTracker';
import ActivitiesCard from '../components/ActivitiesCard';
import MilestoneCard from '../components/MilestoneCard';
import TodaySummaryCard from '../components/TodaySummaryCard';

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

  // Gamification state
  const [healthSummary, setHealthSummary] = useState(null);
  const [goalProgress, setGoalProgress] = useState(null);
  const [badges, setBadges] = useState([]);
  const [personality, setPersonality] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

  // Load gamification data on screen focus
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadGameData = async () => {
        try {
          // Load health summary
          const healthData = await getTodayHealthSummary();
          if (isActive) setHealthSummary(healthData);

          // Calculate goal progress
          const progress = await getTodayGoalProgress();
          if (isActive) setGoalProgress(progress);

          // Check and award badges
          const awardedBadges = await checkAndAwardBadges();
          if (isActive) setBadges(awardedBadges);

          // Analyze personality type
          const personalityType = await analyzePersonality();
          if (isActive) setPersonality(personalityType);

          // Generate smart notifications
          const notifs = await generateSmartNotification();
          if (isActive) setNotifications(notifs);
        } catch (error) {
          console.warn('Gamification data load failed', error);
        }
      };

      loadGameData();

      // Pulse animation for badges
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      return () => {
        isActive = false;
      };
    }, [])
  );

  const menuOptions = [
    {
      id: 1,
      title: '🩸 Kan Şekeri',
      color: '#0ea5e9',
      screen: 'BloodSugar',
    },
    {
      id: 2,
      title: '🍽️ Yemek Takibi',
      color: '#4CAF50',
      screen: 'DietPlan',
    },
    {
      id: 3,
      title: '📸 Fotoğrafla Analiz',
      color: '#EC4899',
      screen: 'AddMeal',
    },
    {
      id: 4,
      title: '🤖 Sohbet Asistanı',
      color: '#8B5CF6',
      screen: 'MiniAssistant',
    },
    {
      id: 5,
      title: '⌚ Saat Bağlantısı',
      color: '#06B6D4',
      screen: 'HealthSync',
    },
    {
      id: 6,
      title: '🔮 Öneriler',
      color: '#A855F7',
      screen: 'PersonalInsights',
    },
    {
      id: 7,
      title: '🎙️ Sesli Asistan',
      color: '#14B8A6',
      screen: 'VoiceCoach',
    },
    {
      id: 8,
      title: '😴 Uyku & Stres',
      color: '#6366F1',
      screen: 'StressSleepAnalysis',
    },
    {
      id: 9,
      title: '📄 Doktor Raporu',
      color: '#10B981',
      screen: 'DoctorReport',
    },
    {
      id: 10,
      title: '🏃‍♀️ Egzersiz',
      color: '#3b82f6',
      screen: 'ExerciseLibrary',
    },
    {
      id: 11,
      title: '🚑 Acil Durum',
      color: '#dc2626',
      screen: 'Emergency',
    },
    {
      id: 12,
      title: '📚 Tarifler',
      color: '#FF9800',
      screen: 'HealthyRecipes',
    },
    {
      id: 13,
      title: '📘 Bilgi Merkezi',
      color: '#0ea5e9',
      screen: 'DiabetesInfo',
    },
    {
      id: 14,
      title: '📅 Takvim',
      color: '#1d4ed8',
      screen: 'GlucoseCalendar',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#E0F2FE', '#F5F7FA']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Sağlık Asistanın</Text>
            <Text style={styles.headerSubtitle}>
              Kan şekeri, yemek ve egzersiz takibi
            </Text>
          </View>

          {/* Modern Kartlar */}
          <TodaySummaryCard 
            eaten={nutritionStats.calories || 0}
            remaining={2000 - (nutritionStats.calories || 0)}
            burned={142}
            carbs={{ current: nutritionStats.carbs || 0, target: 207 }}
            protein={{ current: nutritionStats.protein || 0, target: 115 }}
            fat={{ current: nutritionStats.fat || 0, target: 61 }}
          />

          <WaterTracker />

          <ActivitiesCard onConnect={() => navigation.navigate('HealthSync')} />

          <MilestoneCard days={3} onCommit={() => {}} />

          <View style={styles.glucoseCard}>
            <Text style={styles.glucoseTitle}>Bugünkü Özet</Text>

            <View style={styles.glucoseRow}>
              <View style={styles.glucoseBox}>
                <Text style={styles.glucoseLabel}>Son Ölçüm</Text>
                <Text style={styles.glucoseValue}>
                  {glucoseStats.lastValue ? `${glucoseStats.lastValue} mg/dL` : '-'}
                </Text>
                <Text style={styles.glucoseSub}>
                  {glucoseStats.time || 'Detay için tıkla'}
                </Text>
              </View>
              <View style={styles.glucoseBox}>
                <Text style={styles.glucoseLabel}>Ortalama</Text>
                <Text style={styles.glucoseValue}>
                  {glucoseStats.a1cRange
                    ? `%${glucoseStats.a1cRange.min} – %${glucoseStats.a1cRange.max}`
                    : '%5.5 – %6.0'}
                </Text>
                <Text style={styles.glucoseSub}>3 aylık</Text>
              </View>
            </View>

            {/* Health data from watch */}
            {healthSummary && (
              <View style={styles.healthDataRow}>
                <Text style={styles.healthDataTitle}>Saat Verileri</Text>
                <View style={styles.healthDataGrid}>
                  {healthSummary.steps > 0 && (
                    <View style={styles.healthDataItem}>
                      <Text style={styles.healthDataLabel}>👟 Adım</Text>
                      <Text style={styles.healthDataValue}>{healthSummary.steps}</Text>
                    </View>
                  )}
                  {healthSummary.heartRate > 0 && (
                    <View style={styles.healthDataItem}>
                      <Text style={styles.healthDataLabel}>❤️ Nabız</Text>
                      <Text style={styles.healthDataValue}>{healthSummary.heartRate} vuruş/dk</Text>
                    </View>
                  )}
                  {healthSummary.caloriesBurned > 0 && (
                    <View style={styles.healthDataItem}>
                      <Text style={styles.healthDataLabel}>🔥 Kalori</Text>
                      <Text style={styles.healthDataValue}>{healthSummary.caloriesBurned} kkal</Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            <View style={styles.nutritionRow}>
              <Text style={styles.nutritionTitle}>Bugünkü Yemekler</Text>
              <Text style={styles.nutritionText}>
                Kalori: {nutritionStats.calories || 0} • Karbonhidrat: {nutritionStats.carbs || 0}g • Şeker: {nutritionStats.sugar || 0}g
              </Text>
            </View>

            <Pressable
              style={styles.glucoseButton}
              onPress={() => navigation.navigate('BloodSugar')}
            >
              <Text style={styles.glucoseButtonText}>Detaylı Görüntüle</Text>
            </Pressable>
          </View>

          {/* Smart Notifications */}
          {notifications && notifications.length > 0 && (
            <View style={styles.notificationContainer}>
              <Text style={styles.notificationHeader}>📢 Bildirimler</Text>
              {notifications.map((notif, index) => (
                <View
                  key={index}
                  style={[
                    styles.notificationCard,
                    {
                      backgroundColor:
                        notif.type === 'warning'
                          ? '#FEF3C7'
                          : notif.type === 'success'
                          ? '#D1FAE5'
                          : notif.type === 'info'
                          ? '#DBEAFE'
                          : '#F3F4F6',
                    },
                  ]}
                >
                  <Text style={styles.notificationTitle}>{notif.title}</Text>
                  <Text style={styles.notificationBody}>{notif.message}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Goals Progress */}
          {goalProgress && (
            <View style={styles.goalsCard}>
              <Text style={styles.goalsHeader}>🎯 Bugünkü Hedefler</Text>
              
              {goalProgress.steps && (
                <View style={styles.goalItem}>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalLabel}>👟 Adım</Text>
                    <Text style={styles.goalValue}>
                      {goalProgress.steps.current} / {goalProgress.steps.target}
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min(
                            (goalProgress.steps.current / goalProgress.steps.target) * 100,
                            100
                          )}%`,
                          backgroundColor: '#10B981',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.goalPercent}>
                    {Math.round((goalProgress.steps.current / goalProgress.steps.target) * 100)}%
                  </Text>
                </View>
              )}

              {goalProgress.caloriesBurned && (
                <View style={styles.goalItem}>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalLabel}>🔥 Kalori</Text>
                    <Text style={styles.goalValue}>
                      {goalProgress.caloriesBurned.current} / {goalProgress.caloriesBurned.target} kkal
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min(
                            (goalProgress.caloriesBurned.current / goalProgress.caloriesBurned.target) * 100,
                            100
                          )}%`,
                          backgroundColor: '#F59E0B',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.goalPercent}>
                    {Math.round((goalProgress.caloriesBurned.current / goalProgress.caloriesBurned.target) * 100)}%
                  </Text>
                </View>
              )}

              {goalProgress.glucoseReadings && (
                <View style={styles.goalItem}>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalLabel}>🩸 Ölçüm</Text>
                    <Text style={styles.goalValue}>
                      {goalProgress.glucoseReadings.current} / {goalProgress.glucoseReadings.target}
                    </Text>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View
                      style={[
                        styles.progressBarFill,
                        {
                          width: `${Math.min(
                            (goalProgress.glucoseReadings.current / goalProgress.glucoseReadings.target) * 100,
                            100
                          )}%`,
                          backgroundColor: '#0EA5E9',
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.goalPercent}>
                    {Math.round((goalProgress.glucoseReadings.current / goalProgress.glucoseReadings.target) * 100)}%
                  </Text>
                </View>
              )}

              {goalProgress.overallScore !== undefined && (
                <View style={styles.overallScoreContainer}>
                  <Text style={styles.overallScoreLabel}>Genel Skor</Text>
                  <View style={styles.scoreCircle}>
                    <Text style={styles.scoreText}>{Math.round(goalProgress.overallScore)}%</Text>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Achievements & Badges */}
          {badges && badges.length > 0 && (
            <Pressable
              style={styles.achievementBar}
              onPress={() => navigation.navigate('Achievements')}
            >
              <View style={styles.achievementLeft}>
                <Text style={styles.achievementTitle}>🏆 Başarılar</Text>
                <Text style={styles.achievementSubtitle}>
                  {badges.filter(b => b.earned).length} rozet kazandın!
                </Text>
              </View>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Text style={styles.achievementBadge}>
                  {badges.filter(b => b.earned).length}
                </Text>
              </Animated.View>
            </Pressable>
          )}

          {/* Personality Type */}
          {personality && (
            <View style={styles.personalityCard}>
              <Text style={styles.personalityTitle}>🎭 Profilin</Text>
              <Text style={styles.personalityType}>{personality.name}</Text>
              <Text style={styles.personalityDesc}>{personality.description}</Text>
            </View>
          )}

          {menuOptions.map(option => (
            <Pressable
              key={option.id}
              style={[styles.menuCard, { borderLeftColor: option.color }]}
              onPress={() => navigation.navigate(option.screen)}
            >
              <View style={styles.menuInner}>
                <Text style={styles.menuTitle}>{option.title}</Text>
              </View>
            </Pressable>
          ))}
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
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderLeftWidth: 6,
    backgroundColor: 'white',
  },
  menuInner: {
    padding: 16,
    justifyContent: 'center',
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  // Health data styles
  healthDataRow: {
    marginTop: 8,
    marginBottom: 8,
  },
  healthDataTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  healthDataGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  healthDataItem: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  healthDataLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginBottom: 2,
  },
  healthDataValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  // Notification styles
  notificationContainer: {
    marginBottom: 20,
  },
  notificationHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  notificationCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  notificationBody: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 16,
  },
  // Goals styles
  goalsCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  goalsHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 14,
  },
  goalItem: {
    marginBottom: 12,
  },
  goalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  goalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  goalValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  goalPercent: {
    fontSize: 11,
    color: '#6B7280',
    textAlign: 'right',
  },
  overallScoreContainer: {
    marginTop: 10,
    alignItems: 'center',
  },
  overallScoreLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  scoreCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreText: {
    fontSize: 22,
    fontWeight: '800',
    color: 'white',
  },
  // Achievement bar styles
  achievementBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementLeft: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 2,
  },
  achievementSubtitle: {
    fontSize: 12,
    color: '#78350F',
  },
  achievementBadge: {
    fontSize: 28,
    fontWeight: '800',
    color: '#D97706',
  },
  // Personality card styles
  personalityCard: {
    backgroundColor: '#EDE9FE',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  personalityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B21B6',
    marginBottom: 6,
  },
  personalityType: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B21A8',
    marginBottom: 4,
  },
  personalityDesc: {
    fontSize: 12,
    color: '#7C3AED',
    lineHeight: 16,
  },
});

export default MainScreen;
