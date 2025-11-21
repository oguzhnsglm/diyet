import React, { useContext, useMemo, useState } from 'react';
import { Alert, SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DietContext } from '../context/DietContext';
import { PrimaryButton } from '../components/common';
import { calculateBMI, healthyWeightRange } from '../logic/utils';
import { styles, colors } from '../styles';

const OnboardingScreen = ({ navigation }) => {
  const { setUser } = useContext(DietContext);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('erkek');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('lose');
  const [targetWeight, setTargetWeight] = useState('');
  const [errors, setErrors] = useState({});

  const parsedAge = Number(age);
  const parsedHeight = Number(height);
  const parsedWeight = Number(weight);
  const parsedTargetWeight = targetWeight ? Number(targetWeight) : null;

  const bmi = useMemo(() => calculateBMI(parsedWeight, parsedHeight), [parsedWeight, parsedHeight]);
  const range = useMemo(() => healthyWeightRange(parsedHeight || 170), [parsedHeight]);

  const calculateBMR = () => {
    if (!parsedWeight || !parsedHeight || !parsedAge) return 0;
    const base = 10 * parsedWeight + 6.25 * parsedHeight - 5 * parsedAge;
    return gender === 'erkek' ? base + 5 : base - 161;
  };

  const suggestedCalories = useMemo(() => {
    const bmr = calculateBMR();
    const factor = goal === 'lose' ? 0.8 : goal === 'maintain' ? 1.0 : 1.1;
    return Math.round(bmr * factor) || 1800;
  }, [goal, parsedAge, parsedHeight, parsedWeight, gender]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'İsim gerekli';
    if (!parsedAge) newErrors.age = 'Yaş sayı olmalı';
    if (!parsedHeight) newErrors.height = 'Boy sayı olmalı';
    if (!parsedWeight) newErrors.weight = 'Kilo sayı olmalı';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSave = async () => {
    if (!validate()) return;
    const user = {
      name: name.trim(),
      age: parsedAge,
      gender,
      heightCm: parsedHeight,
      weightKg: parsedWeight,
      targetWeightKg: parsedTargetWeight,
      dailyCalorieTarget: suggestedCalories,
      dailySugarLimitGr: 50,
    };
    try {
      await setUser(user);
      navigation.replace('Home');
    } catch (error) {
      console.error(error);
      Alert.alert('Hata', 'Veriler kaydedilirken bir sorun oluştu.');
    }
  };

  const genders = [
    { key: 'erkek', label: 'Erkek' },
    { key: 'kadın', label: 'Kadın' },
  ];

  const goals = [
    { key: 'lose', label: 'Kilo ver' },
    { key: 'maintain', label: 'Koru' },
    { key: 'gain', label: 'Kilo al' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[colors.bgGradientStart, colors.bgGradientEnd]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, { marginBottom: 24 }]}>
            <Text style={styles.title}>Hoş Geldiniz! 👋</Text>
            <Text style={styles.muted}>Sağlık hedeflerinizi belirleyelim ve size özel plan oluşturalm</Text>
          </View>

          <Text style={styles.label}>İsim</Text>
          <TextInput
            style={styles.input}
            placeholder="İsminizi girin"
            placeholderTextColor={colors.textLight}
            value={name}
            onChangeText={setName}
          />
          {errors.name && <Text style={styles.error}>{errors.name}</Text>}

          <Text style={styles.label}>Yaş</Text>
          <TextInput
            style={styles.input}
            placeholder="Yaşınızı girin"
            placeholderTextColor={colors.textLight}
            keyboardType="numeric"
            value={age}
            onChangeText={setAge}
          />
          {errors.age && <Text style={styles.error}>{errors.age}</Text>}

          <Text style={styles.label}>Cinsiyet</Text>
          <View style={styles.mealTypeRow}>
            {genders.map((item) => (
              <PrimaryButton
                key={item.key}
                label={item.label}
                variant={gender === item.key ? 'primary' : 'outline'}
                onPress={() => setGender(item.key)}
                style={{ flexBasis: '48%', marginTop: 0 }}
              />
            ))}
          </View>

          <Text style={styles.label}>Boy (cm)</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: 175"
            placeholderTextColor={colors.textLight}
            keyboardType="numeric"
            value={height}
            onChangeText={setHeight}
          />
          {errors.height && <Text style={styles.error}>{errors.height}</Text>}

          <Text style={styles.label}>Kilo (kg)</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: 75"
            placeholderTextColor={colors.textLight}
            keyboardType="numeric"
            value={weight}
            onChangeText={setWeight}
          />
          {errors.weight && <Text style={styles.error}>{errors.weight}</Text>}

          <Text style={styles.label}>Hedef Kilo (Opsiyonel)</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: 70"
            placeholderTextColor={colors.textLight}
            keyboardType="numeric"
            value={targetWeight}
            onChangeText={setTargetWeight}
          />

          <Text style={styles.label}>Hedefiniz</Text>
          <View style={styles.mealTypeRow}>
            {goals.map((item) => (
              <PrimaryButton
                key={item.key}
                label={item.label}
                variant={goal === item.key ? 'primary' : 'outline'}
                onPress={() => setGoal(item.key)}
                style={{ flexBasis: '30%', marginTop: 0 }}
              />
            ))}
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>📊 BMI: {bmi ? bmi.toFixed(1) : '-'}</Text>
            <Text style={styles.infoText}>
              🎯 Sağlıklı kilo aralığı: {range.min.toFixed(1)} - {range.max.toFixed(1)} kg
            </Text>
            <Text style={styles.infoText}>
              🔥 Önerilen günlük kalori: {suggestedCalories} kcal
            </Text>
            <Text style={styles.infoText}>
              🍬 Şeker limiti: 50 gr/gün
            </Text>
          </View>

          <PrimaryButton label="Profili Oluştur ve Başla" onPress={onSave} style={{ marginTop: 20 }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default OnboardingScreen;
