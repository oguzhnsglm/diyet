import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import MascotHeader from '../components/MascotHeader';

import ActivitiesCard from '../components/ActivitiesCard';
import BottomNavBar from '../components/BottomNavBar';
import MilestoneCard from '../components/MilestoneCard';
import ProgressBar from '../components/ProgressBar';
import TodaySummaryCard from '../components/TodaySummaryCard';
import WaterTracker from '../components/WaterTracker';
import {
  analyzePersonality,
  checkAndAwardBadges,
  generateSmartNotification,
  getTodayGoalProgress,
} from '../logic/smartGoals';
import { getTodayHealthSummary } from '../logic/healthSync';

const DEFAULT_GLUCOSE_STATS = {
  lastValue: null,
  time: null,
  a1cRange: { min: 5.5, max: 6.0 },
};

const DEFAULT_NUTRITION_STATS = {
  carbs: 210,
  protein: 110,
  fat: 65,
  calories: 2000,
};

const MACRO_GOALS = {
  calories: 2000,
  carbs: 210,
  protein: 110,
  fat: 65,
};

const LATEST_GLUCOSE_STATS_KEY = 'latest_glucose_stats';
const LATEST_NUTRITION_STATS_KEY = 'latest_nutrition_stats';
const CALENDAR_STORAGE_KEY = '@motivation_calendar_days';

const WEEKDAY_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const STATUS_SEQUENCE = [null, 'good', 'ok', 'bad'];
const STATUS_META = {
  default: { bg: '#f1f5f9', color: '#94a3b8', emoji: '⚪' },
  good: { bg: '#dcfce7', color: '#16a34a', emoji: '😊' },
  ok: { bg: '#fef9c3', color: '#f59e0b', emoji: '😐' },
  bad: { bg: '#fee2e2', color: '#ef4444', emoji: '😟' },
};

const quickActions = [
  { id: 'BloodSugar', label: 'Kan Şekeri', icon: '🩸', color: '#0ea5e9' },
  { id: 'HealthyRecipes', label: 'Tarifler', icon: '🍽️', color: '#4CAF50' },
  { id: 'DietPlan', label: 'Oruç', icon: '⏱️', color: '#f97316' },
  { id: 'WaterTracker', label: 'Su', icon: '💧', color: '#38bdf8' },
  { id: 'Activities', label: 'Aktivite', icon: '🏃', color: '#10b981' },
  { id: 'Profile', label: 'Profil', icon: '👤', color: '#6366f1' },
];

const menuOptions = [
  { id: 'HealthyRecipes', title: '🍲 Sağlıklı Tarifler', color: '#FF9800' },
  { id: 'DietPlanner', title: '🤖 Diyet Planlayıcı', color: '#8B5CF6' },
  { id: 'AddMeal', title: '📸 Fotoğrafla Analiz', color: '#EC4899' },
  { id: 'HealthSync', title: '⌚ Saat Bağlantısı', color: '#06B6D4' },
  { id: 'PersonalInsights', title: '🔮 Akıllı Öneriler', color: '#A855F7' },
  { id: 'StressSleep', title: '😴 Uyku & Stres', color: '#6366F1' },
  { id: 'DoctorReport', title: '📄 Doktor Raporu', color: '#10B981' },
  { id: 'GlucoseCalendar', title: '📅 Glikoz Takvimi', color: '#1d4ed8' },
  { id: 'UrineAnalysis', title: '💧 İdrar Analizi', color: '#0ea5e9' },
];

const formatDateKey = (date) => date.toISOString().split('T')[0];

