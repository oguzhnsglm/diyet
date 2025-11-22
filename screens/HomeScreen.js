import React, { useContext } from 'react';
import { SafeAreaView, ScrollView, Text, View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { DietContext } from '../context/DietContext';
import { SummaryCard, PrimaryButton } from '../components/common';
import { formatDateTR, getTodayISO } from '../logic/utils';
import { styles, colors } from '../styles';

const HomeScreen = ({ navigation }) => {
  const { user, meals, refreshTodayMeals, reloadUser, loading } = useContext(DietContext);

  useFocusEffect(
    React.useCallback(() => {
      refreshTodayMeals();
      reloadUser();
    }, [refreshTodayMeals, reloadUser])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.containerCenter}>
        <Text style={{ color: colors.primary, fontSize: 16 }}>Yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.containerCenter}>
        <Text style={{ color: colors.text, marginBottom: 16, fontSize: 16 }}>Kullanıcı profili bulunamadı.</Text>
        <PrimaryButton label="Yeni profil oluştur" onPress={() => navigation.replace('Onboarding')} />
      </SafeAreaView>
    );
  }

  const totalCalories = meals.reduce((sum, m) => sum + Number(m.calories || 0), 0);
  const totalSugar = meals.reduce((sum, m) => sum + Number(m.sugarGrams || 0), 0);
  const remainingCalories = user.dailyCalorieTarget - totalCalories;
  const remainingSugar = user.dailySugarLimitGr - totalSugar;

  // Color logic per spec
  const calorieColor = '#0284c7'; // Blue for total taken (HTML spec)
  const remainingCalorieColor = '#16a34a'; // Green (HTML spec)
  const sugarTakenColor = '#a855f7'; // Purple (HTML spec)
  const remainingSugarColor = '#16a34a'; // Green (HTML spec default)

  const overLimit = remainingCalories < 0 || remainingSugar < 0;

  const handleWaterTracking = () => {
    Alert.alert('Su Takibi', 'Su takibi henüz eklenmedi. Yakında geliyor!');
  };

  const StatCard = ({ label, value, sub, color }) => (
    <View style={dashboardStyles.statCard}>
      <Text style={dashboardStyles.statLabel}>{label}</Text>
      <Text style={[dashboardStyles.statValue, { color }]}>{value}</Text>
      {!!sub && <Text style={dashboardStyles.statSub}>{sub}</Text>}
    </View>
  );

  const ActionCard = ({ title, desc, onPress, accent }) => (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[dashboardStyles.actionCard, { borderColor: accent }]}> 
      <View style={dashboardStyles.actionAccentBar} />
      <Text style={dashboardStyles.actionTitle}>{title}</Text>
      <Text style={dashboardStyles.actionDesc}>{desc}</Text>
    </TouchableOpacity>
  );

  const featureOptions = [
    {
      id: 1,
      title: '🍽️ Diyet Planı Oluştur',
      description: 'Sağlıklı yiyeceklerle kendi diyet planını oluştur',
      color: '#4CAF50',
      action: () => navigation.navigate('DietPlanner'),
    },
    {
      id: 2,
      title: '🥗 Sağlıklı Tarifler',
      description: 'Bowl tarifleri, şekersiz tatlılar ve daha fazlası',
      color: '#FF9800',
      action: () => navigation.navigate('HealthyRecipes'),
    },
    {
      id: 3,
      title: '🔍 Malzemeden Tarif Bul',
      description: 'Elindeki malzemelerle yapabileceğin tarifleri keşfet',
      color: '#2196F3',
      action: () => navigation.navigate('IngredientSearch'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[colors.bgGradientStart, colors.bgGradientEnd]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
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
                <Text style={dashboardStyles.welcomeTitle}>Merhaba {user.name}!</Text>
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
              sub={`Hedef: ${user.dailyCalorieTarget} kcal`}
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
              sub={`Limit: ${user.dailySugarLimitGr} gr`}
              color={sugarTakenColor}
            />
            <StatCard
              label="KALAN ŞEKER LİMİTİ"
              value={`${remainingSugar} gr`}
              sub="Güvenli bölge"
              color={remainingSugarColor}
            />
          </View>

          {/* Action Cards */}
            <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
            <View style={dashboardStyles.actionsRow}>
              <ActionCard
                title="Diyet Planı"
                desc="Günlük planını oluştur veya güncelle"
                accent="#0ea5e9"
                onPress={() => navigation.navigate('DietPlanner')}
              />
              <ActionCard
                title="Öğün Ekle"
                desc="Yediğin öğünü hemen kaydet"
                accent="#6366f1"
                onPress={() => navigation.navigate('AddMeal')}
              />
            </View>
            <View style={dashboardStyles.actionsRow}>
              <ActionCard
                title="Öneriler"
                desc="Akıllı beslenme tavsiyeleri al"
                accent="#10b981"
                onPress={() => navigation.navigate('Recommendations', { remainingCalories, remainingSugar })}
              />
              <ActionCard
                title="Su Takibi"
                desc="Günlük su tüketimini takip et"
                accent="#38bdf8"
                onPress={handleWaterTracking}
              />
            </View>
            <View style={dashboardStyles.actionsRow}>
              <ActionCard
                title="Profil"
                desc="Kişisel hedef ve bilgilerini düzenle"
                accent="#f59e0b"
                onPress={() => navigation.navigate('Profile')}
              />
            </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default HomeScreen;

const dashboardStyles = StyleSheet.create({
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 25,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  welcomeDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 6,
  },
  badgeDanger: {
    backgroundColor: '#ffe4e6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeDangerText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '48%',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statSub: {
    fontSize: 13,
    color: '#6b7280',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    width: '48%',
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  actionAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  actionDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  featureCard: {
    borderRadius: 16,
    marginBottom: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderLeftWidth: 6,
    backgroundColor: '#fff',
  },
  featureInner: {
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 8,
  },
  featureDesc: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 14,
    lineHeight: 20,
  },
  featureBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  featureBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
