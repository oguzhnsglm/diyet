import React, { useContext, useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DietContext } from '../context/DietContext';
import { styles, colors } from '../styles';

const suggestions = [
  { name: 'Yulaf lapası, yoğurt ve çilek', calories: 320, sugarGrams: 12, suitableForDiabetes: true },
  { name: 'Haşlanmış yumurta, avokado ve tam buğday ekmeği', calories: 280, sugarGrams: 4, suitableForDiabetes: true },
  { name: 'Izgara tavuklu sebze salatası', calories: 350, sugarGrams: 6, suitableForDiabetes: true },
  { name: 'Mercimek çorbası ve yoğurt', calories: 300, sugarGrams: 7, suitableForDiabetes: true },
  { name: 'Fırında somon, kinoalı salata', calories: 450, sugarGrams: 5, suitableForDiabetes: true },
  { name: 'Meyveli yoğurt (şekersiz) ve ceviz', calories: 220, sugarGrams: 10, suitableForDiabetes: true },
  { name: 'Humus ve çiğ sebze tabağı', calories: 200, sugarGrams: 3, suitableForDiabetes: true },
  { name: 'Izgara köfte, bulgur pilavı, cacık', calories: 520, sugarGrams: 9, suitableForDiabetes: false },
  { name: 'Ton balıklı sandviç (tam buğday)', calories: 400, sugarGrams: 5, suitableForDiabetes: true },
];

const RecommendationsScreen = ({ navigation, route }) => {
  const { user, meals, refreshTodayMeals } = useContext(DietContext);
  const [overrideRemaining] = useState({
    calories: route.params?.remainingCalories ?? null,
    sugar: route.params?.remainingSugar ?? null,
  });

  useEffect(() => {
    refreshTodayMeals();
  }, [refreshTodayMeals]);

  const computed = useMemo(() => {
    if (!user) return { remainingCalories: 0, remainingSugar: 0 };
    const totalCalories = meals.reduce((sum, m) => sum + Number(m.calories || 0), 0);
    const totalSugar = meals.reduce((sum, m) => sum + Number(m.sugarGrams || 0), 0);
    return {
      remainingCalories: user.dailyCalorieTarget - totalCalories,
      remainingSugar: user.dailySugarLimitGr - totalSugar,
    };
  }, [user, meals]);

  const remainingCalories =
    overrideRemaining.calories === null ? computed.remainingCalories : overrideRemaining.calories;
  const remainingSugar =
    overrideRemaining.sugar === null ? computed.remainingSugar : overrideRemaining.sugar;

  const filtered = suggestions.filter((item) => {
    const calOk = remainingCalories == null ? true : item.calories <= remainingCalories + 150;
    const sugarOk = remainingSugar == null ? true : item.sugarGrams <= remainingSugar + 10;
    return calOk && sugarOk;
  });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[colors.bgGradientStart, colors.bgGradientEnd]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.card, { marginBottom: 20 }]}>
            <Text style={styles.title}>Akıllı Öneriler 🍽️</Text>
            <Text style={styles.muted}>Size özel sağlıklı öğün önerileri</Text>
          </View>

          {user && (
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                📊 Kalan kalori: {remainingCalories} kcal
              </Text>
              <Text style={styles.infoText}>
                🍬 Kalan şeker: {remainingSugar} gr
              </Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Önerilen Yemekler</Text>
          {filtered.length === 0 && (
            <View style={[styles.card, { alignItems: 'center', padding: 32 }]}>
              <Text style={[styles.muted, { textAlign: 'center' }]}>
                Maalesef uygun öneri bulunamadı. Günlük limitinizi kontrol edin.
              </Text>
            </View>
          )}
          {filtered.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.suggestionCard}
              activeOpacity={0.7}
              onPress={() =>
                navigation.navigate('AddMeal', {
                  preset: {
                    mealType: 'öğle',
                    foodName: item.name,
                    calories: item.calories,
                    sugarGrams: item.sugarGrams,
                  },
                })
              }
            >
              <Text style={styles.mealTitle}>{item.name}</Text>
              <Text style={styles.mealMeta}>
                🔥 {item.calories} kcal • 🍬 {item.sugarGrams} gr şeker
              </Text>
              {item.suitableForDiabetes && (
                <View style={{ 
                  backgroundColor: colors.infoBg, 
                  paddingHorizontal: 12, 
                  paddingVertical: 6, 
                  borderRadius: 12,
                  alignSelf: 'flex-start',
                  marginTop: 8
                }}>
                  <Text style={[styles.badge, { marginTop: 0 }]}>✓ Diyabet için uygun</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default RecommendationsScreen;
