﻿import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, ScrollView, Text, View, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const FASTING_ACTIVITY_PLANS = [
  {
    id: 't1d',
    title: 'Tip 1 Diyabet - Stabil Enerji',
    subtitle: 'Insulin hassasiyetini koruyarak acligi yonet',
    activities: [
      {
        name: 'Tempolu yuruyus',
        duration: '15-20 dk',
        calories: 85,
        benefit: 'Kan sekerini dengede tutar, hipo riskini azaltir.',
      },
      {
        name: 'Yoga / mobilite',
        duration: '10 dk nefes esliginde',
        calories: 45,
        benefit: 'Kortizolu dusurerek aclik krizini onler.',
      },
      {
        name: 'Direnc lastigi egzersizi',
        duration: '12 dk (2 set)',
        calories: 70,
        benefit: 'Kas glikojenini yavas kullanir, insulin ihtiyacini azaltir.',
      },
    ],
    fastingNote: 'Egzersiz oncesi/sonrasi glukometre kontrolu yap ve yaninda 15 gr hizli karbonhidrat bulundur.',
  },
  {
    id: 't2d',
    title: 'Tip 2 Diyabet - Metabolik Ates',
    subtitle: 'Kaslari aktive ederek insulin direncini kir',
    activities: [
      {
        name: 'Interval yuruyus',
        duration: '5 dk hizli + 2 dk yavas x3',
        calories: 120,
        benefit: 'Kaslara daha fazla glukoz ceker, aclik kan sekerini dusurur.',
      },
      {
        name: 'Vucut agirligi guc seti',
        duration: '3 hareket x 3 set',
        calories: 140,
        benefit: 'Kas kutlesini artirarak bazal metabolizmayi yukseltir.',
      },
      {
        name: 'Dusuk tempolu bisiklet',
        duration: '20 dk',
        calories: 110,
        benefit: 'Yag oksidasyonunu artirir, trigliseridleri dusurur.',
      },
    ],
    fastingNote: 'Egzersiz sonrasi 1 saatlik pencere icinde lif+protein tuketerek insulin duyarliligini uzun tut.',
  },
  {
    id: 'weight',
    title: 'Kilo Verme - Yag Yakici Kombin',
    subtitle: 'Aclik penceresinde fazla kalori yak',
    activities: [
      {
        name: 'HIIT govde devresi',
        duration: '12 dk (30 sn on / 30 sn off)',
        calories: 170,
        benefit: 'EPOC etkisiyle 4-5 saat ek kalori yakimi saglar.',
      },
      {
        name: 'Uzun yuruyus',
        duration: '30 dk dusuk nabiz',
        calories: 160,
        benefit: 'Yag oksidasyonunu maksimumda tutar, kasi korur.',
      },
      {
        name: 'Core guclendirme',
        duration: '8 dk',
        calories: 60,
        benefit: 'Posturu iyilestirir, aclikta enerji cokmesini onler.',
      },
    ],
    fastingNote: 'Su, elektrolit ve hafif tuz destegiyle uzun yuruyuslerde performansi koru.',
  },
];

const FASTING_FOUNDATIONS = [
  {
    title: 'Sahur oncesi hazirlik',
    detail: 'Mineral destekli su + hafif protein ile gece aclik alanini yumusat.',
  },
  {
    title: 'Aclik penceresi',
    detail: 'Dusuk tempolu hareket ve nefes calismasiyla kortizolu dengede tut.',
  },
  {
    title: 'Beslenme penceresi',
    detail: 'Ilk ogunde lif + protein, ikinci ogunde saglikli yag agirligi kur.',
  },
];

const SimpleDietPlanScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#E8F5E9', '#F5F7FA']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.heroCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroEyebrow}>Fasting Kontrol Alani</Text>
              <Text style={styles.heroTitle}>Aclik surecini planla, diyeti ayri bir sayfada yonet</Text>
              <Text style={styles.heroSubtitle}>
                Fasting ekrani artik sadece aktivite rehberi ve ritim plani sunuyor. Ayrintili
                diyet planini yeni sayfaya tasidik.
              </Text>
            </View>
            <Pressable
              style={styles.primaryButton}
              onPress={() => navigation.navigate('DietPlanner')}
            >
              <Text style={styles.primaryButtonText}>Yeni Diyet Planini Ac</Text>
            </Pressable>
          </View>

          <View style={styles.pillRow}>
            {FASTING_FOUNDATIONS.map((item) => (
              <View key={item.title} style={styles.pillCard}>
                <Text style={styles.pillTitle}>{item.title}</Text>
                <Text style={styles.pillText}>{item.detail}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Fasting Aktivite Planlari</Text>
          <View style={styles.fastingGrid}>
            {FASTING_ACTIVITY_PLANS.map(plan => (
              <View key={plan.id} style={styles.fastingCard}>
                <Text style={styles.fastingTitle}>{plan.title}</Text>
                <Text style={styles.fastingSubtitle}>{plan.subtitle}</Text>
                <View style={styles.activityList}>
                  {plan.activities.map(activity => (
                    <View key={activity.name} style={styles.activityRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.activityName}>{activity.name}</Text>
                        <Text style={styles.activityBenefit}>{activity.benefit}</Text>
                      </View>
                      <View style={styles.activityStats}>
                        <Text style={styles.activityDuration}>{activity.duration}</Text>
                        <Text style={styles.activityCalories}>{activity.calories} kcal</Text>
                      </View>
                    </View>
                  ))}
                </View>
                <View style={styles.fastingNoteBox}>
                  <Text style={styles.fastingNoteLabel}>Diyabet faydasi</Text>
                  <Text style={styles.fastingNoteText}>{plan.fastingNote}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.secondaryCard}>
            <Text style={styles.secondaryTitle}>Fasting Gunlukleri</Text>
            <Text style={styles.secondaryText}>
              Aktivite sonrasi hissini kisaca not al. Diyet plani ekraninda saklanan kalori hedefiyle
              eslestirerek tip 1, tip 2 ve kilo verme senaryolarini ayri ayri takip edebilirsin.
            </Text>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('DietPlanner')}
            >
              <Text style={styles.secondaryButtonText}>Diyet Planini Guncelle</Text>
            </Pressable>
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
    padding: 16,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#d1fae5',
    gap: 12,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  pillCard: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#f0fdf4',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  pillTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#047857',
    marginBottom: 4,
  },
  pillText: {
    fontSize: 12,
    color: '#065f46',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginTop: 8,
    marginBottom: 12,
  },
  fastingGrid: {
    marginBottom: 12,
  },
  fastingCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  fastingTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
  },
  fastingSubtitle: {
    fontSize: 13,
    color: '#2C3E50',
    marginTop: 4,
    marginBottom: 12,
  },
  activityList: {
    borderTopWidth: 1,
    borderColor: '#F0F0F0',
    paddingTop: 12,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  activityName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
  },
  activityBenefit: {
    fontSize: 12,
    color: '#4B5563',
    marginTop: 4,
  },
  activityStats: {
    marginLeft: 12,
    alignItems: 'flex-end',
  },
  activityDuration: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  activityCalories: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 2,
  },
  fastingNoteBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
  },
  fastingNoteLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  fastingNoteText: {
    fontSize: 12,
    color: '#374151',
    lineHeight: 16,
  },
  secondaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginTop: 16,
  },
  secondaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  secondaryText: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: '#dcfce7',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  secondaryButtonText: {
    color: '#166534',
    fontWeight: '700',
  },
});

export default SimpleDietPlanScreen;
