import React, { useContext, useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DietContext } from '../context/DietContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import BottomNavBar from '../components/BottomNavBar';
import BackButton from '../components/BackButton';
import { PrimaryButton, MealTypeSelector } from '../components/common';
import { getTodayISO } from '../logic/utils';
import { estimateFoodNutrition } from '../logic/foodEstimator';
import { styles, colors } from '../styles';

const AddMealScreen = ({ navigation, route }) => {
  const { addMeal } = useContext(DietContext);
  const { isDarkMode, colors: themeColors } = useTheme();
  const { t } = useLanguage();
  const preset = route?.params?.preset || {};
  const [mealType, setMealType] = useState(preset.mealType || 'kahvaltı');
  const [foodName, setFoodName] = useState(preset.foodName || '');
  const [calories, setCalories] = useState(preset.calories ? String(preset.calories) : '');
  const [sugarGrams, setSugarGrams] = useState(
    preset.sugarGrams !== undefined ? String(preset.sugarGrams) : ''
  );
  const [errors, setErrors] = useState({});
  const [aiEstimate, setAiEstimate] = useState(null);

  // Yemek adı değiştiğinde AI tahmini yap ve direkt uygla (debounced)
  useEffect(() => {
    if (foodName.trim().length < 3) {
      setAiEstimate(null);
      return;
    }

    const timeoutId = setTimeout(() => {
      const estimate = estimateFoodNutrition(foodName);
      setAiEstimate(estimate);
      
      // Otomatik uygula (confidence > 50 ise)
      if (estimate && estimate.source !== 'none' && estimate.confidence > 50) {
        setCalories(String(estimate.calories));
        setSugarGrams(String(estimate.sugar));
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [foodName]);

  // AI tahminini uygula
  const applyAiEstimate = () => {
    if (aiEstimate && aiEstimate.source !== 'none') {
      setCalories(String(aiEstimate.calories));
      setSugarGrams(String(aiEstimate.sugar));
    }
  };

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
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <LinearGradient colors={isDarkMode ? ['#1C1C1E', '#000000'] : [colors.bgGradientStart, colors.bgGradientEnd]} style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <BackButton navigation={navigation} />
        </View>
        <ScrollView contentContainerStyle={styles.form}>
          <View style={[styles.card, { marginBottom: 24, backgroundColor: themeColors.cardBackground }]}>
            <Text style={[styles.title, { color: themeColors.text }]}>{t('addMealScreen.addMeal')}</Text>
            <Text style={[styles.muted, { color: themeColors.secondaryText }]}>{t('addMealScreen.subtitle')}</Text>
          </View>

          <Text style={[styles.label, { color: themeColors.text }]}>{t('addMealScreen.mealType')}</Text>
          <MealTypeSelector value={mealType} onChange={setMealType} />

          <Text style={[styles.label, { color: themeColors.text }]}>{t('addMealScreen.mealName')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: themeColors.cardBackground, color: themeColors.text, borderColor: themeColors.border }]}
            placeholder={t('addMealScreen.placeholder')}
            placeholderTextColor={themeColors.secondaryText}
            value={foodName}
            onChangeText={setFoodName}
          />
          {errors.foodName && <Text style={styles.error}>{errors.foodName}</Text>}

          {/* AI Tahmin Kartı */}
          {aiEstimate && aiEstimate.source !== 'none' && (
            <View 
              style={{
                backgroundColor: aiEstimate.confidence > 70 ? '#dcfce7' : '#fef9c3',
                padding: 12,
                borderRadius: 12,
                marginVertical: 8,
                borderWidth: 1,
                borderColor: aiEstimate.confidence > 70 ? '#86efac' : '#fde047'
              }}
            >
              <Text style={{ fontSize: 13, color: '#374151', marginBottom: 4 }}>
                {aiEstimate.message}
              </Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#111827' }}>
                📊 {aiEstimate.calories} kkal • 🍬 {aiEstimate.sugar}g şeker
              </Text>
              <Text style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                ✅ Otomatik uygulandı
              </Text>
            </View>
          )}

          <Text style={[styles.label, { color: themeColors.text }]}>Kalori Miktarı (tahmini)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: themeColors.cardBackground, color: themeColors.text, borderColor: themeColors.border }]}
            placeholder="Kalori (kcal)"
            placeholderTextColor={colors.textLight}
            keyboardType="numeric"
            value={calories}
            onChangeText={setCalories}
          />
          {errors.calories && <Text style={styles.error}>{errors.calories}</Text>}

          <Text style={[styles.label, { color: themeColors.text }]}>Şeker Miktarı (tahmini)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: themeColors.cardBackground, color: themeColors.text, borderColor: themeColors.border }]}
            placeholder="Şeker (gram)"
            placeholderTextColor={themeColors.secondaryText}
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

function AddMealScreenWithNav(props) {
  return (
    <>
      <AddMealScreen {...props} />
      <BottomNavBar navigation={props.navigation} activeKey="Diary" />
    </>
  );
}

export default AddMealScreenWithNav;
