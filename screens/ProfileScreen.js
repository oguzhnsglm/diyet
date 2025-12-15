import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { Alert, SafeAreaView, ScrollView, Text, TextInput, View, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DietContext } from '../context/DietContext';
import { useTheme } from '../context/ThemeContext';
import BottomNavBar from '../components/BottomNavBar';
import BackButton from '../components/BackButton';
import { PrimaryButton } from '../components/common';
import { calculateBMI, healthyWeightRange, getTodayISO } from '../logic/utils';
import { styles, colors } from '../styles';

const fallbackUser = {
  name: 'Misafir Kullanıcı',
  heightCm: 168,
  weightKg: 72,
  targetWeightKg: null,
  dailyCalorieTarget: 1800,
  dailySugarLimitGr: 50,
  email: 'misafir@diyetapp.com',
  phoneNumber: '+90 ••• •• ••',
  lastLoginAt: new Date().toISOString(),
};

const ProfileScreenContent = ({ navigation }) => {
  const { user, setUser, reloadUser } = useContext(DietContext);
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const [weight, setWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [dailyCalories, setDailyCalories] = useState('');
  const [dailySugar, setDailySugar] = useState('');
  const [glucoseStats, setGlucoseStats] = useState({ value: null, time: null });
  const [rewardStatus, setRewardStatus] = useState({ diet: false, glucose: false, activity: false });

  const activeUser = user || fallbackUser;

  const rewardStorageKey = `reward_status_${getTodayISO()}`;

  const syncFromUser = (u) => {
    const source = u || fallbackUser;
    setWeight(String(source.weightKg));
    setTargetWeight(source.targetWeightKg ? String(source.targetWeightKg) : '');
    setDailyCalories(String(source.dailyCalorieTarget));
    setDailySugar(String(source.dailySugarLimitGr));
  };

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const u = await reloadUser();
        syncFromUser(u);
      })();
    }, [reloadUser])
  );

  const numericWeight = Number(weight) || Number(activeUser.weightKg) || 0;
  const bmi = calculateBMI(numericWeight, activeUser.heightCm);
  const range = healthyWeightRange(activeUser.heightCm);

  const privacyInfo = useMemo(
    () => ({
      email: activeUser.email || 'kullanici@ornek.com',
      phone: activeUser.phoneNumber || '+90 ••• •• ••',
      lastLogin: activeUser.lastLoginAt || '04 Aralık 2025 • 09:42',
    }),
    [activeUser.email, activeUser.phoneNumber, activeUser.lastLoginAt]
  );

  const loadGlucose = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem('latest_glucose_stats');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setGlucoseStats({
        value: parsed?.lastValue || null,
        time: parsed?.time || parsed?.timeISO || null,
      });
    } catch (error) {
      console.warn('Glucose verisi okunamadi', error);
    }
  }, []);

  const loadRewards = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(rewardStorageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        setRewardStatus(prev => ({ ...prev, ...parsed }));
      } else {
        setRewardStatus({ diet: false, glucose: false, activity: false });
      }
    } catch (error) {
      console.warn('Ödül durumu okunamadı', error);
    }
  }, [rewardStorageKey]);

  const toggleReward = async (taskId) => {
    const next = {
      ...rewardStatus,
      [taskId]: !rewardStatus[taskId],
    };
    setRewardStatus(next);
    try {
      await AsyncStorage.setItem(rewardStorageKey, JSON.stringify(next));
    } catch (error) {
      console.warn('Ödül durumu kaydedilemedi', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadGlucose();
      loadRewards();
    }, [loadGlucose, loadRewards])
  );

  const onSave = async () => {
    const baseUser = user || fallbackUser;
    const updated = {
      ...baseUser,
      weightKg: Number(weight) || baseUser.weightKg,
      targetWeightKg: targetWeight ? Number(targetWeight) : null,
      dailyCalorieTarget: Number(dailyCalories) || baseUser.dailyCalorieTarget,
      dailySugarLimitGr: Number(dailySugar) || baseUser.dailySugarLimitGr,
    };
    await setUser(updated);
    await reloadUser();
    Alert.alert('Güncellendi', 'Profil bilgilerin kaydedildi.');
  };

  const formattedGlucose = glucoseStats.value ? `${glucoseStats.value} mg/dL` : 'Henüz ölçüm yok';
  const formattedGlucoseTime = glucoseStats.time ? new Date(glucoseStats.time).toLocaleString('tr-TR') : '';

  const themeOptions = [
    { id: 'light', label: 'Açık', description: 'Daha parlak arayüz', emoji: '🌤️' },
    { id: 'dark', label: 'Koyu', description: 'Göz yormayan mod', emoji: '🌙' },
  ];

  const rewardTasks = [
    {
      id: 'diet',
      title: 'Diyet Planı',
      description: 'Öğünleri plana uygun tamamla',
      icon: '🥗',
    },
    {
      id: 'glucose',
      title: 'Şeker Takibi',
      description: 'Günlük ölçüm kaydet',
      icon: '🩸',
    },
    {
      id: 'activity',
      title: 'Hareket',
      description: 'En az 20 dk aktivite',
      icon: '🏅',
    },
  ];

  const completedRewards = Object.values(rewardStatus).filter(Boolean).length;
  const rewardUnlocked = completedRewards === rewardTasks.length;

  const displayedTarget = targetWeight || activeUser.targetWeightKg;

  const personalInfoRows = [
    { label: 'E-posta', value: privacyInfo.email },
    { label: 'Telefon', value: privacyInfo.phone },
    { label: 'Boy', value: `${activeUser.heightCm} cm` },
    { label: 'Hedef Kilo', value: displayedTarget ? `${displayedTarget} kg` : '-' },
    { label: 'Kalori Limiti', value: `${dailyCalories || activeUser.dailyCalorieTarget} kcal` },
  ];

  const badgeMessage = rewardUnlocked
    ? 'Günlük görevler tamamlandı!'
    : 'Rozet için üç görevi tamamla.';

  // Dynamic styles based on theme
  const dynamicStyles = useMemo(() => ({
    headerCard: {
      backgroundColor: isDarkMode ? '#2C2C2E' : '#ffffff',
      shadowColor: isDarkMode ? '#000' : '#94a3b8',
    },
    metricCard: {
      backgroundColor: isDarkMode ? '#2C2C2E' : '#ffffff',
      shadowColor: isDarkMode ? '#000' : '#94a3b8',
    },
    formCard: {
      backgroundColor: isDarkMode ? '#2C2C2E' : '#ffffff',
      shadowColor: isDarkMode ? '#000' : '#cbd5e1',
    },
    buttonCard: {
      backgroundColor: isDarkMode ? '#2C2C2E' : '#ffffff',
      shadowColor: isDarkMode ? '#000' : '#94a3b8',
    },
    input: {
      borderColor: isDarkMode ? '#3A3A3C' : '#e2e8f0',
      backgroundColor: isDarkMode ? '#1C1C1E' : '#f8fafc',
      color: colors.text,
    },
    themeTile: {
      borderColor: isDarkMode ? '#3A3A3C' : '#e2e8f0',
      backgroundColor: isDarkMode ? '#1C1C1E' : '#f8fafc',
    },
    themeTileActive: {
      borderColor: '#2563eb',
      backgroundColor: isDarkMode ? '#1e3a8a' : '#dbeafe',
    },
    infoCard: {
      backgroundColor: isDarkMode ? '#1C1C1E' : '#0f172a',
    },
    rewardCard: {
      backgroundColor: isDarkMode ? '#1C1C1E' : '#18122b',
      borderColor: isDarkMode ? '#3A3A3C' : '#31255a',
    },
    rewardTask: {
      backgroundColor: isDarkMode ? '#2C2C2E' : '#241b3f',
    },
    badgeBoard: {
      backgroundColor: isDarkMode ? '#2C2C2E' : '#241b3f',
    },
    badgePill: {
      backgroundColor: isDarkMode ? '#3A3A3C' : '#1f2937',
    },
  }), [isDarkMode, colors]);

  return (
    <SafeAreaView style={[profileStyles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={isDarkMode ? ['#1C1C1E', '#000000'] : ['#fdfcfb', '#e2ebf0']} style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <BackButton navigation={navigation} />
        </View>
        <ScrollView contentContainerStyle={profileStyles.content}>
          <View style={[profileStyles.headerCard, dynamicStyles.headerCard, { shadowOpacity: isDarkMode ? 0.3 : 0.25 }]}>
            <Text style={[profileStyles.headerLabel, { color: colors.secondaryText }]}>Profile</Text>
            <Text style={[profileStyles.headerName, { color: colors.text }]}>{activeUser.name}</Text>
            <Text style={[profileStyles.headerSub, { color: colors.secondaryText }]}>Sağlık verilerin tek ekranda</Text>
          </View>

          <View style={profileStyles.metricRow}>
            <View style={[profileStyles.metricCard, dynamicStyles.metricCard, { shadowOpacity: isDarkMode ? 0.2 : 0.12 }]}>
              <Text style={[profileStyles.metricLabel, { color: colors.secondaryText }]}>Kan Şekeri</Text>
              <Text style={[profileStyles.metricValue, { color: colors.text }]}>{formattedGlucose}</Text>
              {formattedGlucoseTime ? (
                <Text style={[profileStyles.metricHint, { color: colors.secondaryText }]}>{formattedGlucoseTime}</Text>
              ) : null}
            </View>
            <View style={[profileStyles.metricCard, dynamicStyles.metricCard, { shadowOpacity: isDarkMode ? 0.2 : 0.12 }]}>
              <Text style={[profileStyles.metricLabel, { color: colors.secondaryText }]}>Güncel Kilo</Text>
              <Text style={[profileStyles.metricValue, { color: colors.text }]}>{numericWeight.toFixed(1)} kg</Text>
              <Text style={[profileStyles.metricHint, { color: colors.secondaryText }]}>BMI {bmi ? bmi.toFixed(1) : '-'} • Boy {activeUser.heightCm} cm</Text>
            </View>
          </View>

          <View style={[profileStyles.infoCard, dynamicStyles.infoCard]}>
            <View style={profileStyles.infoHeader}>
              <Text style={profileStyles.infoTitle}>Kişisel Bilgiler</Text>
              <Text style={[profileStyles.sectionHint, { color: '#cbd5f5', marginBottom: 0 }]}>
                Verilerin profile kaydedilir ve güvenle saklanır.
              </Text>
            </View>
            <View style={profileStyles.infoList}>
              {personalInfoRows.map((row) => (
                <View key={row.label} style={profileStyles.infoRow}>
                  <Text style={profileStyles.infoLabel}>{row.label}</Text>
                  <Text style={profileStyles.infoValue}>{row.value}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={[profileStyles.formCard, dynamicStyles.formCard, { shadowOpacity: isDarkMode ? 0.3 : 0.25 }]}>
            <Text style={[profileStyles.sectionTitle, { color: colors.text }]}>Hedeflerini Güncelle</Text>
            <Text style={[profileStyles.sectionHint, { color: colors.secondaryText }]}>Veriler Planner ve Dashboard ile senkron kalır.</Text>
            <View style={profileStyles.inputGroup}>
              <Text style={[profileStyles.inputLabel, { color: colors.secondaryText }]}>Mevcut Kilo (kg)</Text>
              <TextInput
                style={[profileStyles.input, dynamicStyles.input]}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder="Örn: 70"
                placeholderTextColor={colors.secondaryText}
              />
            </View>
            <View style={profileStyles.inputGroup}>
              <Text style={[profileStyles.inputLabel, { color: colors.secondaryText }]}>Hedef Kilo</Text>
              <TextInput
                style={[profileStyles.input, dynamicStyles.input]}
                value={targetWeight}
                onChangeText={setTargetWeight}
                keyboardType="numeric"
                placeholder="Örn: 60"
                placeholderTextColor={colors.secondaryText}
              />
            </View>
            <View style={profileStyles.inputGroup}>
              <Text style={[profileStyles.inputLabel, { color: colors.secondaryText }]}>Günlük Kalori</Text>
              <TextInput
                style={[profileStyles.input, dynamicStyles.input]}
                value={dailyCalories}
                onChangeText={setDailyCalories}
                keyboardType="numeric"
                placeholder="Örn: 1800"
                placeholderTextColor={colors.secondaryText}
              />
            </View>
            <View style={profileStyles.inputGroup}>
              <Text style={[profileStyles.inputLabel, { color: colors.secondaryText }]}>Günlük Şeker Limiti</Text>
              <TextInput
                style={[profileStyles.input, dynamicStyles.input]}
                value={dailySugar}
                onChangeText={setDailySugar}
                keyboardType="numeric"
                placeholder="Örn: 50"
                placeholderTextColor={colors.secondaryText}
              />
            </View>
            <PrimaryButton label="Kaydet" onPress={onSave} style={{ marginTop: 12 }} />
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const profileStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 18,
    paddingBottom: 80,
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 30,
    paddingVertical: 26,
    paddingHorizontal: 24,
    shadowColor: '#94a3b8',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  headerLabel: {
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '700',
    fontSize: 12,
  },
  headerName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 6,
  },
  headerSub: {
    color: '#475569',
    marginTop: 4,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#94a3b8',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },
  metricLabel: {
    color: '#64748b',
    fontSize: 13,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 6,
  },
  metricHint: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#cbd5e1',
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionHint: {
    color: '#94a3b8',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    color: '#475569',
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    padding: 14,
    backgroundColor: '#f8fafc',
    color: '#0f172a',
  },
  buttonCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#94a3b8',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  buttonHeader: {
    marginBottom: 12,
  },
  buttonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  buttonSubtitle: {
    color: '#94a3b8',
    fontSize: 13,
  },
  privacyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  privacyLabel: {
    color: '#64748b',
  },
  privacyValue: {
    color: '#0f172a',
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 16,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  themeTile: {
    flex: 1,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  themeTileActive: {
    borderColor: '#2563eb',
    backgroundColor: '#dbeafe',
  },
  themeEmoji: {
    fontSize: 22,
  },
  themeLabel: {
    marginTop: 8,
    fontWeight: '700',
    color: '#0f172a',
  },
  themeHint: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 22,
  },
  infoHeader: {
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
  },
  infoList: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    color: '#cbd5f5',
  },
  infoValue: {
    color: '#f8fafc',
    fontWeight: '600',
  },
  rewardCard: {
    backgroundColor: '#18122b',
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: '#31255a',
  },
  rewardTaskList: {
    marginTop: 8,
    gap: 10,
  },
  rewardTask: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#241b3f',
  },
  rewardTaskDone: {
    backgroundColor: '#1f8a70',
  },
  rewardIcon: {
    fontSize: 20,
  },
  rewardTitle: {
    color: '#ffffff',
    fontWeight: '700',
  },
  rewardDesc: {
    color: '#c7d2fe',
    fontSize: 12,
  },
  rewardStatus: {
    color: '#cbd5f5',
    fontWeight: '600',
  },
  rewardStatusDone: {
    color: '#f8fafc',
  },
  badgeBoard: {
    marginTop: 18,
    padding: 16,
    borderRadius: 22,
    backgroundColor: '#241b3f',
    alignItems: 'center',
    gap: 10,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#1f2937',
  },
  badgePillActive: {
    backgroundColor: '#059669',
  },
  badgeEmoji: {
    fontSize: 18,
  },
  badgeLabel: {
    color: '#f8fafc',
    fontWeight: '700',
  },
  badgeMessage: {
    color: '#e2e8f0',
    textAlign: 'center',
  },
});

const ProfileScreenWithNav = ({ navigation }) => (
  <View style={{ flex: 1 }}>
    <ProfileScreenContent navigation={navigation} />
    <BottomNavBar navigation={navigation} activeKey="Profile" />
  </View>
);

export default ProfileScreenWithNav;
