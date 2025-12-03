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
    { id: 1, label: 'Diary', icon: '🩸', color: '#0ea5e9', screen: 'BloodSugar' },
    { id: 2, label: 'Recipes', icon: '🍽️', color: '#4CAF50', screen: 'HealthyRecipes' },
    { id: 3, label: 'Fasting', icon: '⏱️', color: '#f97316', screen: 'DietPlan' },
    { id: 4, label: 'Profile', icon: '👤', color: '#6366f1', screen: 'DiabetesInfo' },
    { id: 5, label: 'Planner', icon: '📅', color: '#2dd4bf', screen: 'GlucoseCalendar' },
    { id: 6, label: 'Emergency', icon: '🚑', color: '#ef4444', screen: 'Emergency' },
  ];

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
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    color: '#6b7280',
    fontWeight: '600',
  },
  summaryValue: {
    color: '#111827',
    fontWeight: '700',
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
