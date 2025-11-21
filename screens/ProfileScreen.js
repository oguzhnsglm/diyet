import React, { useContext, useEffect, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { DietContext } from '../context/DietContext';
import { PrimaryButton } from '../components/common';
import { calculateBMI, healthyWeightRange } from '../logic/utils';
import { styles, colors } from '../styles';

const ProfileScreen = () => {
  const { user, setUser, reloadUser } = useContext(DietContext);
  const [weight, setWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [dailyCalories, setDailyCalories] = useState('');
  const [dailySugar, setDailySugar] = useState('');

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

  const bmi = calculateBMI(Number(weight), user.heightCm);
  const range = healthyWeightRange(user.heightCm);

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

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[colors.bgGradientStart, colors.bgGradientEnd]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.form}>
          <View style={[styles.card, { marginBottom: 20 }]}>
            <Text style={styles.title}>Profil Bilgilerim</Text>
            <Text style={styles.muted}>Kişisel bilgilerinizi ve hedeflerinizi güncelleyin</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>👤 İsim: {user.name}</Text>
            <Text style={styles.infoText}>
              🎂 Yaş: {user.age} | 📏 Boy: {user.heightCm} cm
            </Text>
            <Text style={styles.infoText}>⚖️ BMI: {bmi ? bmi.toFixed(1) : '-'}</Text>
            <Text style={styles.infoText}>
              🎯 Sağlıklı aralık: {range.min.toFixed(1)} - {range.max.toFixed(1)} kg
            </Text>
          </View>

          <Text style={styles.label}>Mevcut Kilonuz (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="Kilo (kg)"
            placeholderTextColor={colors.textLight}
            keyboardType="numeric"
            value={weight}
          onChangeText={setWeight}
          />

          <Text style={styles.label}>Hedef Kilonuz (Opsiyonel)</Text>
          <TextInput
            style={styles.input}
            placeholder="Hedef kilo (opsiyonel)"
            placeholderTextColor={colors.textLight}
            keyboardType="numeric"
            value={targetWeight}
            onChangeText={setTargetWeight}
          />

          <Text style={styles.label}>Günlük Kalori Hedefi</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: 2000"
            placeholderTextColor={colors.textLight}
            keyboardType="numeric"
            value={dailyCalories}
            onChangeText={setDailyCalories}
          />

          <Text style={styles.label}>Günlük Şeker Limiti (gr)</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: 50"
            placeholderTextColor={colors.textLight}
            keyboardType="numeric"
            value={dailySugar}
            onChangeText={setDailySugar}
          />

          <PrimaryButton label="Değişiklikleri Kaydet" onPress={onSave} style={{ marginTop: 16 }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default ProfileScreen;
