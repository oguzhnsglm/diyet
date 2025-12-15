import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getPersonalizedInsights, getTwinData } from '../logic/digitalTwin';
import BottomNavBar from '../components/BottomNavBar';

const PersonalInsightsScreen = ({ navigation }) => {
  const [insights, setInsights] = useState([]);
  const [hacks, setHacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // İçgörüleri yükle
    const insightsList = await getPersonalizedInsights();
    setInsights(insightsList);

    // Diyabet hack'leri oluştur
    const data = await getTwinData();
    const generatedHacks = await generatePersonalHacks(data);
    setHacks(generatedHacks);

    setLoading(false);
  };

  const generatePersonalHacks = async (data) => {
    const hacks = [];
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    // Yemek analizinden hack'ler
    const recentMeals = data.meals.filter(m => m.timestamp > thirtyDaysAgo);
    if (recentMeals.length >= 10) {
      // En düşük glikoz etkili yemekler
      const lowImpactMeals = recentMeals
        .filter(m => m.glucoseImpactScore && m.glucoseImpactScore <= 4)
        .slice(0, 3);
      
      if (lowImpactMeals.length > 0) {
        hacks.push({
          icon: '🍽️',
          title: 'Sana İyi Gelen Yemekler',
          tip: `${lowImpactMeals.map(m => m.foodName).join(', ')} senin için düşük glikoz etkili. Bu yemekleri sık tüket!`,
          type: 'success',
        });
      }
    }

    // Uyku analizi
    const recentSleep = data.sleep.filter(s => new Date(s.date).getTime() > thirtyDaysAgo);
    if (recentSleep.length >= 7) {
      const avgSleep = recentSleep.reduce((sum, s) => sum + s.hours, 0) / recentSleep.length;
      const optimalSleepDays = recentSleep.filter(s => s.hours >= 7 && s.hours <= 8);
      
      if (optimalSleepDays.length >= 3) {
        hacks.push({
          icon: '💤',
          title: 'Uyku Sihri',
          tip: `7-8 saat uyuduğun günlerde şekerin daha stabil! Hedefin: Her gece ${Math.round(avgSleep)} saat yerine 7.5 saat.`,
          type: 'info',
        });
      }
    }

    // Aktivite önerisi
    const recentActivities = data.activities.filter(a => a.timestamp > thirtyDaysAgo);
    if (recentActivities.length >= 5) {
      const mostFrequent = recentActivities
        .reduce((acc, act) => {
          acc[act.type] = (acc[act.type] || 0) + 1;
          return acc;
        }, {});
      
      const topActivity = Object.entries(mostFrequent).sort((a, b) => b[1] - a[1])[0];
      
      if (topActivity) {
        hacks.push({
          icon: '🏃',
          title: 'Favori Aktiviten',
          tip: `${topActivity[0]} yapmayı seviyorsun (${topActivity[1]} kez). Haftada 3 kez yap, şeker dengesi %20 artar!`,
          type: 'success',
        });
      }
    }

    // Stres yönetimi
    const recentStress = data.stress.filter(s => s.timestamp > thirtyDaysAgo);
    if (recentStress.length >= 5) {
      const avgStress = recentStress.reduce((sum, s) => sum + s.level, 0) / recentStress.length;
      
      if (avgStress >= 6) {
        hacks.push({
          icon: '🧘',
          title: 'Stres Azaltma Taktiği',
          tip: 'Her sabah 5 dk nefes egzersizi yap. Stresli günlerde şekerin ortalama 30 mg/dL daha yüksek!',
          type: 'warning',
        });
      }
    }

    // Karbonhidrat dengesi
    const totalCarbs = recentMeals.reduce((sum, m) => sum + (m.carbs || 0), 0);
    const avgCarbsPerMeal = recentMeals.length > 0 ? totalCarbs / recentMeals.length : 0;
    
    if (avgCarbsPerMeal > 60) {
      hacks.push({
        icon: '🍚',
        title: 'Porsiyon Kontrolü',
        tip: `Öğün başına ortalama ${Math.round(avgCarbsPerMeal)}g karb alıyorsun. 45-50g'a indir, şeker pikin %25 azalır!`,
        type: 'warning',
      });
    } else if (avgCarbsPerMeal >= 40 && avgCarbsPerMeal <= 50) {
      hacks.push({
        icon: '🎯',
        title: 'Mükemmel Denge!',
        tip: `Porsiyon kontrolün harika! Öğün başı ${Math.round(avgCarbsPerMeal)}g karb ideal. Devam et!`,
        type: 'success',
      });
    }

    // Ölçüm düzeni
    const recentGlucose = data.glucose.filter(g => g.timestamp > thirtyDaysAgo);
    const measurementsPerDay = recentGlucose.length / 30;
    
    if (measurementsPerDay < 2) {
      hacks.push({
        icon: '📊',
        title: 'Daha Fazla Ölçüm',
        tip: `Günde sadece ${measurementsPerDay.toFixed(1)} kez ölçüyorsun. Hedef: Günde en az 3 kez (açlık, öğle, akşam).`,
        type: 'info',
      });
    } else if (measurementsPerDay >= 3) {
      hacks.push({
        icon: '⭐',
        title: 'Disiplinli Takip!',
        tip: `Günde ${measurementsPerDay.toFixed(1)} kez ölçüm yapıyorsun. Mükemmel düzen!`,
        type: 'success',
      });
    }

    // Su tüketimi reminder (genel tavsiye)
    hacks.push({
      icon: '💧',
      title: 'Suyu Unutma',
      tip: 'Günde 8-10 bardak su iç. Su, kan şekerini seyreltir ve böbreğe yardımcı olur. Özellikle yüksek şeker zamanında!',
      type: 'info',
    });

    // Protein dengesi
    hacks.push({
      icon: '🥚',
      title: 'Protein Gücü',
      tip: 'Her öğüne protein ekle: yumurta, tavuk, balık, baklagil. Protein, karbın şekere dönüşümünü yavaşlatır!',
      type: 'info',
    });

    return hacks;
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadData} />}
    >
      <LinearGradient colors={['#f59e0b', '#fb923c', '#fdba74']} style={styles.header}>
        <Text style={styles.headerTitle}>💡 Kişisel İçgörüler</Text>
        <Text style={styles.headerSubtitle}>Sana özel analizler ve taktikler</Text>
      </LinearGradient>

      {/* AI İçgörüleri */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🤖 Dijital İkiz Analizi</Text>
        <Text style={styles.sectionSubtitle}>Verilerinden öğrendiklerim</Text>

        {insights.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Daha fazla veri topla, içgörüler ortaya çıksın! 📈</Text>
          </View>
        ) : (
          insights.map((insight, index) => (
            <View key={index} style={styles.insightCard}>
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))
        )}
      </View>

      {/* Diyabet Hackleri */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Diyabet Hackleri</Text>
        <Text style={styles.sectionSubtitle}>Sana özel küçük ama etkili taktikler</Text>

        {hacks.map((hack, index) => (
          <View
            key={index}
            style={[
              styles.hackCard,
              hack.type === 'success' && styles.successCard,
              hack.type === 'warning' && styles.warningCard,
            ]}
          >
            <View style={styles.hackHeader}>
              <Text style={styles.hackIcon}>{hack.icon}</Text>
              <Text style={styles.hackTitle}>{hack.title}</Text>
            </View>
            <Text style={styles.hackTip}>{hack.tip}</Text>
          </View>
        ))}
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  section: {
    padding: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 15,
  },
  emptyCard: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#9ca3af',
    textAlign: 'center',
  },
  insightCard: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  insightText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  hackCard: {
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  successCard: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
  },
  warningCard: {
    backgroundColor: '#fffbeb',
    borderColor: '#f59e0b',
  },
  hackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  hackIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  hackTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    flex: 1,
  },
  hackTip: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 21,
  },
  motivationBox: {
    backgroundColor: '#dbeafe',
    margin: 20,
    marginTop: 10,
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
  },
  motivationIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  motivationTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 10,
  },
  motivationText: {
    fontSize: 15,
    color: '#1e40af',
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomPadding: {
    height: 30,
  },
});

function PersonalInsightsScreenWithNav(props) {
  return (
    <>
      <PersonalInsightsScreen {...props} />
      <BottomNavBar activeKey="Diary" />
    </>
  );
}

export default PersonalInsightsScreenWithNav;
