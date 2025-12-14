import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  RefreshControl,
  Platform,
  Alert,
} from 'react-native';
import Svg, { Circle, Path, G, Rect } from 'react-native-svg';
import BottomNavBar from '../components/BottomNavBar';
import { useTheme } from '../context/ThemeContext';

// Apple Health entegrasyonu
let appleHealthSync = null;
if (Platform.OS === 'ios') {
  try {
    appleHealthSync = require('../logic/appleHealthSync').default;
  } catch (error) {
    console.log('Apple Health paketi bulunamadı');
  }
}

const MainScreen = ({ navigation }) => {
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [waterCount, setWaterCount] = useState(0);
  const [stepsCount, setStepsCount] = useState(5847);
  const [caloriesConsumed, setCaloriesConsumed] = useState(1240);
  const [activeMinutes, setActiveMinutes] = useState(32);
  const [heartRate, setHeartRate] = useState(72);
  const [sleepData, setSleepData] = useState('7sa 24dk');
  const [healthSyncEnabled, setHealthSyncEnabled] = useState(false);

  const CALORIE_GOAL = 2000;
  const STEPS_GOAL = 10000;
  const WATER_GOAL = 8;

  // Apple Health'i başlat
  useEffect(() => {
    const setupAppleHealth = async () => {
      if (Platform.OS !== 'ios' || !appleHealthSync) {
        console.log('💡 Apple Health sadece iOS cihazlarda kullanılabilir');
        return;
      }

      try {
        await appleHealthSync.initAppleHealth();
        setHealthSyncEnabled(true);
        await syncHealthData();
        console.log('✅ Apple Health başarıyla bağlandı');
      } catch (error) {
        console.log('⚠️ Apple Health başlatılamadı:', error);
        Alert.alert(
          'Apple Health',
          'Sağlık verilerinizi senkronize etmek için Apple Health erişimine izin verin.',
          [{ text: 'Tamam' }]
        );
      }
    };

    setupAppleHealth();

    // Her 5 dakikada bir otomatik senkronizasyon
    const interval = setInterval(() => {
      if (healthSyncEnabled && appleHealthSync) {
        syncHealthData();
      }
    }, 300000); // 5 dakika

    return () => clearInterval(interval);
  }, [healthSyncEnabled]);

  // Sağlık verilerini senkronize et
  const syncHealthData = async () => {
    if (!appleHealthSync) return;

    try {
      const healthData = await appleHealthSync.syncAllHealthData();
      
      setStepsCount(healthData.steps || 0);
      setWaterCount(healthData.water?.glasses || 0);
      setHeartRate(healthData.heartRate || 72);
      setSleepData(healthData.sleep?.formatted || '0sa 0dk');
      
      // Yakılan kalorileri aktif dakikaya çevir
      if (healthData.calories) {
        setActiveMinutes(Math.round(healthData.calories / 10));
      }

      console.log('✅ Sağlık verileri güncellendi:', {
        adım: healthData.steps,
        su: healthData.water?.glasses,
        kalp: healthData.heartRate,
        uyku: healthData.sleep?.formatted
      });
    } catch (error) {
      console.log('⚠️ Sağlık verileri çekilemedi:', error);
    }
  };

  // Su tüketimini artır ve Apple Health'e kaydet
  const handleWaterPress = async () => {
    const newCount = waterCount + 1;
    setWaterCount(newCount);
    
    // Apple Health'e kaydet
    if (appleHealthSync && healthSyncEnabled) {
      try {
        await appleHealthSync.saveWaterIntake(250); // 1 bardak = 250ml
        console.log('✅ Su tüketimi Apple Health\'e kaydedildi');
      } catch (error) {
        console.log('⚠️ Su kaydedilemedi:', error);
      }
    } else {
      console.log('💧 Su tüketimi:', newCount, 'bardak');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (appleHealthSync && healthSyncEnabled) {
      await syncHealthData();
    }
    await new Promise(resolve => setTimeout(resolve, 800));
    setRefreshing(false);
  };

  // Activity Rings (Apple Watch style)
  const rings = [
    { 
      id: 'move',
      progress: caloriesConsumed / CALORIE_GOAL,
      color: '#FF3B30',
      label: 'Kalori',
      value: caloriesConsumed,
      goal: CALORIE_GOAL,
      unit: 'kkal'
    },
    { 
      id: 'exercise',
      progress: activeMinutes / 60,
      color: '#32D74B',
      label: 'Egzersiz',
      value: activeMinutes,
      goal: 60,
      unit: 'dk'
    },
    { 
      id: 'stand',
      progress: waterCount / WATER_GOAL,
      color: '#0A84FF',
      label: 'Su',
      value: waterCount,
      goal: WATER_GOAL,
      unit: 'bardak'
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor="#0A84FF"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* iOS 18 Large Title Header */}
        <View style={[styles.headerSection, { backgroundColor: colors.background }]}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.largeTitle, { color: colors.text }]}>Özet</Text>
              <Text style={[styles.dateSubtitle, { color: colors.secondaryText }]}>{new Date().toLocaleDateString('tr-TR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}</Text>
            </View>
            <Pressable onPress={toggleTheme} style={styles.themeToggle}>
              <Text style={styles.themeIcon}>{isDarkMode ? '☀️' : '🌙'}</Text>
            </Pressable>
          </View>
        </View>

        {/* Günlük Hedef Tamamlama Mesajı */}
        {waterCount >= WATER_GOAL && (
          <View style={[styles.achievementBanner, { backgroundColor: colors.success + '15', borderColor: colors.success }]}>
            <Text style={styles.achievementIcon}>🎉</Text>
            <Text style={[styles.achievementText, { color: colors.success }]}>
              Tebrikler! Günlük su hedefini tamamladın!
            </Text>
          </View>
        )}

        {/* Activity Rings Card - Apple Health Style */}
        <View style={[styles.ringsCard, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.ringsContainer}>
            <ActivityRings rings={rings} />
          </View>
          <View style={styles.ringsStats}>
            {rings.map(ring => (
              <View key={ring.id} style={styles.ringStatRow}>
                <View style={[styles.ringDot, { backgroundColor: ring.color }]} />
                <Text style={[styles.ringStatLabel, { color: colors.text }]}>{ring.label}</Text>
                <Text style={[styles.ringStatValue, { color: colors.secondaryText }]}>
                  {ring.value} / {ring.goal} {ring.unit}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Health Metrics Grid */}
        <View style={styles.metricsGrid}>
          <MetricCard
            icon="water"
            value={waterCount}
            unit="bardak"
            label="Su"
            color="#0A84FF"
            goal={WATER_GOAL}
            onPress={handleWaterPress}
            colors={colors}
          />
          <MetricCard
            icon="steps"
            value={stepsCount.toLocaleString()}
            unit="adım"
            label="Adımlar"
            color="#32D74B"
            colors={colors}
          />
          <MetricCard
            icon="heart"
            value={heartRate}
            unit="bpm"
            label="Kalp Atışı"
            color="#FF3B30"
            colors={colors}
          />
          <MetricCard
            icon="sleep"
            value={sleepData}
            unit=""
            label="Uyku"
            color="#BF5AF2"
            colors={colors}
          />
        </View>

        {/* Quick Actions - iOS Style */}
        <View style={styles.quickActionsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Hızlı İşlemler</Text>
          <View style={styles.quickActionsGrid}>
            <QuickActionButton
              icon="meal"
              label="Yemek Ekle"
              color="#FF9500"
              onPress={() => navigation.navigate('AddMeal')}
              colors={colors}
            />
            <QuickActionButton
              icon="glucose"
              label="Şeker Ölç"
              color="#FF3B30"
              onPress={() => navigation.navigate('BloodSugar')}
              colors={colors}
            />
            <QuickActionButton
              icon="exercise"
              label="Egzersiz"
              color="#32D74B"
              onPress={() => {}}
              colors={colors}
            />
            <QuickActionButton
              icon="chart"
              label="İstatistik"
              color="#0A84FF"
              onPress={() => navigation.navigate('LibreStats')}
              colors={colors}
            />
          </View>
        </View>

        {/* Today's Summary */}
        <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Bugünün Özeti</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>Alınan Kalori</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{caloriesConsumed} kkal</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>Kalan Kalori</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{CALORIE_GOAL - caloriesConsumed} kkal</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>Aktif Dakika</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{activeMinutes} dk</Text>
          </View>
        </View>

        {/* Menu Cards */}
        <View style={styles.menuSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Sağlık & Fitness</Text>
          {[
            { title: 'Diyet Planı', icon: 'calendar', screen: 'DietPlanner', color: '#FF9500' },
            { title: 'Sağlıklı Tarifler', icon: 'meal', screen: 'HealthyRecipes', color: '#32D74B' },
            { title: 'Glukoz Takibi', icon: 'heart', screen: 'GlucoseCalendar', color: '#FF3B30' },
            { title: 'Ayarlar', icon: 'settings', screen: 'Profile', color: '#8E8E93' },
          ].map((item, index) => (
            <Pressable
              key={index}
              style={[styles.menuCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: item.color + '15' }]}>
                <HealthIcon name={item.icon} size={24} color={item.color} />
              </View>
              <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
              <Svg width={20} height={20} viewBox="0 0 24 24">
                <Path d="M9 6l6 6-6 6" stroke={colors.secondaryText} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </Pressable>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
      <BottomNavBar navigation={navigation} activeKey="Main" />
    </SafeAreaView>
  );
};

// Health Icon Component - Apple Health Style
const HealthIcon = ({ name, size = 24, color = '#000' }) => {
  const iconPaths = {
    water: "M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z",
    steps: "M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7",
    heart: "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z",
    sleep: "M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 0 1-4.4 2.26 5.403 5.403 0 0 1-3.14-9.8c-.44-.06-.9-.1-1.36-.1z",
    meal: "M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z",
    glucose: "M19.8 18.4L14 10.67V6.5l1.35-1.69c.26-.33.03-.81-.39-.81H9.04c-.42 0-.65.48-.39.81L10 6.5v4.17L4.2 18.4c-.49.66-.02 1.6.8 1.6h14c.82 0 1.29-.94.8-1.6z",
    exercise: "M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z",
    chart: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
    calendar: "M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm-8 4H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z",
    settings: "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={iconPaths[name]} fill={color} />
    </Svg>
  );
};

// Activity Rings Component (Apple Watch style)
const ActivityRings = ({ rings }) => {
  const size = 180;
  const strokeWidth = 14;
  const spacing = 10;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {rings.map((ring, index) => {
          const radius = (size / 2) - (strokeWidth / 2) - (index * (strokeWidth + spacing));
          const circumference = 2 * Math.PI * radius;
          const offset = circumference * (1 - ring.progress);

          return (
            <React.Fragment key={ring.id}>
              {/* Background ring */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={ring.color + '20'}
                strokeWidth={strokeWidth}
                fill="none"
              />
              {/* Progress ring */}
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={ring.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${size / 2}, ${size / 2}`}
              />
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
};

// Metric Card Component
const MetricCard = ({ icon, value, unit, label, color, onPress, goal, colors }) => {
  const isWater = icon === 'water';
  const progress = isWater && goal ? Math.min(value / goal, 1) : null;
  const extraProgress = isWater && goal && value > goal ? (value - goal) / goal : 0;
  
  return (
    <Pressable style={[styles.metricCard, { backgroundColor: colors?.cardBackground || '#FFFFFF' }]} onPress={onPress}>
      <View style={[styles.iconCircle, { backgroundColor: color }]}>
        <HealthIcon name={icon} size={28} color="#FFFFFF" />
      </View>
      <Text style={[styles.metricValue, { color: colors?.text || '#000000' }]}>{value}</Text>
      {unit ? <Text style={[styles.metricUnit, { color: colors?.secondaryText || '#8E8E93' }]}>{unit}</Text> : null}
      <Text style={[styles.metricLabel, { color: colors?.secondaryText || '#8E8E93' }]}>{label}</Text>
      
      {/* Su takibi için özel progress bar */}
      {isWater && progress !== null && (
        <View style={styles.waterProgressContainer}>
          <View style={styles.waterProgressTrack}>
            {/* İlk 8 bardak - açık mavi */}
            <View 
              style={[
                styles.waterProgressFill,
                { 
                  width: `${progress * 100}%`,
                  backgroundColor: color
                }
              ]} 
            />
            {/* 8'den sonraki bardaklar - koyu mavi */}
            {value > goal && (
              <View 
                style={[
                  styles.waterProgressExtra,
                  { 
                    width: `${Math.min(extraProgress * 100, 100)}%`,
                    backgroundColor: '#0055CC' // Daha koyu mavi
                  }
                ]} 
              />
            )}
          </View>
        </View>
      )}
    </Pressable>
  );
};

// Quick Action Button
const QuickActionButton = ({ icon, label, color, onPress, colors }) => (
  <Pressable style={styles.quickActionBtn} onPress={onPress}>
    <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
      <HealthIcon name={icon} size={32} color="#FFFFFF" />
    </View>
    <Text style={[styles.quickActionLabel, { color: colors?.text || '#000000' }]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7', // iOS system background
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  themeToggle: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(142, 142, 147, 0.12)',
  },
  themeIcon: {
    fontSize: 24,
  },
  achievementBanner: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  achievementIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  achievementText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: 0.374,
    marginBottom: 4,
  },
  dateSubtitle: {
    fontSize: 15,
    color: '#8E8E93',
    fontWeight: '400',
  },
  ringsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 20,
    padding: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  ringsContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ringsStats: {
    gap: 12,
  },
  ringStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ringDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  ringStatLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#000000',
  },
  ringStatValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 2,
  },
  metricUnit: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E8E93',
    textAlign: 'center',
  },
  waterProgressContainer: {
    width: '100%',
    marginTop: 12,
  },
  waterProgressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    overflow: 'hidden',
    position: 'relative',
  },
  waterProgressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: 3,
  },
  waterProgressExtra: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: 3,
  },
  quickActionsSection: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 12,
    paddingLeft: 4,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  quickActionBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  quickActionIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#000000',
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 24,
    borderRadius: 20,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  summaryLabel: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '400',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8E8E93',
  },
  menuSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});

export default MainScreen;
