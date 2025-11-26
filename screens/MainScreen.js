import React, { useEffect, useMemo, useState } from 'react';
import NutritionTracker from './NutritionTracker';
import ExerciseSuggestions from '../components/ExerciseSuggestions';
import WaterTracker from '../components/WaterTracker';
import DietCalendar from '../components/DietCalendar';
import MiniAssistant from '../components/MiniAssistant';
import BloodSugarQuickCard from '../components/BloodSugarQuickCard';
import { useRoute } from '@react-navigation/native';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getDietSummaries, saveDietSummary } from '../logic/dietCalendarStorage';

const getDayStatus = (calories, limit) => {
  const diff = calories - limit;
  if (diff <= 0) return 'healthy';
  if (diff >= 400) return 'cheat';
  return 'unhealthy';
};

const MainScreen = ({ navigation }) => {
  const route = useRoute();
  const stats = route.params?.stats || { calories: 0, sugar: 0, protein: 0, fat: 0 };
  const calorieLimit = route.params?.calorieLimit || 2000;
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [assistantVisible, setAssistantVisible] = useState(false);
  const [dietSummaries, setDietSummaries] = useState({});

  // Günlük istatistikleri stats üzerinden kullanacağız
  const dailyStats = stats;

  // Günün önerisi
  const tips = [
    'Bugün ekstra 2 bardak su içmeyi dene 🚰',
    'Ana öğünlerine mutlaka sebze ekle 🌿',
    'Akşam yemeğinden sonra 15 dakikalık yürüyüş iyi gelir 🚶‍♀️',
    'Şekeri azaltmak için meyveyi tatlı yerine meyveyle değiştir 🍎',
    'Gün içinde 10 dakikalık esneme hareketleri yapmayı dene 🤸‍♀️',
  ];

  const dailyTip = useMemo(
    () => tips[new Date().getDate() % tips.length],
    []
  );

  // Haftalık hedef ilerlemesi (şimdilik örnek)
  const weeklyProgress = 0.45; // 0–1 arası

  // Haftalık kalori grafiği için örnek veriler
  const weeklyCalories = [1800, 1950, 2100, 1700, 2000, 1900, 1850];
  const maxWeeklyCal = Math.max(...weeklyCalories);

  // Motivasyon rozetleri
  const badges = useMemo(() => {
    const list = [];

    if (dailyStats.sugar > 0 && dailyStats.sugar <= 50) {
      list.push('Şeker Kontrolü 🧁');
    }
    if (dailyStats.protein >= 60) {
      list.push('Protein Şampiyonu 💪');
    }
    if (dailyStats.calories > 0 && dailyStats.calories <= 2000) {
      list.push('Kalori Dengesi ⚖️');
    }
    if (list.length === 0) {
      list.push('Bugün ilk hedefini birlikte belirleyelim 💚');
    }
    return list;
  }, [dailyStats]);

  const [height, setHeight] = useState(''); // cm
  const [weight, setWeight] = useState(''); // kg

  const { bmi, bmiCategory } = useMemo(() => {
    const h = parseFloat(height.replace(',', '.'));
    const w = parseFloat(weight.replace(',', '.'));
    if (!h || !w) return { bmi: null, bmiCategory: '—' };

    const meter = h / 100;
    const value = w / (meter * meter);

    let cat = '';
    if (value < 18.5) cat = 'Zayıf';
    else if (value < 25) cat = 'Normal';
    else if (value < 30) cat = 'Fazla kilolu';
    else cat = 'Obez';

    return { bmi: value.toFixed(1), bmiCategory: cat };
  }, [height, weight]);

  useEffect(() => {
    let mounted = true;
    const loadSummaries = async () => {
      const stored = await getDietSummaries();
      if (mounted) {
        setDietSummaries(stored);
      }
    };
    loadSummaries();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const caloriesValue = Number(stats?.calories || 0);
    if (!Number.isFinite(caloriesValue) || caloriesValue <= 0) {
      return;
    }
    const todayKey = new Date().toISOString().slice(0, 10);
    const summaryPayload = {
      status: getDayStatus(caloriesValue, calorieLimit),
      calories: Math.round(caloriesValue),
    };
    const existing = dietSummaries[todayKey];
    if (
      existing &&
      existing.status === summaryPayload.status &&
      existing.calories === summaryPayload.calories
    ) {
      return;
    }
    const persist = async () => {
      const updated = await saveDietSummary(todayKey, summaryPayload);
      if (updated) {
        setDietSummaries(updated);
      }
    };
    persist();
  }, [stats, calorieLimit, dietSummaries]);

  const assistantPrompts = useMemo(
    () => [
      'Bugünkü kalori dengesini nasıl iyileştirebilirim?',
      'Akşam için hafif bir öğün önerir misin?',
      'Şeker tüketimimi düşürmek için ne yapmalıyım?',
    ],
    []
  );

  const menuOptions = [
    {
      id: 1,
      title: '🍽️ Diyet Planı Oluştur',
      description: 'Sağlıklı yiyeceklerle kendi diyet planını oluştur',
      color: '#4CAF50',
      screen: 'DietPlan',
    },
    {
      id: 2,
      title: '🥗 Sağlıklı Tarifler',
      description: 'Bowl tarifleri, şekersiz tatlılar ve daha fazlası',
      color: '#FF9800',
      screen: 'HealthyRecipes',
    },
    {
      id: 3,
      title: '🔍 Malzemeden Tarif Bul',
      description: 'Elindeki malzemelerle yapabileceğin tarifleri keşfet',
      color: '#2196F3',
      screen: 'IngredientSearch',
    },
    {
      id: 4,
      title: '🏃‍♀️ Egzersiz Önerileri',
      description: 'Kalori dengesine göre hazır egzersiz listelerini incele',
      color: '#3b82f6',
      screen: 'ExerciseLibrary',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#E8F5E9', '#F5F7FA']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Başlık */}
          <View style={styles.header}>
            <View style={styles.headerTextBlock}>
              <Text style={styles.headerTitle}>Sağlıklı Yaşam</Text>
              <Text style={styles.headerSubtitle}>Beslenme asistanına hoş geldin!</Text>
            </View>
            <View style={styles.headerActions}>
              <Pressable
                style={styles.headerIconButton}
                accessibilityRole="button"
                onPress={() => setAssistantVisible(true)}
              >
                <Text style={styles.headerIconText}>🤖</Text>
              </Pressable>
              <Pressable
                style={styles.headerIconButton}
                accessibilityRole="button"
                onPress={() => setCalendarVisible(true)}
              >
                <Text style={styles.headerIconText}>📆</Text>
              </Pressable>
            </View>
          </View>

          {/* 2️⃣ Günlük Besin Özeti (NutritionTracker) */}
          <NutritionTracker
            calories={stats.calories}
            sugar={stats.sugar}
            protein={stats.protein}
            fat={stats.fat}
          />

          <BloodSugarQuickCard
            onOpenDetail={() => navigation.navigate('BloodSugar')}
            onOpenEmergency={payload => navigation.navigate('Emergency', payload)}
          />

          {/* 3️⃣ Günün Önerisi */}
          <Text style={styles.sectionTitle}>Günün Önerisi</Text>
          <View style={styles.tipCard}>
            <Text style={styles.tipText}>{dailyTip}</Text>
          </View>

          {/* 4️⃣ Haftalık Hedef Takibi */}
          <Text style={styles.sectionTitle}>Haftalık Hedef Takibi</Text>
          <View style={styles.goalCard}>
            <Text style={styles.goalTitle}>Haftalık planına uyum</Text>
            <Text style={styles.goalSub}>
              Hedef: 7 günün en az 5&apos;inde plana uymak
            </Text>
            <View style={styles.progressBarBackground}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${Math.min(100, Math.max(0, weeklyProgress * 100))}%` },
                ]}
              />
            </View>
            <Text style={styles.goalPercent}>
              %{(weeklyProgress * 100).toFixed(0)} tamamlandı
            </Text>
          </View>

          {/* 5️⃣ Haftalık Kalori Grafiği */}
          <Text style={styles.sectionTitle}>Haftalık Kalori Grafiği</Text>
          <View style={styles.chartCard}>
            {weeklyCalories.map((value, index) => (
              <View style={styles.chartRow} key={index}>
                <Text style={styles.chartLabel}>Gün {index + 1}</Text>
                <View style={styles.chartBarBackground}>
                  <View
                    style={[
                      styles.chartBarFill,
                      { width: `${(value / maxWeeklyCal) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.chartValue}>{value} kcal</Text>
              </View>
            ))}
          </View>

          <ExerciseSuggestions totalCalories={stats.calories} limit={calorieLimit} />

          <WaterTracker />

          {/* BMI Hesaplayıcı (8. fikirdi ama bence burada çok güzel durur) */}
          <Text style={styles.sectionTitle}>Vücut Kitle İndeksi (BMI)</Text>
          <View style={styles.bmiCard}>
            <View style={styles.bmiRow}>
              <View style={styles.bmiField}>
                <Text style={styles.bmiLabel}>Boy (cm)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                  placeholder="Örn: 170"
                />
              </View>
              <View style={styles.bmiField}>
                <Text style={styles.bmiLabel}>Kilo (kg)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="Örn: 65"
                />
              </View>
            </View>
            <View style={styles.bmiResultRow}>
              <Text style={styles.bmiResultLabel}>BMI:</Text>
              <Text style={styles.bmiResultValue}>
                {bmi !== null ? bmi : '—'}
              </Text>
              <Text style={styles.bmiResultCategory}>{bmiCategory}</Text>
            </View>
            <Text style={styles.bmiInfo}>
              18.5–24.9 arası değerler genellikle &quot;normal&quot; kabul edilir.
              Kişisel durumun için mutlaka uzman görüşü al.
            </Text>
          </View>

          {/* 6️⃣ Motivasyon Rozetleri */}
          <Text style={styles.sectionTitle}>Rozetlerin</Text>
          <View style={styles.badgeRow}>
            {badges.map((badge, idx) => (
              <View style={styles.badge} key={idx}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            ))}
          </View>

          {/* Ana menü kartları */}
          {menuOptions.map(option => (
            <Pressable
              key={option.id}
              style={[styles.menuCard, { borderLeftColor: option.color }]}
              onPress={() => navigation.navigate(option.screen)}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F8F9FA']}
                style={styles.menuGradient}
              >
                <Text style={styles.menuTitle}>{option.title}</Text>
                <Text style={styles.menuDescription}>{option.description}</Text>
                <View style={[styles.menuBadge, { backgroundColor: option.color }]}>
                  <Text style={styles.menuBadgeText}>Başla →</Text>
                </View>
              </LinearGradient>
            </Pressable>
          ))}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              💚 Sağlıklı beslenerek hayat kalitenizi artırın
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
      <DietCalendar
        visible={calendarVisible}
        summaries={dietSummaries}
        onClose={() => setCalendarVisible(false)}
      />
      <MiniAssistant
        visible={assistantVisible}
        onClose={() => setAssistantVisible(false)}
        stats={{
          calories: Math.round(stats.calories || 0),
          sugar: Math.round(stats.sugar || 0),
        }}
        prompts={assistantPrompts}
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 10,
  },
  headerTextBlock: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e5f3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
    fontSize: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#2C3E50',
  },
  tipCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#1B5E20',
  },
  goalCard: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 12,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  goalSub: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 8,
  },
  progressBarBackground: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    backgroundColor: '#E0E0E0',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#4CAF50',
  },
  goalPercent: {
    marginTop: 6,
    fontSize: 12,
    color: '#616161',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  chartLabel: {
    width: 50,
    fontSize: 12,
    color: '#757575',
  },
  chartBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 999,
    marginHorizontal: 6,
    overflow: 'hidden',
  },
  chartBarFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#42A5F5',
  },
  chartValue: {
    width: 70,
    fontSize: 11,
    color: '#616161',
    textAlign: 'right',
  },
  bmiCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  bmiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bmiField: {
    flex: 1,
    marginRight: 8,
  },
  bmiLabel: {
    fontSize: 12,
    marginBottom: 4,
    color: '#4B5563',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
  },
  bmiResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  bmiResultLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  bmiResultValue: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
  },
  bmiResultCategory: {
    fontSize: 14,
    color: '#16A34A',
  },
  bmiInfo: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 6,
    marginBottom: 6,
  },
  badgeText: {
    fontSize: 12,
    color: '#4338CA',
  },
  menuCard: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 6,
  },
  menuGradient: {
    padding: 20,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  menuDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 16,
    lineHeight: 20,
  },
  menuBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  menuBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: 10,
    padding: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  footerText: {
    fontSize: 14,
    color: '#2E7D32',
    textAlign: 'center',
  },
});

export default MainScreen;