const getWeekStart = (baseDate) => {
  const date = new Date(baseDate);
  const day = date.getDay();
  const diff = (day + 6) % 7; // Monday as start
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

const cycleStatus = (current) => {
  const index = STATUS_SEQUENCE.indexOf(current);
  const nextIndex = (index + 1) % STATUS_SEQUENCE.length;
  return STATUS_SEQUENCE[nextIndex];
};

const getWeekNumber = (date) => {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil(((target - yearStart) / 86400000 + 1) / 7);
};

const MainScreen = ({ navigation, route }) => {
  const [glucoseStats, setGlucoseStats] = useState(DEFAULT_GLUCOSE_STATS);
  const [nutritionStats, setNutritionStats] = useState(DEFAULT_NUTRITION_STATS);
  const [calendarDays, setCalendarDays] = useState({});
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()));
  const [healthSummary, setHealthSummary] = useState(null);
  const [goalProgress, setGoalProgress] = useState(null);
  const [achievements, setAchievements] = useState(null);
  const [personality, setPersonality] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadPersistedStats = useCallback(async () => {
    try {
      const [glucoseRaw, nutritionRaw, calendarRaw] = await Promise.all([
        AsyncStorage.getItem(LATEST_GLUCOSE_STATS_KEY),
        AsyncStorage.getItem(LATEST_NUTRITION_STATS_KEY),
        AsyncStorage.getItem(CALENDAR_STORAGE_KEY),
      ]);

      setGlucoseStats(glucoseRaw ? JSON.parse(glucoseRaw) : DEFAULT_GLUCOSE_STATS);
      setNutritionStats(nutritionRaw ? JSON.parse(nutritionRaw) : DEFAULT_NUTRITION_STATS);
      setCalendarDays(calendarRaw ? JSON.parse(calendarRaw) : {});
    } catch (error) {
      console.error('MainScreen storage load failed', error);
    }
  }, []);

  const fetchDynamicData = useCallback(async () => {
    try {
      const [summary, progress, badgeResult, persona, smartNotifications] = await Promise.all([
        getTodayHealthSummary(),
        getTodayGoalProgress(),
        checkAndAwardBadges(),
        analyzePersonality(),
        generateSmartNotification(),
      ]);

      setHealthSummary(summary);
      setGoalProgress(progress);
      setAchievements(badgeResult);
      setPersonality(persona);
      setNotifications(smartNotifications);
    } catch (error) {
      console.error('MainScreen dynamic data failed', error);
    }
  }, []);

  useEffect(() => {
    loadPersistedStats();
  }, [loadPersistedStats]);

  useFocusEffect(
    useCallback(() => {
      fetchDynamicData();
    }, [fetchDynamicData])
  );

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await loadPersistedStats();
      await fetchDynamicData();
    } finally {
      setRefreshing(false);
    }
  }, [fetchDynamicData, loadPersistedStats]);

  const persistCalendar = useCallback((data) => {
    AsyncStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(data)).catch((error) =>
      console.error('Calendar persist failed', error)
    );
  }, []);

  const handleToggleDayStatus = useCallback(
    (dayKey) => {
      setCalendarDays((prev) => {
        const nextStatus = cycleStatus(prev[dayKey]?.status ?? null);
        const updated = {
          ...prev,
          [dayKey]: { ...(prev[dayKey] || {}), status: nextStatus },
        };
        persistCalendar(updated);
        return updated;
      });
    },
    [persistCalendar]
  );

  const shiftWeek = useCallback((direction) => {
    setCurrentWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + direction * 7);
      return getWeekStart(next);
    });
  }, []);

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

  const headerBadges = useMemo(() => {
    const badges = [];
    if (goalProgress?.overallScore) {
      badges.push({ id: 'score', icon: '🎯', label: `${goalProgress.overallScore}% başarı` });
    }
    if (achievements?.streak) {
      badges.push({ id: 'streak', icon: '🔥', label: `${achievements.streak} gün seri` });
    }
    if (personality?.name) {
      badges.push({ id: 'persona', icon: '🧠', label: personality.name });
    }
    return badges.slice(0, 3);
  }, [goalProgress, achievements, personality]);

  const metricCircles = useMemo(() => [
    {
      id: 'glucose',
      icon: '🩸',
      label: 'Şeker',
      value: glucoseStats.lastValue ?? '-',
      unit: glucoseStats.lastValue ? 'mg/dL' : '',
      hint: glucoseStats.time || 'Son ölçüm yok',
      color: '#ef4444',
    },
    {
      id: 'calories',
      icon: '🔥',
      label: 'Kalori',
      value: nutritionStats.calories || 0,
      unit: 'kkal',
      hint: `Hedef ${MACRO_GOALS.calories}`,
      color: '#f97316',
    },
    {
      id: 'steps',
      icon: '👟',
      label: 'Adım',
      value: goalProgress?.steps?.current || healthSummary?.totalSteps || 0,
      unit: '',
      hint: goalProgress?.steps?.target ? `Hedef ${goalProgress.steps.target}` : 'Güncel hedef yok',
      color: '#10b981',
    },
    {
      id: 'heart',
      icon: '💓',
      label: 'Nabız',
      value: healthSummary?.avgHeartRate || '-',
      unit: healthSummary?.avgHeartRate ? 'bpm' : '',
      hint: goalProgress?.heartRate?.inRange ? 'İdeal aralıkta' : 'Takip et',
      color: '#6366f1',
    },
  ], [glucoseStats, nutritionStats, goalProgress, healthSummary]);

  const handleNavigate = useCallback(
    (screen) => {
      if (!screen) return;
      navigation.navigate(screen);
    },
    [navigation]
  );

  const calorieRemaining = Math.max(0, MACRO_GOALS.calories - (nutritionStats.calories || 0));

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={["#050816", "#020617"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.backgroundGradient}
      >
        <MascotHeader
          showBack={false}
          theme="dark"
          onToggleTheme={null}
        />

        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#0ea5e9"
            />
          }
        >
          <View style={styles.heroCard}>
            <View style={styles.heroHeader}>
              <View>
                <Text style={styles.heroTitle}>Bugünün Özeti</Text>
                <Text style={styles.heroSubtitle}>
                  {goalProgress?.overallScore
                    ? `Genel skorun ${goalProgress.overallScore}%`
                    : 'Hedeflerini kontrol etmeyi unutma'}
                </Text>
              </View>
              {headerBadges.length > 0 && (
                <View style={styles.badgeRow}>
                  {headerBadges.map((badge) => (
                    <View key={badge.id} style={styles.badgeChip}>
                      <Text style={styles.badgeIcon}>{badge.icon}</Text>
                      <Text style={styles.badgeLabel}>{badge.label}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.metricGrid}>
              {metricCircles.map((card) => (
                <View key={card.id} style={styles.metricTile}>
                  <View style={[styles.metricCircle, { borderColor: card.color }]}> 
                    <Text style={styles.metricIconLarge}>{card.icon}</Text>
                    <Text style={styles.metricValue}>{card.value}</Text>
                    {card.unit ? <Text style={styles.metricUnit}>{card.unit}</Text> : null}
                  </View>
                  <Text style={styles.metricLabel}>{card.label}</Text>
                  <Text style={styles.metricHint}>{card.hint}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.weeklyCard}>
            <View style={styles.weeklyHeader}>
              <Text style={styles.sectionTitle}>Haftalık Çizelge</Text>
              <View style={styles.weekControls}>
                <Pressable style={styles.weekButton} onPress={() => shiftWeek(-1)}>
                  <Text style={styles.weekButtonText}>◀</Text>
                </Pressable>
                <Text style={styles.weekRange}>{weekRangeLabel}</Text>
                <Pressable style={styles.weekButton} onPress={() => shiftWeek(1)}>
                  <Text style={styles.weekButtonText}>▶</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.weeklyRow}>
              {weekDays.map((day) => {
                const meta = day.status ? STATUS_META[day.status] : STATUS_META.default;
                return (
                  <Pressable
                    key={day.key}
                    style={[
                      styles.weekDayTile,
                      { borderColor: meta.color },
                    ]}
                    onPress={() => handleToggleDayStatus(day.key)}
                  >
                    <Text style={[styles.weekDayLabel, { color: meta.color }]}>{day.label}</Text>
                    <Text style={styles.weekDayEmoji}>{meta.emoji}</Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.weekHint}>Emoji seçimleri motivasyon günlüğüne kaydedilir.</Text>
          </View>

          <TodaySummaryCard
            eaten={nutritionStats.calories || 0}
            remaining={calorieRemaining}
            burned={healthSummary?.totalCalories || 0}
            carbs={{ current: nutritionStats.carbs || 0, target: MACRO_GOALS.carbs }}
            protein={{ current: nutritionStats.protein || 0, target: MACRO_GOALS.protein }}
            fat={{ current: nutritionStats.fat || 0, target: MACRO_GOALS.fat }}
            diamonds={goalProgress?.overallScore || 0}
            streak={achievements?.streak || 0}
            week={getWeekNumber(new Date())}
          />

          {goalProgress && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Bugünkü Hedefler</Text>
                <Text style={styles.sectionSubtitle}>
                  {goalProgress.totalAchieved}/{goalProgress.totalGoals} tamamlandı
                </Text>
              </View>
              <ProgressBar
                label="Adım"
                value={goalProgress.steps.current}
                max={goalProgress.steps.target}
                color="#0ea5e9"
              />
              <ProgressBar
                label="Kalori"
                value={goalProgress.calories.current}
                max={goalProgress.calories.target}
                color="#22c55e"
                unit=" kkal"
              />
              <ProgressBar
                label="Glukoz Aralık"
                value={goalProgress.glucose.inRangeCount}
                max={goalProgress.glucose.totalCount || 1}
                color="#f97316"
              />
            </View>
          )}

          <WaterTracker />
          <ActivitiesCard onConnect={() => handleNavigate('HealthSync')} />
          <MilestoneCard
            days={Math.min(achievements?.streak || 0, 7)}
            onCommit={() => handleNavigate('Achievements')}
          />

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
              <Pressable onPress={() => handleNavigate('MainMenu')}>
                <Text style={styles.sectionLink}>Menü</Text>
              </Pressable>
            </View>
            <View style={styles.quickGrid}>
              {quickActions.map((action) => (
                <Pressable
                  key={action.id}
                  style={[styles.quickTile, { borderColor: `${action.color}55` }]}
                  onPress={() => handleNavigate(action.id)}
                >
                  <Text style={styles.quickIcon}>{action.icon}</Text>
                  <Text style={styles.quickLabel}>{action.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Bildirimler</Text>
            </View>
            {notifications.length === 0 && (
              <Text style={styles.muted}>Bugün için yeni bildirim yok. İyi gidiyorsun!</Text>
            )}
            {notifications.map((notif, index) => (
              <View
                key={`${notif.title}-${index}`}
                style={[styles.notificationCard, styles[`notification${notif.type || 'info'}`]]}
              >
                <Text style={styles.notificationTitle}>
                  {notif.icon || '🔔'} {notif.title}
                </Text>
                <Text style={styles.notificationMessage}>{notif.message}</Text>
              </View>
            ))}
          </View>

          <View style={styles.menuGrid}>
            {menuOptions.map((option) => (
              <Pressable
                key={option.id}
                style={[styles.menuCard, { borderLeftColor: option.color }]}
                onPress={() => handleNavigate(option.id)}
              >
                <Text style={styles.menuEmoji}>{option.title.split(' ')[0]}</Text>
                <Text style={styles.menuTitle}>{option.title.replace(/^.*\s/, '')}</Text>
                <Text style={styles.menuLink}>Aç →</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
        <BottomNavBar navigation={navigation} activeKey="Main" />
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backgroundGradient: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 140,
  },
  heroCard: {
    backgroundColor: 'rgba(15,23,42,0.75)',
    borderRadius: 32,
    padding: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 30 },
    shadowOpacity: 0.45,
    shadowRadius: 40,
    elevation: 12,
    overflow: 'hidden',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#f9fafb',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#cbd5f5',
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    maxWidth: '55%',
    justifyContent: 'flex-end',
  },
  badgeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    shadowColor: '#22c55e',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
  },
  badgeIcon: {
    fontSize: 14,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  metricTile: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.35,
    shadowRadius: 30,
    elevation: 10,
  },
  metricCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricIconLarge: {
    fontSize: 24,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f9fafb',
  },
  metricUnit: {
    fontSize: 12,
    color: '#9ca3af',
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  metricHint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  weeklyCard: {
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.45)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 10,
  },
  weeklyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  weekControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weekButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.5)',
  },
  weekButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e5e7eb',
  },
  weekRange: {
    fontSize: 13,
    color: '#9ca3af',
  },
  weeklyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  weekDayTile: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(15,23,42,0.95)',
  },
  weekDayLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e5e7eb',
  },
  weekDayEmoji: {
    fontSize: 20,
  },
  weekHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748b',
  },
  sectionCard: {
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.45)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 24 },
    shadowOpacity: 0.42,
    shadowRadius: 30,
    elevation: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e5e7eb',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: '600',
    color: '#38bdf8',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  quickTile: {
    width: '30%',
    borderRadius: 20,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    backgroundColor: 'rgba(15,23,42,0.9)',
  },
  quickIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickLabel: {
    fontSize: 13,
    color: '#e5e7eb',
    fontWeight: '600',
  },
  muted: {
    fontSize: 13,
    color: '#64748b',
  },
  notificationCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  notificationinfo: {
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.6)',
  },
  notificationwarning: {
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(249,115,22,0.7)',
  },
  notificationsuccess: {
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.7)',
  },
  notificationdanger: {
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.7)',
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e5e7eb',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: '#9ca3af',
  },
  menuList: {
    gap: 12,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  menuCard: {
    width: '48%',
    backgroundColor: 'rgba(15,23,42,0.92)',
    borderRadius: 20,
    borderLeftWidth: 6,
    paddingVertical: 16,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 10,
    borderColor: 'rgba(148,163,184,0.7)',
    borderWidth: 1,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  menuInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e5e7eb',
  },
  menuEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  menuLink: {
    fontSize: 13,
    color: '#38bdf8',
    fontWeight: '600',
  },
});

export default MainScreen;
