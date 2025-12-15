import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { addSleepRecord, addStressRecord, getTwinData } from '../logic/digitalTwin';
import { getHealthData, getTodayHealthSummary } from '../logic/healthSync';
import BottomNavBar from '../components/BottomNavBar';

const StressSleepAnalysisScreen = ({ navigation }) => {
  const [selectedTab, setSelectedTab] = useState('sleep'); // 'sleep' or 'stress'
  const [sleepHours, setSleepHours] = useState('');
  const [sleepQuality, setSleepQuality] = useState('orta');
  const [stressLevel, setStressLevel] = useState(5);
  const [stressTrigger, setStressTrigger] = useState('');
  const [stressNote, setStressNote] = useState('');
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [healthSummary, setHealthSummary] = useState(null);
  const [healthHistory, setHealthHistory] = useState(null);

  useEffect(() => {
    loadInsights();
    loadHealthData();
  }, []);
  
  const loadHealthData = async () => {
    const summary = await getTodayHealthSummary();
    const history = await getHealthData();
    setHealthSummary(summary);
    setHealthHistory(history);
  };

  const loadInsights = async () => {
    setLoading(true);
    const data = await getTwinData();
    
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentGlucose = data.glucose.filter((g) => g.timestamp > thirtyDaysAgo);
    const recentSleep = data.sleep.filter((s) => new Date(s.date).getTime() > thirtyDaysAgo);
    const recentStress = data.stress.filter((s) => s.timestamp > thirtyDaysAgo);

    const newInsights = [];

    // Uyku analizi
    if (recentSleep.length >= 7) {
      const avgSleepHours = recentSleep.reduce((sum, s) => sum + s.hours, 0) / recentSleep.length;
      
      if (avgSleepHours < 6) {
        newInsights.push({
          icon: '😴',
          type: 'warning',
          title: 'Yetersiz Uyku',
          message: `Ortalama ${avgSleepHours.toFixed(1)} saat uyuyorsun. 7-8 saat hedefle, kan şekeri daha stabil olur.`,
        });
      } else if (avgSleepHours >= 7 && avgSleepHours <= 8) {
        newInsights.push({
          icon: '✅',
          type: 'success',
          title: 'İyi Uyku Düzeni',
          message: `Harika! Ortalama ${avgSleepHours.toFixed(1)} saat uyuyorsun, ideal aralıkta.`,
        });
      }

      // Uyku kalitesi-şeker korelasyonu
      const goodSleepDays = recentSleep.filter((s) => s.quality === 'iyi' || s.quality === 'mükemmel');
      const goodSleepGlucose = [];
      const badSleepGlucose = [];

      recentSleep.forEach((sleep) => {
        const sleepDate = new Date(sleep.date);
        const nextDayStart = new Date(sleepDate);
        nextDayStart.setHours(6, 0, 0, 0);
        const nextDayEnd = new Date(sleepDate);
        nextDayEnd.setHours(23, 59, 59, 999);

        const dayGlucose = recentGlucose.filter((g) => {
          const gTime = new Date(g.timestamp).getTime();
          return gTime >= nextDayStart.getTime() && gTime <= nextDayEnd.getTime();
        });

        if (dayGlucose.length > 0) {
          const avg = dayGlucose.reduce((sum, g) => sum + g.value, 0) / dayGlucose.length;
          if (sleep.quality === 'iyi' || sleep.quality === 'mükemmel') {
            goodSleepGlucose.push(avg);
          } else {
            badSleepGlucose.push(avg);
          }
        }
      });

      if (goodSleepGlucose.length > 0 && badSleepGlucose.length > 0) {
        const goodAvg = goodSleepGlucose.reduce((a, b) => a + b, 0) / goodSleepGlucose.length;
        const badAvg = badSleepGlucose.reduce((a, b) => a + b, 0) / badSleepGlucose.length;
        const diff = Math.abs(goodAvg - badAvg);

        if (diff > 15) {
          newInsights.push({
            icon: '💤',
            type: 'info',
            title: 'Uyku Kalitesi Etkisi',
            message: `İyi uyuduğun günlerde kan şekerin ortalama ${Math.round(diff)} mg/dL daha stabil!`,
          });
        }
      }
    } else {
      newInsights.push({
        icon: '📊',
        type: 'info',
        title: 'Daha Fazla Veri Gerekli',
        message: 'En az 7 günlük uyku verisi topla, korelasyon analizi yapalım.',
      });
    }

    // Stres analizi
    if (recentStress.length >= 5) {
      const avgStress = recentStress.reduce((sum, s) => sum + s.level, 0) / recentStress.length;
      
      if (avgStress >= 7) {
        newInsights.push({
          icon: '⚠️',
          type: 'warning',
          title: 'Yüksek Stres',
          message: `Ortalama stres seviyen ${avgStress.toFixed(1)}/10. Yüksek stres kan şekerini artırır, nefes egzersizleri dene.`,
        });
      }

      // Yüksek stres günleri analizi
      const highStressDays = recentStress.filter((s) => s.level >= 7);
      if (highStressDays.length > 0) {
        const stressGlucose = [];
        const normalGlucose = [];

        recentStress.forEach((stress) => {
          const stressTime = stress.timestamp;
          const nextHours = recentGlucose.filter(
            (g) => g.timestamp > stressTime && g.timestamp < stressTime + 4 * 60 * 60 * 1000
          );

          if (nextHours.length > 0) {
            const avg = nextHours.reduce((sum, g) => sum + g.value, 0) / nextHours.length;
            if (stress.level >= 7) {
              stressGlucose.push(avg);
            } else {
              normalGlucose.push(avg);
            }
          }
        });

        if (stressGlucose.length > 0 && normalGlucose.length > 0) {
          const stressAvg = stressGlucose.reduce((a, b) => a + b, 0) / stressGlucose.length;
          const normalAvg = normalGlucose.reduce((a, b) => a + b, 0) / normalGlucose.length;
          const diff = stressAvg - normalAvg;

          if (diff > 20) {
            newInsights.push({
              icon: '🧘',
              type: 'warning',
              title: 'Stres-Şeker Bağlantısı',
              message: `Yüksek stresli anlarda kan şekerin ortalama ${Math.round(diff)} mg/dL daha yüksek. Stres yönetimi kritik!`,
            });
          }
        }
      }

      // En yaygın stres tetikleyicileri
      const triggers = recentStress
        .filter((s) => s.trigger)
        .map((s) => s.trigger)
        .reduce((acc, trigger) => {
          acc[trigger] = (acc[trigger] || 0) + 1;
          return acc;
        }, {});

      const topTrigger = Object.entries(triggers).sort((a, b) => b[1] - a[1])[0];
      if (topTrigger) {
        newInsights.push({
          icon: '🎯',
          type: 'info',
          title: 'Ana Stres Kaynağın',
          message: `En çok "${topTrigger[0]}" stres yaratıyor (${topTrigger[1]} kez). Bu durumla başa çıkma stratejisi geliştir.`,
        });
      }
    } else {
      newInsights.push({
        icon: '📈',
        type: 'info',
        title: 'Stres Takibine Başla',
        message: 'Günlük stres seviyeni kaydet, kan şekeriyle ilişkisini görelim.',
      });
    }

    setInsights(newInsights);
    setLoading(false);
  };

  const saveSleep = async () => {
    if (!sleepHours || parseFloat(sleepHours) < 0 || parseFloat(sleepHours) > 24) {
      Alert.alert('Geçersiz Değer', 'Lütfen geçerli bir uyku süresi girin (0-24 saat).');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    await addSleepRecord({
      date: today,
      hours: parseFloat(sleepHours),
      quality: sleepQuality,
    });

    Alert.alert('✅ Kaydedildi', 'Uyku verisi dijital ikizine eklendi.');
    setSleepHours('');
    setSleepQuality('orta');
    loadInsights();
  };

  const saveStress = async () => {
    await addStressRecord({
      timestamp: Date.now(),
      level: stressLevel,
      trigger: stressTrigger || undefined,
      note: stressNote || undefined,
    });

    Alert.alert('✅ Kaydedildi', 'Stres verisi dijital ikizine eklendi.');
    setStressLevel(5);
    setStressTrigger('');
    setStressNote('');
    loadInsights();
  };

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#8b5cf6', '#a78bfa', '#c4b5fd']} style={styles.header}>
        <Text style={styles.headerTitle}>💤 Uyku & Stres Analitiği</Text>
        <Text style={styles.headerSubtitle}>Kan şekerine etkisini keşfet</Text>
        
        {healthSummary?.hasData && (
          <View style={styles.healthBanner}>
            <Text style={styles.healthBannerText}>
              ⌚ Bugün: {healthSummary.totalSteps > 0 && `${healthSummary.totalSteps} adım`}
              {healthSummary.avgHeartRate && ` • ${healthSummary.avgHeartRate} bpm`}
            </Text>
          </View>
        )}
      </LinearGradient>

      {/* Tab Seçimi */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'sleep' && styles.activeTab]}
          onPress={() => setSelectedTab('sleep')}
        >
          <Text style={[styles.tabText, selectedTab === 'sleep' && styles.activeTabText]}>
            😴 Uyku
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'stress' && styles.activeTab]}
          onPress={() => setSelectedTab('stress')}
        >
          <Text style={[styles.tabText, selectedTab === 'stress' && styles.activeTabText]}>
            🧘 Stres
          </Text>
        </TouchableOpacity>
      </View>

      {/* İçgörüler */}
      <View style={styles.insightsSection}>
        <Text style={styles.sectionTitle}>📊 Kişisel Analizler</Text>
        {loading ? (
          <Text style={styles.loadingText}>Analiz ediliyor...</Text>
        ) : (
          insights.map((insight, index) => (
            <View
              key={index}
              style={[
                styles.insightCard,
                insight.type === 'warning' && styles.warningCard,
                insight.type === 'success' && styles.successCard,
              ]}
            >
              <Text style={styles.insightIcon}>{insight.icon}</Text>
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>{insight.title}</Text>
                <Text style={styles.insightMessage}>{insight.message}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Uyku Girişi */}
      {selectedTab === 'sleep' && (
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>💤 Bugünkü Uyku</Text>
          
          <Text style={styles.inputLabel}>Uyku Süresi (saat)</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: 7.5"
            keyboardType="numeric"
            value={sleepHours}
            onChangeText={setSleepHours}
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.inputLabel}>Uyku Kalitesi</Text>
          <View style={styles.qualityButtons}>
            {['kötü', 'orta', 'iyi', 'mükemmel'].map((quality) => (
              <TouchableOpacity
                key={quality}
                style={[
                  styles.qualityButton,
                  sleepQuality === quality && styles.activeQualityButton,
                ]}
                onPress={() => setSleepQuality(quality)}
              >
                <Text
                  style={[
                    styles.qualityButtonText,
                    sleepQuality === quality && styles.activeQualityButtonText,
                  ]}
                >
                  {quality === 'kötü' && '😫'}
                  {quality === 'orta' && '😐'}
                  {quality === 'iyi' && '😊'}
                  {quality === 'mükemmel' && '😍'}
                  {'\n'}
                  {quality.charAt(0).toUpperCase() + quality.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={saveSleep}>
            <Text style={styles.saveButtonText}>💾 Uyku Kaydını Kaydet</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Stres Girişi */}
      {selectedTab === 'stress' && (
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>🧘 Şu Anki Stres</Text>
          
          <Text style={styles.inputLabel}>Stres Seviyesi: {stressLevel}/10</Text>
          <View style={styles.sliderContainer}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.sliderButton,
                  stressLevel >= level && styles.activeSliderButton,
                  level >= 8 && stressLevel >= level && styles.highStressButton,
                ]}
                onPress={() => setStressLevel(level)}
              >
                <Text style={styles.sliderButtonText}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Stres Kaynağı (isteğe bağlı)</Text>
          <View style={styles.triggerButtons}>
            {['İş', 'Aile', 'Sağlık', 'Finans', 'Trafik', 'Diğer'].map((trigger) => (
              <TouchableOpacity
                key={trigger}
                style={[
                  styles.triggerButton,
                  stressTrigger === trigger && styles.activeTriggerButton,
                ]}
                onPress={() => setStressTrigger(trigger === stressTrigger ? '' : trigger)}
              >
                <Text
                  style={[
                    styles.triggerButtonText,
                    stressTrigger === trigger && styles.activeTriggerButtonText,
                  ]}
                >
                  {trigger}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.inputLabel}>Not (isteğe bağlı)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Ne oldu? Nasıl hissediyorsun?"
            multiline
            numberOfLines={3}
            value={stressNote}
            onChangeText={setStressNote}
            placeholderTextColor="#9ca3af"
          />

          <TouchableOpacity style={styles.saveButton} onPress={saveStress}>
            <Text style={styles.saveButtonText}>💾 Stres Kaydını Kaydet</Text>
          </TouchableOpacity>

          <View style={styles.tipsBox}>
            <Text style={styles.tipsTitle}>💡 Hızlı Stres Azaltma Teknikleri</Text>
            <Text style={styles.tipItem}>• 4-7-8 Nefes: 4 say içine çek, 7 say tut, 8 say ver</Text>
            <Text style={styles.tipItem}>• 5 dakika meditasyon veya derin nefes</Text>
            <Text style={styles.tipItem}>• Kısa yürüyüş yap (10-15 dk)</Text>
            <Text style={styles.tipItem}>• Birisine dert yan veya günlük yaz</Text>
          </View>
        </View>
      )}
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
  healthBanner: {
    marginTop: 15,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
  },
  healthBannerText: {
    fontSize: 13,
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 10,
  },
  tab: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    backgroundColor: 'white',
    marginHorizontal: 5,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#8b5cf6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTabText: {
    color: 'white',
  },
  insightsSection: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 15,
  },
  loadingText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
    padding: 20,
  },
  insightCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#6366f1',
  },
  warningCard: {
    borderLeftColor: '#f59e0b',
    backgroundColor: '#fffbeb',
  },
  successCard: {
    borderLeftColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  insightIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 5,
  },
  insightMessage: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  inputSection: {
    padding: 20,
    paddingTop: 0,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    color: '#374151',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  qualityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  qualityButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 3,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  activeQualityButton: {
    borderColor: '#8b5cf6',
    backgroundColor: '#f3e8ff',
  },
  qualityButtonText: {
    fontSize: 22,
    color: '#6b7280',
    textAlign: 'center',
  },
  activeQualityButtonText: {
    color: '#8b5cf6',
    fontWeight: '600',
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sliderButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeSliderButton: {
    backgroundColor: '#8b5cf6',
  },
  highStressButton: {
    backgroundColor: '#ef4444',
  },
  sliderButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  triggerButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  triggerButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  activeTriggerButton: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  triggerButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
  activeTriggerButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  tipsBox: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
  },
  tipsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 10,
  },
  tipItem: {
    fontSize: 13,
    color: '#1e40af',
    marginBottom: 5,
    lineHeight: 20,
  },
});

function StressSleepAnalysisScreenWithNav(props) {
  return (
    <>
      <StressSleepAnalysisScreen {...props} />
      <BottomNavBar activeKey="Diary" />
    </>
  );
}

export default StressSleepAnalysisScreenWithNav;
