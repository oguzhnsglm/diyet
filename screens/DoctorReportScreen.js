import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getTwinData } from '../logic/digitalTwin';
import BottomNavBar from '../components/BottomNavBar';

const DoctorReportScreen = ({ navigation }) => {
  const [reportData, setReportData] = useState(null);
  const [timeRange, setTimeRange] = useState(30); // 7, 30, 90 gün

  useEffect(() => {
    generateReport();
  }, [timeRange]);

  const generateReport = async () => {
    const data = await getTwinData();
    const cutoffDate = Date.now() - timeRange * 24 * 60 * 60 * 1000;

    const periodGlucose = data.glucose.filter(g => g.timestamp > cutoffDate);
    const periodMeals = data.meals.filter(m => m.timestamp > cutoffDate);
    const periodActivities = data.activities.filter(a => a.timestamp > cutoffDate);
    const periodSleep = data.sleep.filter(s => new Date(s.date).getTime() > cutoffDate);
    const periodStress = data.stress.filter(s => s.timestamp > cutoffDate);

    if (periodGlucose.length === 0) {
      setReportData({ empty: true });
      return;
    }

    // İstatistikler
    const glucoseValues = periodGlucose.map(g => g.value);
    const avgGlucose = glucoseValues.reduce((a, b) => a + b, 0) / glucoseValues.length;
    const minGlucose = Math.min(...glucoseValues);
    const maxGlucose = Math.max(...glucoseValues);

    // HbA1c tahmini (ortalamadan)
    const estimatedA1c = ((avgGlucose + 46.7) / 28.7).toFixed(1);

    // Hipoglisemi ve hiperglisemi atakları
    const hypoEvents = periodGlucose.filter(g => g.value < 70).length;
    const hyperEvents = periodGlucose.filter(g => g.value > 180).length;

    // Hedef aralıkta kalma yüzdesi (70-180 mg/dL)
    const inRange = periodGlucose.filter(g => g.value >= 70 && g.value <= 180).length;
    const timeInRange = ((inRange / periodGlucose.length) * 100).toFixed(1);

    // Günlük ölçüm sayısı
    const avgMeasurementsPerDay = (periodGlucose.length / timeRange).toFixed(1);

    // Varyans (stabilite)
    const variance = glucoseValues.reduce((sum, val) => sum + Math.pow(val - avgGlucose, 2), 0) / glucoseValues.length;
    const stdDev = Math.sqrt(variance).toFixed(1);

    // Uyku ortalaması
    const avgSleep = periodSleep.length > 0 
      ? (periodSleep.reduce((sum, s) => sum + s.hours, 0) / periodSleep.length).toFixed(1)
      : 'N/A';

    // Ortalama stres
    const avgStress = periodStress.length > 0
      ? (periodStress.reduce((sum, s) => sum + s.level, 0) / periodStress.length).toFixed(1)
      : 'N/A';

    setReportData({
      period: timeRange,
      totalMeasurements: periodGlucose.length,
      avgGlucose: avgGlucose.toFixed(1),
      minGlucose,
      maxGlucose,
      estimatedA1c,
      hypoEvents,
      hyperEvents,
      timeInRange,
      avgMeasurementsPerDay,
      stdDev,
      totalMeals: periodMeals.length,
      totalActivities: periodActivities.length,
      avgSleep,
      avgStress,
      glucoseData: periodGlucose,
    });
  };

  const shareReport = async () => {
    if (!reportData || reportData.empty) {
      Alert.alert('Rapor Boş', 'Rapor oluşturmak için önce veri kaydetmelisin.');
      return;
    }

    const reportText = `
📊 DİYABET TAKİP RAPORU
Tarih: ${new Date().toLocaleDateString('tr-TR')}
Dönem: Son ${reportData.period} gün

═══════════════════════════

📈 KAN ŞEKERİ İSTATİSTİKLERİ

• Toplam Ölçüm: ${reportData.totalMeasurements}
• Günlük Ortalama: ${reportData.avgMeasurementsPerDay} ölçüm

• Ortalama: ${reportData.avgGlucose} mg/dL
• Minimum: ${reportData.minGlucose} mg/dL
• Maximum: ${reportData.maxGlucose} mg/dL
• Standart Sapma: ${reportData.stdDev} mg/dL

• Tahmini HbA1c: %${reportData.estimatedA1c}

═══════════════════════════

🎯 HEDEF ARALIKLARI

• Hedef Aralıkta (70-180): %${reportData.timeInRange}
• Hipoglisemi (<70): ${reportData.hypoEvents} atak
• Hiperglisemi (>180): ${reportData.hyperEvents} atak

═══════════════════════════

📝 YAŞAM TARZI VERİLERİ

• Kaydedilen Öğün: ${reportData.totalMeals}
• Aktivite Kaydı: ${reportData.totalActivities}
• Ort. Uyku Süresi: ${reportData.avgSleep} saat
• Ort. Stres Seviyesi: ${reportData.avgStress}/10

═══════════════════════════

💡 GENEL DEĞERLENDİRME

${reportData.timeInRange >= 70 ? '✅ Mükemmel kontrol! Hedef aralıkta %' + reportData.timeInRange + ' süre.' : 
  reportData.timeInRange >= 50 ? '⚠️ İyi ama geliştirilebilir. Hedef %70 üzeri.' :
  '⚠️ Kontrolü geliştirmeye odaklan. Doktorunla görüş.'}

${reportData.hypoEvents > 5 ? '⚠️ Hipoglisemi atakları fazla! İlaç dozajını doktorunla gözden geçir.' : ''}

${parseFloat(reportData.estimatedA1c) > 7 ? '⚠️ HbA1c hedefin üzerinde. Daha sıkı kontrol gerekli.' : '✅ HbA1c hedef aralıkta görünüyor.'}

═══════════════════════════

Bu rapor Diyabet Asistanı uygulaması tarafından otomatik oluşturulmuştur.
    `.trim();

    try {
      await Share.share({
        message: reportText,
        title: 'Diyabet Takip Raporum',
      });
    } catch (error) {
      Alert.alert('Hata', 'Rapor paylaşılamadı.');
    }
  };

  if (!reportData) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Rapor oluşturuluyor...</Text>
      </View>
    );
  }

  if (reportData.empty) {
    return (
      <ScrollView style={styles.container}>
        <LinearGradient colors={['#10b981', '#34d399', '#6ee7b7']} style={styles.header}>
          <Text style={styles.headerTitle}>📋 Doktor Raporu</Text>
          <Text style={styles.headerSubtitle}>Tek tuşla profesyonel rapor</Text>
        </LinearGradient>

        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>Henüz Veri Yok</Text>
          <Text style={styles.emptyText}>
            Rapor oluşturmak için kan şekeri ölçümleri kaydetmeye başla.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#10b981', '#34d399', '#6ee7b7']} style={styles.header}>
        <Text style={styles.headerTitle}>📋 Doktor Raporu</Text>
        <Text style={styles.headerSubtitle}>Son {timeRange} günün özeti</Text>
      </LinearGradient>

      {/* Zaman Aralığı Seçimi */}
      <View style={styles.timeRangeContainer}>
        {[7, 30, 90].map((days) => (
          <TouchableOpacity
            key={days}
            style={[styles.timeButton, timeRange === days && styles.activeTimeButton]}
            onPress={() => setTimeRange(days)}
          >
            <Text style={[styles.timeButtonText, timeRange === days && styles.activeTimeButtonText]}>
              {days} Gün
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Ana İstatistikler */}
      <View style={styles.statsGrid}>
        <View style={[styles.statCard, styles.primaryCard]}>
          <Text style={styles.statIcon}>📊</Text>
          <Text style={styles.statValue}>{reportData.avgGlucose}</Text>
          <Text style={styles.statLabel}>Ortalama mg/dL</Text>
        </View>

        <View style={[styles.statCard, styles.secondaryCard]}>
          <Text style={styles.statIcon}>🎯</Text>
          <Text style={styles.statValue}>{reportData.timeInRange}%</Text>
          <Text style={styles.statLabel}>Hedef Aralıkta</Text>
        </View>

        <View style={[styles.statCard, styles.secondaryCard]}>
          <Text style={styles.statIcon}>🔬</Text>
          <Text style={styles.statValue}>{reportData.estimatedA1c}%</Text>
          <Text style={styles.statLabel}>Tahmini HbA1c</Text>
        </View>

        <View style={[styles.statCard, styles.secondaryCard]}>
          <Text style={styles.statIcon}>📈</Text>
          <Text style={styles.statValue}>{reportData.totalMeasurements}</Text>
          <Text style={styles.statLabel}>Toplam Ölçüm</Text>
        </View>
      </View>

      {/* Detaylı Bilgiler */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Kan Şekeri Detayları</Text>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Minimum</Text>
          <Text style={[styles.detailValue, reportData.minGlucose < 70 && styles.lowValue]}>
            {reportData.minGlucose} mg/dL
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Maximum</Text>
          <Text style={[styles.detailValue, reportData.maxGlucose > 180 && styles.highValue]}>
            {reportData.maxGlucose} mg/dL
          </Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Standart Sapma</Text>
          <Text style={styles.detailValue}>{reportData.stdDev} mg/dL</Text>
        </View>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Günlük Ölçüm</Text>
          <Text style={styles.detailValue}>{reportData.avgMeasurementsPerDay} kez</Text>
        </View>
      </View>

      {/* Ataklar */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚠️ Kritik Olaylar</Text>
        
        <View style={[styles.alertBox, reportData.hypoEvents > 0 && styles.dangerBox]}>
          <Text style={styles.alertIcon}>⬇️</Text>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Hipoglisemi (&lt;70)</Text>
            <Text style={styles.alertValue}>{reportData.hypoEvents} atak</Text>
          </View>
        </View>

        <View style={[styles.alertBox, reportData.hyperEvents > 0 && styles.warningBox]}>
          <Text style={styles.alertIcon}>⬆️</Text>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Hiperglisemi (&gt;180)</Text>
            <Text style={styles.alertValue}>{reportData.hyperEvents} atak</Text>
          </View>
        </View>
      </View>

      {/* Yaşam Tarzı */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🌟 Yaşam Tarzı Verileri</Text>
        
        <View style={styles.lifestyleGrid}>
          <View style={styles.lifestyleCard}>
            <Text style={styles.lifestyleIcon}>🍽️</Text>
            <Text style={styles.lifestyleValue}>{reportData.totalMeals}</Text>
            <Text style={styles.lifestyleLabel}>Öğün Kaydı</Text>
          </View>

          <View style={styles.lifestyleCard}>
            <Text style={styles.lifestyleIcon}>🏃</Text>
            <Text style={styles.lifestyleValue}>{reportData.totalActivities}</Text>
            <Text style={styles.lifestyleLabel}>Aktivite</Text>
          </View>

          <View style={styles.lifestyleCard}>
            <Text style={styles.lifestyleIcon}>💤</Text>
            <Text style={styles.lifestyleValue}>{reportData.avgSleep}</Text>
            <Text style={styles.lifestyleLabel}>Ort. Uyku (sa)</Text>
          </View>

          <View style={styles.lifestyleCard}>
            <Text style={styles.lifestyleIcon}>🧘</Text>
            <Text style={styles.lifestyleValue}>{reportData.avgStress}</Text>
            <Text style={styles.lifestyleLabel}>Ort. Stres</Text>
          </View>
        </View>
      </View>

      {/* Paylaş Butonu */}
      <TouchableOpacity style={styles.shareButton} onPress={shareReport}>
        <Text style={styles.shareButtonText}>📤 Raporu Paylaş</Text>
        <Text style={styles.shareButtonSubtext}>
          WhatsApp, E-posta veya PDF olarak
        </Text>
      </TouchableOpacity>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ℹ️ Bu rapor bilgilendirme amaçlıdır. Tıbbi karar için doktorunuza danışın.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: '#6b7280',
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
  timeRangeContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingBottom: 10,
    justifyContent: 'space-between',
  },
  timeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'white',
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  activeTimeButton: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  timeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeTimeButtonText: {
    color: 'white',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
  },
  statCard: {
    width: '48%',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  primaryCard: {
    width: '100%',
    backgroundColor: '#10b981',
    marginBottom: 15,
  },
  secondaryCard: {
    backgroundColor: 'white',
    marginHorizontal: '1%',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    marginTop: 0,
    padding: 20,
    borderRadius: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 15,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  lowValue: {
    color: '#ef4444',
  },
  highValue: {
    color: '#f59e0b',
  },
  alertBox: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  dangerBox: {
    backgroundColor: '#fee2e2',
  },
  warningBox: {
    backgroundColor: '#fef3c7',
  },
  alertIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 3,
  },
  alertValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
  },
  lifestyleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  lifestyleCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  lifestyleIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  lifestyleValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 5,
  },
  lifestyleLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  shareButton: {
    backgroundColor: '#10b981',
    margin: 15,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  shareButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 5,
  },
  shareButtonSubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
  },
  disclaimer: {
    padding: 20,
    paddingTop: 0,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

function DoctorReportScreenWithNav(props) {
  return (
    <>
      <DoctorReportScreen {...props} />
      <BottomNavBar activeKey="Diary" />
    </>
  );
}

export default DoctorReportScreenWithNav;
