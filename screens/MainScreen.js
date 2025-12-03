import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { SafeAreaView, ScrollView, Text, View, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProgressBar from '../components/ProgressBar';

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
  const calorieGoal = 1888;
  const macroGoals = {
    carbs: 207,
    protein: 115,
    fat: 61,
  };

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

  const headerBadges = useMemo(
    () => [
      { id: 'gems', label: '2000', icon: '💎' },
      { id: 'fire', label: '135', icon: '🔥' },
      { id: 'calendar', label: new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }), icon: '📅' },
    ],
    []
  );

  const caloriesEaten = nutritionStats.calories || 0;
  const caloriesRemaining = Math.max(0, calorieGoal - caloriesEaten);
  const caloriesBurned = 142;
  const libreStats = useMemo(
    () => [
      { label: 'Time in range', value: '82%' },
      { label: 'Avg glucose', value: '109 mg/dL' },
      { label: 'Low events', value: '1 / week' },
      { label: 'High events', value: '2 / week' },
    ],
    []
  );
  const libreTrend = useMemo(
    () => [
      { id: 'mon', day: 'Mon', avg: 108, min: 85, max: 132 },
      { id: 'tue', day: 'Tue', avg: 112, min: 92, max: 145 },
      { id: 'wed', day: 'Wed', avg: 106, min: 88, max: 131 },
      { id: 'thu', day: 'Thu', avg: 118, min: 96, max: 154 },
      { id: 'fri', day: 'Fri', avg: 111, min: 90, max: 140 },
      { id: 'sat', day: 'Sat', avg: 115, min: 94, max: 150 },
      { id: 'sun', day: 'Sun', avg: 104, min: 82, max: 126 },
    ],
    []
  );

  const nutritionMeals = useMemo(
    () => [
      {
        id: 'breakfast',
        title: 'Breakfast',
        calories: nutritionStats.breakfastCal || 466,
        total: 566,
        description: 'Fried eggs with mixed greens and avocado',
      },
      {
        id: 'lunch',
        title: 'Lunch',
        calories: nutritionStats.lunchCal || 554,
        total: 755,
        description: 'Grilled salmon with quinoa and veggies',
      },
      {
        id: 'dinner',
        title: 'Dinner',
        calories: nutritionStats.dinnerCal || 430,
        total: 600,
        description: 'Chicken bowl with brown rice',
      },
    ],
    [nutritionStats.dinnerCal, nutritionStats.lunchCal, nutritionStats.breakfastCal]
  );

  const quickActions = [
    { id: 1, label: 'Diary', icon: '💧', color: '#0ea5e9', screen: 'BloodSugar' },
    { id: 2, label: 'Recipes', icon: '🍽️', color: '#4CAF50', screen: 'HealthyRecipes' },
    { id: 3, label: 'Fasting', icon: '⏱️', color: '#f97316', screen: 'DietPlan' },
    { id: 4, label: 'Water', icon: '🥤', color: '#38bdf8', screen: 'WaterTracker' },
    { id: 5, label: 'Activities', icon: '🏃', color: '#34d399', screen: 'Activities' },
    { id: 6, label: 'Libre', icon: '📊', color: '#16a34a', screen: 'LibreStats' },
    { id: 7, label: 'Profile', icon: '👤', color: '#6366f1', screen: 'DiabetesInfo' },
    { id: 8, label: 'Planner', icon: '📅', color: '#2dd4bf', screen: 'GlucoseCalendar' },
    { id: 9, label: 'Emergency', icon: '🚑', color: '#ef4444', screen: 'Emergency' },
  ];

  const waterGoal = 74;
  const waterConsumed = nutritionStats.waterOz || 72;
  const stepsToday = nutritionStats.steps || 3612;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#dff5ef', '#f5f7fb']} style={styles.backgroundGradient}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View>
                <Text style={styles.heroToday}>Today</Text>
                <Text style={styles.heroWeek}>Week 175</Text>
              </View>
              <View style={styles.badgeRow}>
                {headerBadges.map(badge => (
                  <View key={badge.id} style={styles.badgeChip}>
                    <Text style={styles.badgeIcon}>{badge.icon}</Text>
                    <Text style={styles.badgeLabel}>{badge.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.summaryCircle}>
                <Text style={styles.summaryRemaining}>{caloriesRemaining}</Text>
                <Text style={styles.summaryRemainingLabel}>Remaining</Text>
              </View>
              <View style={styles.summaryDetails}>
                <View style={styles.summaryRows}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Eaten</Text>
                    <Text style={styles.summaryValue}>{caloriesEaten} kcal</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Burned</Text>
                    <Text style={styles.summaryValue}>{caloriesBurned} kcal</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Last glucose</Text>
                    <Text style={styles.summaryValue}>
                      {glucoseStats.lastValue ? `${glucoseStats.lastValue} mg/dL` : '-'}
                    </Text>
                  </View>
                </View>
                <View style={styles.librePanel}>
                  <View style={styles.libreHeader}>
                    <Text style={styles.libreTitle}>Libre stats</Text>
                    <Pressable onPress={() => navigation.navigate('LibreStats')}>
                      <Text style={styles.sectionLink}>Open</Text>
                    </Pressable>
                  </View>
                  {libreStats.map(item => (
                    <View key={item.label} style={styles.libreRow}>
                      <Text style={styles.libreLabel}>{item.label}</Text>
                      <Text style={styles.libreValue}>{item.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.macroCard}>
              <Text style={styles.sectionTitle}>Summary</Text>
              <Text style={styles.sectionLink}>Details</Text>
            </View>
            <View style={styles.progressGroup}>
              <ProgressBar
                label="Carbs"
                value={nutritionStats.carbs || 0}
                max={macroGoals.carbs}
                unit=" g"
                color="#2dd4bf"
              />
              <ProgressBar
                label="Protein"
                value={nutritionStats.protein || 0}
                max={macroGoals.protein}
                unit=" g"
                color="#14b8a6"
              />
              <ProgressBar
                label="Fat"
                value={nutritionStats.fat || 0}
                max={macroGoals.fat}
                unit=" g"
                color="#22c55e"
              />
            </View>

            <View style={styles.libreTableCard}>
              <View style={styles.libreTableHeader}>
                <Text style={styles.sectionTitle}>Libre trend</Text>
                <Pressable onPress={() => navigation.navigate('LibreStats')}>
                  <Text style={styles.sectionLink}>All data</Text>
                </Pressable>
              </View>
              <View style={styles.libreTableRowHeader}>
                <Text style={[styles.libreTableCell, styles.libreTableHead]}>Day</Text>
                <Text style={[styles.libreTableCell, styles.libreTableHead]}>Avg</Text>
                <Text style={[styles.libreTableCell, styles.libreTableHead]}>Min</Text>
                <Text style={[styles.libreTableCell, styles.libreTableHead]}>Max</Text>
              </View>
              {libreTrend.map(row => (
                <View key={row.id} style={styles.libreTableRow}>
                  <Text style={styles.libreTableCell}>{row.day}</Text>
                  <Text style={styles.libreTableCell}>{row.avg} mg/dL</Text>
                  <Text style={styles.libreTableCell}>{row.min} mg/dL</Text>
                  <Text style={styles.libreTableCell}>{row.max} mg/dL</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nutrition</Text>
              <Text style={styles.sectionLink}>More</Text>
            </View>
            {nutritionMeals.map(meal => (
              <View key={meal.id} style={styles.mealRow}>
                <View>
                  <Text style={styles.mealTitle}>{meal.title}</Text>
                  <Text style={styles.mealCalories}>{meal.calories} / {meal.total} Cal</Text>
                  <Text style={styles.mealDescription}>{meal.description}</Text>
                </View>
                <Pressable style={styles.circleButton} onPress={() => navigation.navigate('DietPlan')}>
                  <Text style={styles.circleButtonText}>+</Text>
                </Pressable>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Water Tracker</Text>
              <Pressable onPress={() => navigation.navigate('WaterTracker')}>
                <Text style={styles.sectionLink}>Open</Text>
              </Pressable>
            </View>
            <View style={styles.waterHeader}>
              <Text style={styles.waterLabel}>Water</Text>
              <Text style={styles.waterGoal}>Goal: {waterGoal} fl oz</Text>
            </View>
            <Text style={styles.waterAmount}>{waterConsumed} fl oz</Text>
            <View style={styles.cupRow}>
              {Array.from({ length: 6 }).map((_, index) => (
                <View key={index} style={styles.cup} />
              ))}
              <View style={[styles.cup, styles.cupActive]} />
              <Pressable style={[styles.cup, styles.cupAdd]}>
                <Text style={styles.cupAddText}>+</Text>
              </Pressable>
            </View>
            <Text style={styles.waterFood}>+ Water from food: 0.0 fl oz</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Activities</Text>
              <Pressable onPress={() => navigation.navigate('Activities')}>
                <Text style={styles.sectionLink}>Open</Text>
              </Pressable>
            </View>
            <Pressable style={styles.activityCard} onPress={() => navigation.navigate('Activities')}>
              <View>
                <Text style={styles.activityLabel}>Steps</Text>
                <Text style={styles.activitySub}>Automatic Tracking</Text>
              </View>
              <Pressable style={styles.connectButton}>
                <Text style={styles.connectText}>Connect</Text>
              </Pressable>
            </Pressable>
            <Pressable>
              <Text style={styles.activityLink}>Track steps manually</Text>
            </Pressable>
            <View style={styles.activityQuickRow}>
              <Pressable style={styles.activityQuickTile}>
                <Text style={styles.activityQuickPlus}>+</Text>
                <Text style={styles.activityQuickLabel}>Add</Text>
              </Pressable>
              <Pressable style={styles.activityQuickTile}>
                <Text style={styles.activityQuickIcon}>🏃</Text>
                <Text style={styles.activityQuickLabel}>{stepsToday} Cal</Text>
              </Pressable>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <Text style={styles.sectionLink}>See all</Text>
            </View>
            <View style={styles.quickGrid}>
              {quickActions.map(action => (
                <Pressable
                  key={action.id}
                  style={[styles.quickTile, { backgroundColor: `${action.color}1A` }]}
                  onPress={() => navigation.navigate(action.screen)}
                >
                  <Text style={styles.quickIcon}>{action.icon}</Text>
                  <Text style={[styles.quickLabel, { color: action.color }]}>{action.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Uygulama tıbbi tavsiye yerine geçmez; her değişiklik için uzmanına danış.
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
    backgroundColor: '#f5f5f5',
  },
  backgroundGradient: {
    flex: 1,
  },
  content: {
    padding: 24,
    paddingBottom: 60,
  },
  heroCard: {
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroToday: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
  },
  heroWeek: {
    fontSize: 14,
    color: '#94a3b8',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeLabel: {
    fontWeight: '600',
    color: '#111827',
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 12,
    borderColor: '#34d399',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    backgroundColor: '#ecfdf5',
  },
  summaryRemaining: {
    fontSize: 36,
    fontWeight: '700',
    color: '#111827',
  },
  summaryRemainingLabel: {
    color: '#6b7280',
    fontWeight: '600',
  },
  summaryDetails: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 18,
    gap: 12,
  },
  summaryRows: {
    gap: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  summaryLabel: {
    color: '#6b7280',
    fontWeight: '600',
  },
  summaryValue: {
    color: '#111827',
    fontWeight: '700',
  },
  librePanel: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  libreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  libreTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  libreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  libreLabel: {
    color: '#6b7280',
    fontWeight: '600',
  },
  libreValue: {
    color: '#0f172a',
    fontWeight: '700',
  },
  libreTableCard: {
    marginTop: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 16,
  },
  libreTableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  libreTableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  libreTableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  libreTableCell: {
    flex: 1,
    fontWeight: '600',
    color: '#0f172a',
  },
  libreTableHead: {
    textTransform: 'uppercase',
    fontSize: 12,
    color: '#64748b',
  },
  macroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  sectionLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#38bdf8',
  },
  progressGroup: {
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  waterLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  waterGoal: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '600',
  },
  waterAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: '#0f172a',
    marginVertical: 12,
  },
  cupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  cup: {
    width: 32,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#e0f2fe',
    borderWidth: 2,
    borderColor: '#bae6fd',
  },
  cupActive: {
    backgroundColor: '#0ea5e9',
    borderColor: '#0ea5e9',
  },
  cupAdd: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderColor: '#d1d5db',
  },
  cupAddText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  waterFood: {
    fontSize: 12,
    color: '#6b7280',
  },
  activityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 16,
    marginBottom: 10,
  },
  activityLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  activitySub: {
    fontSize: 13,
    color: '#94a3b8',
  },
  connectButton: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  connectText: {
    color: '#fff',
    fontWeight: '700',
  },
  activityLink: {
    color: '#0ea5e9',
    fontWeight: '600',
    marginBottom: 16,
  },
  activityQuickRow: {
    flexDirection: 'row',
    gap: 12,
  },
  activityQuickTile: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 14,
  },
  activityQuickPlus: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0f172a',
  },
  activityQuickIcon: {
    fontSize: 24,
  },
  activityQuickLabel: {
    marginTop: 4,
    fontWeight: '600',
    color: '#4b5563',
  },
  mealRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  mealCalories: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  mealDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#111827',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '600',
    marginTop: -4,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickTile: {
    width: '30%',
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  quickLabel: {
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#ecfccb',
  },
  footerText: {
    textAlign: 'center',
    color: '#4d7c0f',
    fontSize: 12,
  },
});

export default MainScreen;
