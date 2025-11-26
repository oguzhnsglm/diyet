import React, { useContext, useMemo } from 'react';
import { SafeAreaView, ScrollView, Text, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { DietContext } from '../context/DietContext';
import { SummaryCard, PrimaryButton } from '../components/common';
import { formatDateTR, getTodayISO } from '../logic/utils';
import { styles, colors } from '../styles';
import NutritionTracker from './NutritionTracker';

const localStyles = StyleSheet.create({
  exerciseCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
    marginBottom: 20,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  exerciseBullet: {
    fontSize: 16,
    marginRight: 6,
    color: '#1E88E5',
    marginTop: 2,
  },
  exerciseText: {
    flex: 1,
    fontSize: 13,
    color: '#1E3A8A',
  },
});

const HomeScreen = ({ navigation }) => {
  const { user, meals, refreshTodayMeals, reloadUser, loading } = useContext(DietContext);
  // Example stat values for demonstration
  const LIMITS = { calories: 2000, sugar: 50 };
  const totalCalories = 0;
  const remainingCalories = 0;
  const totalSugar = 0;
  const remainingSugar = 0;
  const calorieColor = '#0284c7';
  const remainingCalorieColor = '#16a34a';
  const sugarTakenColor = '#a855f7';
  const remainingSugarColor = '#16a34a';
  const exerciseSuggestions = [
    'Fazladan aldığın kaloriyi dengelemek için 10–15 dakikalık hafif bir yürüyüş iyi gelir 🚶‍♀️',
    'Şeker tüketimin bugün limitin üzerinde. Kan şekerini dengelemek için kısa bir yürüyüş ve bol su tüketimi faydalı olabilir 💧',
  ];
  const featureOptions = [];
  const overLimit = false;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[colors.bgGradientStart, colors.bgGradientEnd]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Nutrition Tracker Bileşeni */}
          <NutritionTracker />
          {/* Large Feature Cards (added per request) */}
          <View style={{ marginBottom: 24 }}>
            {featureOptions.map(opt => (
              <TouchableOpacity
                key={opt.id}
                activeOpacity={0.9}
                onPress={opt.action}
                style={[dashboardStyles.featureCard, { borderLeftColor: opt.color }]}
              >
                <View style={dashboardStyles.featureInner}>
                  <Text style={dashboardStyles.featureTitle}>{opt.title}</Text>
                  <Text style={dashboardStyles.featureDesc}>{opt.description}</Text>
                  <View style={[dashboardStyles.featureBadge, { backgroundColor: opt.color }]}> 
                    <Text style={dashboardStyles.featureBadgeText}>Başla →</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Welcome Card */}
          <View style={dashboardStyles.welcomeCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={dashboardStyles.welcomeTitle}>Merhaba!</Text>
                <Text style={dashboardStyles.welcomeDate}>{formatDateTR(getTodayISO())}</Text>
              </View>
              {overLimit && (
                <View style={dashboardStyles.badgeDanger}>
                  <Text style={dashboardStyles.badgeDangerText}>Dikkat</Text>
                </View>
              )}
            </View>
            <Text style={dashboardStyles.welcomeSubtitle}>Günlük beslenme hedeflerinizi takip edin</Text>
          </View>

          {/* Stats Grid */}
          <View style={dashboardStyles.statsGrid}>
            <StatCard
              label="TOPLAM ALINAN KALORİ"
              value={`${totalCalories} kcal`}
              sub={`Hedef: ${LIMITS.calories} kcal`}
              color={calorieColor}
            />
            <StatCard
              label="KALAN GÜNLÜK KALORİ"
              value={`${remainingCalories} kcal`}
              sub="Dengeyi koru"
              color={remainingCalorieColor}
            />
            <StatCard
              label="ALINAN ŞEKER"
              value={`${totalSugar} gr`}
              sub={`Limit: ${LIMITS.sugar} gr`}
              color={sugarTakenColor}
            />
            <StatCard
              label="KALAN ŞEKER LİMİTİ"
              value={`${remainingSugar} gr`}
              sub="Güvenli bölge"
              color={remainingSugarColor}
            />
          </View>

          {/* Egzersiz Önerileri */}
          <Text style={styles.sectionTitle}>Egzersiz Önerileri</Text>
          <View style={localStyles.exerciseCard}>
            {exerciseSuggestions.map((item, index) => (
              <View key={index} style={localStyles.exerciseItem}>
                <Text style={localStyles.exerciseBullet}>•</Text>
                <Text style={localStyles.exerciseText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Action Cards */}
          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          {/* ...action cards... */}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default HomeScreen;

// ...existing code...
// Egzersiz önerileri için stiller
// styles objesine eklenmeli
// Eğer styles dışarıdan geliyorsa, styles.js dosyasına ekleyin
// Burada doğrudan ekliyoruz

// ...existing code...
