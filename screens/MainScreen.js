
import React, { useMemo, useState } from 'react';
import NutritionTracker from './NutritionTracker';
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

const MainScreen = ({ navigation }) => {
  const route = useRoute();
  const stats = route.params?.stats || { calories: 0, sugar: 0, protein: 0, fat: 0 };

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
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#E8F5E9', '#F5F7FA']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Başlık */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Sağlıklı Yaşam</Text>
            <Text style={styles.headerSubtitle}>Beslenme asistanına hoş geldin!</Text>
          </View>

          {/* 2️⃣ Günlük Besin Özeti (NutritionTracker) */}
          <NutritionTracker
            calories={stats.calories}
            sugar={stats.sugar}
            protein={stats.protein}
            fat={stats.fat}
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
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
