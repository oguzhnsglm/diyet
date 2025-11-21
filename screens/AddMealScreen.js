import React, { useContext, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DietContext } from '../context/DietContext';
import { PrimaryButton, MealTypeSelector } from '../components/common';
import { getTodayISO } from '../logic/utils';
import { styles, colors } from '../styles';

const AddMealScreen = ({ navigation, route }) => {
  const { addMeal } = useContext(DietContext);
  const preset = route?.params?.preset || {};
  const [mealType, setMealType] = useState(preset.mealType || 'kahvaltı');
  const [foodName, setFoodName] = useState(preset.foodName || '');
  const [calories, setCalories] = useState(preset.calories ? String(preset.calories) : '');
  const [sugarGrams, setSugarGrams] = useState(
    preset.sugarGrams !== undefined ? String(preset.sugarGrams) : ''
  );
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!foodName.trim()) newErrors.foodName = 'Ne yediğini yazmalısın';
    if (!Number(calories)) newErrors.calories = 'Kalori sayı olmalı';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSave = async () => {
    if (!validate()) return;
    const todayISO = getTodayISO();
    const meal = {
      id: Date.now().toString(),
      dateISO: todayISO,
      mealType,
      foodName: foodName.trim(),
      calories: Number(calories),
      sugarGrams: sugarGrams ? Number(sugarGrams) : 0,
    };
    await addMeal(meal);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[colors.bgGradientStart, colors.bgGradientEnd]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.form}>
          <View style={[styles.card, { marginBottom: 24 }]}>
            <Text style={styles.title}>Öğün Ekle</Text>
            <Text style={styles.muted}>Yediğiniz yemeği ve besin değerlerini kaydedin</Text>
          </View>

          <Text style={styles.label}>Öğün Türü</Text>
          <MealTypeSelector value={mealType} onChange={setMealType} />

          <Text style={styles.label}>Yemek Adı</Text>
          <TextInput
            style={styles.input}
            placeholder="Ne yediniz?"
            placeholderTextColor={colors.textLight}
            value={foodName}
            onChangeText={setFoodName}
          />
          {errors.foodName && <Text style={styles.error}>{errors.foodName}</Text>}

          <Text style={styles.label}>Kalori Miktarı</Text>
          <TextInput
            style={styles.input}
            placeholder="Kalori (kcal)"
            placeholderTextColor={colors.textLight}
            keyboardType="numeric"
            value={calories}
            onChangeText={setCalories}
          />
          {errors.calories && <Text style={styles.error}>{errors.calories}</Text>}

          <Text style={styles.label}>Şeker Miktarı (Opsiyonel)</Text>
          <TextInput
            style={styles.input}
            placeholder="Şeker (gram)"
            placeholderTextColor={colors.textLight}
            keyboardType="numeric"
            value={sugarGrams}
            onChangeText={setSugarGrams}
          />

          <PrimaryButton label="Öğünü Kaydet" onPress={onSave} style={{ marginTop: 16 }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default AddMealScreen;
