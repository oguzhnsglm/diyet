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

const CALENDAR_STORAGE_KEY = 'glucose_calendar_days';
const WEEKDAY_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const STATUS_SEQUENCE = [null, 'good', 'mid', 'bad'];
const STATUS_META = {
  good: { emoji: '😊', color: '#22c55e', bg: '#dcfce7', label: 'İyi' },
  mid: { emoji: '😐', color: '#eab308', bg: '#fef9c3', label: 'Orta' },
  bad: { emoji: '😞', color: '#ef4444', bg: '#fee2e2', label: 'Zor' },
  default: { emoji: '➕', color: '#94a3b8', bg: '#f1f5f9', label: 'Seç' },
};

const formatDateKey = (date) => date.toISOString().split('T')[0];

const getWeekStart = (baseDate) => {
  const date = new Date(baseDate);
  const day = date.getDay();
  const diff = (day + 6) % 7; // Monday as week start
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - diff);
  return date;
};

const buildWeekDays = (startDate) => {
  const days = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
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
  const [activeTab, setActiveTab] = useState('diary');
  const [calendarDays, setCalendarDays] = useState({});
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()));
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

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      const loadPlanner = async () => {
        try {
          const stored = await AsyncStorage.getItem(CALENDAR_STORAGE_KEY);
          if (!mounted) return;
          setCalendarDays(stored ? JSON.parse(stored) : {});
          setCurrentWeekStart(getWeekStart(new Date()));
        } catch (error) {
          console.warn('Weekly planner data failed', error);
        }
      };

      loadPlanner();
      return () => {
        mounted = false;
      };
    }, [])
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
  const waterGoal = 74;
  const waterConsumed = nutritionStats.waterOz || 72;
  const stepsToday = nutritionStats.steps || 3612;

  const bottomTabs = useMemo(
    () => [
      { id: 'diary', label: 'Diary', icon: '📘', screen: 'BloodSugar' },
      { id: 'recipes', label: 'Recipes', icon: '👩‍🍳', screen: 'HealthyRecipes' },
      { id: 'fasting', label: 'Fasting', icon: '⏱️', screen: 'DietPlan' },
      { id: 'profile', label: 'Profile', icon: '👤', screen: 'Profile' },
      { id: 'pro', label: 'Pro', icon: '🚀', screen: null },
    ],
    []
  );

  const handleBottomTabPress = (tab) => {
    setActiveTab(tab.id);
    if (tab.screen) {
      navigation.navigate(tab.screen);
    }
  };

  const handleToggleDayStatus = async (dayKey) => {
    try {
      const existing = calendarDays[dayKey] || {};
      const currentStatus = existing.status || null;
      const currentIndex = STATUS_SEQUENCE.indexOf(currentStatus);
      const nextStatus = STATUS_SEQUENCE[(currentIndex + 1) % STATUS_SEQUENCE.length];
      const updatedEntry = { ...existing };

      if (nextStatus) {
        updatedEntry.status = nextStatus;
      } else {
        delete updatedEntry.status;
      }

      const nextCalendar = { ...calendarDays, [dayKey]: updatedEntry };
      if (!nextStatus && !updatedEntry.note) {
        delete nextCalendar[dayKey];
      }

      setCalendarDays(nextCalendar);
      await AsyncStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(nextCalendar));
    } catch (error) {
      console.warn('Week day status değiştirilemedi', error);
    }
  };
  const metricCircles = useMemo(
    () => [
      {
        id: 'remaining',
        icon: '🧮',
        label: 'Kalan Kalori',
        value: caloriesRemaining,
        unit: 'kcal',
        hint: 'Günün hedefi',
        color: '#22c55e',
      },
      {
        id: 'consumed',
        icon: '🍽️',
        label: 'Alınan Kalori',
        value: caloriesEaten,
        unit: 'kcal',
        hint: 'Toplam tüketim',
        color: '#0ea5e9',
      },
      {
        id: 'libre',
        icon: '🩸',
        label: 'Libre Ölçümü',
        value: glucoseStats.lastValue || '—',
        unit: glucoseStats.lastValue ? 'mg/dL' : '',
        hint: glucoseStats.time ? glucoseStats.time : 'Henüz veri yok',
        color: '#f97316',
      },
      {
        id: 'burned',
        icon: '🔥',
        label: 'Yakılan Kalori',
        value: caloriesBurned,
        unit: 'kcal',
        hint: 'Aktivite',
        color: '#ef4444',
      },
      {
        id: 'water',
        icon: '💧',
        label: 'Su Takibi',
        value: waterConsumed,
        unit: 'fl oz',
        hint: `Hedef ${waterGoal} fl oz`,
        color: '#3b82f6',
      },
    ],
    [caloriesRemaining, caloriesEaten, glucoseStats.lastValue, glucoseStats.time, caloriesBurned, waterConsumed, waterGoal]
  );

  const weekDays = useMemo(() => {
    const weekList = buildWeekDays(currentWeekStart);
    return weekList.map((date, index) => {
      const key = formatDateKey(date);
      const stored = calendarDays[key] || {};
      return {
        key,
        date,
        status: stored.status || null,
        label: WEEKDAY_LABELS[index],
      };
    });
  }, [calendarDays, currentWeekStart]);

  const weekRangeLabel = useMemo(() => {
    if (!weekDays.length) return '';
    const formatter = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long' });
    const startText = formatter.format(weekDays[0].date);
    const endText = formatter.format(weekDays[weekDays.length - 1].date);
    return `${startText} - ${endText}`;
  }, [weekDays]);

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
    { id: 7, label: 'Profile', icon: '👤', color: '#6366f1', screen: 'Profile' },
    { id: 8, label: 'Planner', icon: '📅', color: '#2dd4bf', screen: 'GlucoseCalendar' },
    { id: 9, label: 'Emergency', icon: '🚑', color: '#ef4444', screen: 'Emergency' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#dff5ef', '#f5f7fb']} style={styles.backgroundGradient}>
        <View style={{ flex: 1 }}>
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

            <View style={styles.metricGrid}>
              {metricCircles.map(card => (
                <View
                  key={card.id}
                  style={[styles.metricTile, card.id === 'water' && styles.metricTileCenter]}
                >
                  <View
                    style={[
                      styles.metricCircle,
                      {
                        borderColor: card.color,
                        backgroundColor: `${card.color}20`,
                      },
                    ]}
                  >
                    <Text style={styles.metricValue}>{card.value}</Text>
                    {card.unit ? <Text style={styles.metricUnit}>{card.unit}</Text> : null}
                  </View>
                  <Text style={styles.metricLabel}>
                    {card.icon} {card.label}
                  </Text>
                  <Text style={styles.metricHint}>{card.hint}</Text>
                </View>
              ))}
            </View>

            <View style={styles.weeklyCard}>
              <View style={styles.weeklyHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Haftalık çizelge</Text>
                  <Text style={styles.weeklySubtitle}>{weekRangeLabel}</Text>
                </View>
                <Pressable
                  style={styles.weeklyPlannerLink}
                  onPress={() => navigation.navigate('GlucoseCalendar')}
                >
                  <Text style={styles.sectionLink}>Planner</Text>
                </Pressable>
              </View>
              <View style={styles.weeklyRow}>
                {weekDays.map((day) => {
                  const meta = day.status ? STATUS_META[day.status] : STATUS_META.default;
                  return (
                    <Pressable
                      key={day.key}
                      style={[styles.weekDayTile, { backgroundColor: meta.bg, borderColor: meta.color }]}
                      onPress={() => handleToggleDayStatus(day.key)}
                    >
                      <Text style={[styles.weekDayLabel, { color: meta.color }]}>{day.label}</Text>
                      <Text style={styles.weekDayEmoji}>{meta.emoji}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.weekLegendRow}>
                {['good', 'mid', 'bad'].map((key) => (
                  <View key={key} style={styles.weekLegendItem}>
                    <Text style={[styles.weekLegendEmoji, { color: STATUS_META[key].color }]}>
                      {STATUS_META[key].emoji}
                    </Text>
                    <Text style={styles.weekLegendText}>{STATUS_META[key].label}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.weekHint}>Emoji seçimlerin Planner sekmesiyle senkronize edilir.</Text>
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
          <View style={styles.bottomNavBar}>
            {bottomTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <Pressable
                  key={tab.id}
                  style={[styles.bottomNavItem, isActive && styles.bottomNavItemActive]}
                  onPress={() => handleBottomTabPress(tab)}
                >
                  <Text style={[styles.bottomNavIcon, isActive && styles.bottomNavIconActive]}>
                    {tab.icon}
                  </Text>
                  <Text style={[styles.bottomNavLabel, isActive && styles.bottomNavLabelActive]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
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
    paddingBottom: 140,
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
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metricTile: {
    width: '47%',
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginBottom: 12,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  metricTileCenter: {
    width: '70%',
    alignSelf: 'center',
  },
  metricCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 10,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  metricUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  metricLabel: {
    textAlign: 'center',
    fontWeight: '700',
    color: '#0f172a',
  },
  metricHint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
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
  weeklyCard: {
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
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  weeklySubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  weeklyPlannerLink: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#e0f2fe',
  },
  weeklyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  weekDayTile: {
    width: 45,
    height: 70,
    borderRadius: 18,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  weekDayEmoji: {
    fontSize: 20,
    marginTop: 4,
  },
  weekLegendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 6,
  },
  weekLegendItem: {
    alignItems: 'center',
  },
  weekLegendEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  weekLegendText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '600',
  },
  weekHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  bottomNavBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 18,
  },
  bottomNavItemActive: {
    backgroundColor: '#d1fae5',
  },
  bottomNavIcon: {
    fontSize: 18,
    color: '#94a3b8',
  },
  bottomNavIconActive: {
    color: '#059669',
  },
  bottomNavLabel: {
    fontSize: 12,
    marginTop: 2,
    color: '#94a3b8',
    fontWeight: '600',
  },
  bottomNavLabelActive: {
    color: '#047857',
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
