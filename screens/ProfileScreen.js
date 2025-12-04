import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { Alert, SafeAreaView, ScrollView, Text, TextInput, View, Pressable, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DietContext } from '../context/DietContext';
import { PrimaryButton } from '../components/common';
import { calculateBMI, healthyWeightRange } from '../logic/utils';
import { styles, colors } from '../styles';

const ProfileScreen = ({ navigation }) => {
  const { user, setUser, reloadUser } = useContext(DietContext);
  const [weight, setWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [dailyCalories, setDailyCalories] = useState('');
  const [dailySugar, setDailySugar] = useState('');
  const [appTheme, setAppTheme] = useState('dark');
  const [glucoseStats, setGlucoseStats] = useState({ value: null, time: null });

  const syncFromUser = (u) => {
    if (!u) return;
    setWeight(String(u.weightKg));
    setTargetWeight(u.targetWeightKg ? String(u.targetWeightKg) : '');
    setDailyCalories(String(u.dailyCalorieTarget));
    setDailySugar(String(u.dailySugarLimitGr));
  };

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const u = await reloadUser();
        syncFromUser(u);
      })();
    }, [reloadUser])
  );

  useEffect(() => {
    syncFromUser(user);
  }, [user]);

  if (!user) {
    return (
      <SafeAreaView style={styles.containerCenter}>
        <Text style={{ color: '#fff' }}>Kullanıcı bulunamadı.</Text>
      </SafeAreaView>
    );
  }

  const numericWeight = Number(weight) || Number(user.weightKg) || 0;
  const bmi = calculateBMI(numericWeight, user.heightCm);
  const range = healthyWeightRange(user.heightCm);

  const privacyInfo = useMemo(
    () => ({
      email: user.email || 'kullanici@ornek.com',
      phone: user.phoneNumber || '+90 ••• •• ••',
      lastLogin: user.lastLoginAt || '04 Aralık 2025 • 09:42',
    }),
    [user.email, user.phoneNumber, user.lastLoginAt]
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

  useFocusEffect(
    useCallback(() => {
      loadGlucose();
    }, [loadGlucose])
  );

  const onSave = async () => {
    const updated = {
      ...user,
      weightKg: Number(weight) || user.weightKg,
      targetWeightKg: targetWeight ? Number(targetWeight) : null,
      dailyCalorieTarget: Number(dailyCalories) || user.dailyCalorieTarget,
      dailySugarLimitGr: Number(dailySugar) || user.dailySugarLimitGr,
    };
    await setUser(updated);
    Alert.alert('Güncellendi', 'Profil bilgilerin kaydedildi.');
  };

  const formattedGlucose = glucoseStats.value ? `${glucoseStats.value} mg/dL` : 'Henüz ölçüm yok';
  const formattedGlucoseTime = glucoseStats.time ? new Date(glucoseStats.time).toLocaleString('tr-TR') : '';

  const themeOptions = [
    { id: 'light', label: 'Açık', description: 'Daha parlak arayüz', emoji: '🌤️' },
    { id: 'dark', label: 'Koyu', description: 'Göz yormayan mod', emoji: '🌙' },
  ];

  return (
    <SafeAreaView style={profileStyles.container}>
      <LinearGradient colors={['#fdfcfb', '#e2ebf0']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={profileStyles.content}>
          <View style={profileStyles.headerCard}>
            <Text style={profileStyles.headerLabel}>Profile</Text>
            <Text style={profileStyles.headerName}>{user.name}</Text>
            <Text style={profileStyles.headerSub}>Sağlık verilerin tek ekranda</Text>
          </View>

          <View style={profileStyles.metricRow}>
            <View style={profileStyles.metricCard}>
              <Text style={profileStyles.metricLabel}>Kan Şekeri</Text>
              <Text style={profileStyles.metricValue}>{formattedGlucose}</Text>
              {formattedGlucoseTime ? (
                <Text style={profileStyles.metricHint}>{formattedGlucoseTime}</Text>
              ) : null}
            </View>
            <View style={profileStyles.metricCard}>
              <Text style={profileStyles.metricLabel}>Güncel Kilo</Text>
              <Text style={profileStyles.metricValue}>{numericWeight.toFixed(1)} kg</Text>
              <Text style={profileStyles.metricHint}>BMI {bmi ? bmi.toFixed(1) : '-'} • Boy {user.heightCm} cm</Text>
            </View>
          </View>

          <View style={profileStyles.formCard}>
            <Text style={profileStyles.sectionTitle}>Hedeflerini Güncelle</Text>
            <Text style={profileStyles.sectionHint}>Veriler Planner ve Dashboard ile senkron kalır.</Text>
            <View style={profileStyles.inputGroup}>
              <Text style={profileStyles.inputLabel}>Mevcut Kilo (kg)</Text>
              <TextInput
                style={profileStyles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder="Örn: 70"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <View style={profileStyles.inputGroup}>
              <Text style={profileStyles.inputLabel}>Hedef Kilo</Text>
              <TextInput
                style={profileStyles.input}
                value={targetWeight}
                onChangeText={setTargetWeight}
                keyboardType="numeric"
                placeholder="Örn: 60"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <View style={profileStyles.inputGroup}>
              <Text style={profileStyles.inputLabel}>Günlük Kalori</Text>
              <TextInput
                style={profileStyles.input}
                value={dailyCalories}
                onChangeText={setDailyCalories}
                keyboardType="numeric"
                placeholder="Örn: 1800"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <View style={profileStyles.inputGroup}>
              <Text style={profileStyles.inputLabel}>Günlük Şeker Limiti</Text>
              <TextInput
                style={profileStyles.input}
                value={dailySugar}
                onChangeText={setDailySugar}
                keyboardType="numeric"
                placeholder="Örn: 50"
                placeholderTextColor="#94a3b8"
              />
            </View>
            <PrimaryButton label="Kaydet" onPress={onSave} style={{ marginTop: 12 }} />
          </View>

          <View style={profileStyles.buttonCard}>
            <View style={profileStyles.buttonHeader}>
              <Text style={profileStyles.buttonTitle}>Gizlilik</Text>
              <Text style={profileStyles.buttonSubtitle}>Hesap ve giriş bilgilerini görüntüle</Text>
            </View>
            <View style={profileStyles.privacyRow}>
              <Text style={profileStyles.privacyLabel}>E-posta</Text>
              <Text style={profileStyles.privacyValue}>{privacyInfo.email}</Text>
            </View>
            <View style={profileStyles.privacyRow}>
              <Text style={profileStyles.privacyLabel}>Telefon</Text>
              <Text style={profileStyles.privacyValue}>{privacyInfo.phone}</Text>
            </View>
            <View style={profileStyles.privacyRow}>
              <Text style={profileStyles.privacyLabel}>Son giriş</Text>
              <Text style={profileStyles.privacyValue}>{privacyInfo.lastLogin}</Text>
            </View>
            <PrimaryButton
              label="Giriş bilgilerini düzenle"
              variant="outline"
              onPress={() => Alert.alert('Bilgi', 'Bu ekran yakında aktif olacak')}
              style={profileStyles.secondaryButton}
            />
          </View>

          <View style={profileStyles.buttonCard}>
            <View style={profileStyles.buttonHeader}>
              <Text style={profileStyles.buttonTitle}>Kişiselleştirme</Text>
              <Text style={profileStyles.buttonSubtitle}>Arayüz temasını seç</Text>
            </View>
            <View style={profileStyles.themeRow}>
              {themeOptions.map(option => {
                const active = appTheme === option.id;
                return (
                  <Pressable
                    key={option.id}
                    style={[profileStyles.themeTile, active && profileStyles.themeTileActive]}
                    onPress={() => setAppTheme(option.id)}
                  >
                    <Text style={profileStyles.themeEmoji}>{option.emoji}</Text>
                    <Text style={profileStyles.themeLabel}>{option.label}</Text>
                    <Text style={profileStyles.themeHint}>{option.description}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default ProfileScreen;

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
});
