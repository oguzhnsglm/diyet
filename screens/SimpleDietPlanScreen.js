﻿import React, { useMemo, useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView, ScrollView, Text, View, Pressable, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import NutritionTracker from './NutritionTracker';
import { addQuickAction, getQuickActions } from '../logic/quickActions';

const FOOD_DATABASE_BASE = [
  // Kahvaltı - Sadece Sağlıklı
  { id: 1, name: 'Tam buğday ekmeği (1 dilim)', calories: 70, sugar: 1, protein: 3, fat: 1, category: 'Kahvaltı', recommended: true, advice: 'Önerilen - Düşük glisemik indeks' },
  { id: 2, name: 'Yumurta (1 adet)', calories: 78, sugar: 0.6, protein: 6.3, fat: 5.3, category: 'Kahvaltı', recommended: true, advice: 'Önerilen - Protein kaynağı' },
  { id: 3, name: 'Peynir (30g)', calories: 100, sugar: 0.5, protein: 6, fat: 7.5, category: 'Kahvaltı', recommended: true, advice: 'Önerilen - Kalsiyum açısından zengin' },
  { id: 4, name: 'Zeytin (10 adet)', calories: 50, sugar: 0, protein: 0.3, fat: 4.5, category: 'Kahvaltı', recommended: true, advice: 'Önerilen - Sağlıklı yağ içerir' },
  { id: 5, name: 'Yoğurt (yağsız, 200g)', calories: 100, sugar: 7, protein: 7, fat: 0.4, category: 'Kahvaltı', recommended: true, advice: 'Önerilen - Probiyotik içerir' },
  
  // Ana Yemekler - Sadece Sağlıklı
  { id: 7, name: 'Izgara tavuk göğsü (150g)', calories: 165, sugar: 0, protein: 31, fat: 3.6, category: 'Ana Yemek', recommended: true, advice: 'Önerilen - Yağsız protein kaynağı' },
  { id: 13, name: 'Izgara köfte (100g)', calories: 250, sugar: 0, protein: 26, fat: 17, category: 'Ana Yemek', recommended: true, advice: 'Önerilen - Protein açısından zengin' },
  { id: 8, name: 'Basmati pilavı (tereyağlı, 1 porsiyon)', calories: 200, sugar: 0.2, protein: 4, fat: 8, category: 'Ana Yemek', recommended: true, advice: 'Önerilen - Tercihen tereyağlı' },
  { id: 9, name: 'Basmati pilavı (zeytinyağlı, 1 porsiyon)', calories: 190, sugar: 0.2, protein: 4, fat: 7, category: 'Ana Yemek', recommended: true, advice: 'Önerilen - Tercihen zeytinyağlı (Daha sağlıklı)' },
  { id: 10, name: 'Bulgur pilavı (1 porsiyon)', calories: 150, sugar: 0.3, protein: 5, fat: 1, category: 'Ana Yemek', recommended: true, advice: 'Önerilen - Lif açısından zengin, düşük glisemik' },
  { id: 11, name: 'Zeytinyağlı fasulye (1 porsiyon)', calories: 180, sugar: 3, protein: 9, fat: 5, category: 'Ana Yemek', recommended: true, advice: 'Önerilen - Lif ve protein içerir' },
  { id: 12, name: 'Mercimek çorbası (1 kase)', calories: 120, sugar: 2, protein: 8, fat: 0.4, category: 'Ana Yemek', recommended: true, advice: 'Önerilen - Protein ve lif kaynağı' },
  { id: 30, name: 'Izgara somon (150g)', calories: 280, sugar: 0, protein: 39, fat: 13, category: 'Ana Yemek', recommended: true, advice: 'Önerilen - Omega-3 açısından zengin' },
  
  // Salata ve Sebzeler
  { id: 16, name: 'Mevsim salatası (zeytinyağlı)', calories: 80, sugar: 3, protein: 2, fat: 7, category: 'Salata', recommended: true, advice: 'Önerilen - Her öğünde tüketin' },
  { id: 17, name: 'Çoban salatası', calories: 90, sugar: 4, protein: 3, fat: 5, category: 'Salata', recommended: true, advice: 'Önerilen - Vitamin ve mineral kaynağı' },
  { id: 18, name: 'Haşlanmış brokoli (1 porsiyon)', calories: 55, sugar: 2, protein: 4, fat: 0.6, category: 'Sebze', recommended: true, advice: 'Önerilen - Antioksidan açısından zengin' },
  { id: 19, name: 'Közlenmiş patlıcan salatası', calories: 120, sugar: 5, protein: 3, fat: 8, category: 'Salata', recommended: true, advice: 'Önerilen - Lif içeriği yüksek' },
  { id: 31, name: 'Kinoa salatası', calories: 180, sugar: 2, protein: 8, fat: 3, category: 'Salata', recommended: true, advice: 'Önerilen - Tam protein kaynağı' },
  
  // Meyveler
  { id: 22, name: 'Elma (1 adet orta boy)', calories: 95, sugar: 19, protein: 0.5, fat: 0.3, category: 'Meyve', recommended: true, advice: 'Önerilen - Doğal şeker, lif içerir' },
  { id: 23, name: 'Muz (1 adet)', calories: 105, sugar: 14, protein: 1.3, fat: 0.3, category: 'Meyve', recommended: true, advice: 'Önerilen - Potasyum kaynağı, ölçülü tüketin' },
  { id: 32, name: 'Yaban mersini (1 kase)', calories: 85, sugar: 15, protein: 1, fat: 0.5, category: 'Meyve', recommended: true, advice: 'Önerilen - Antioksidan bombası' },
  { id: 33, name: 'Kivi (1 adet)', calories: 42, sugar: 6, protein: 0.8, fat: 0.4, category: 'Meyve', recommended: true, advice: 'Önerilen - C vitamini açısından zengin' },
  
  // Atıştırmalıklar - Sadece Sağlıklı
  { id: 20, name: 'Badem (30g)', calories: 170, sugar: 1.2, protein: 6, fat: 15, category: 'Atıştırmalık', recommended: true, advice: 'Önerilen - Sağlıklı yağ ve protein içerir' },
  { id: 21, name: 'Ceviz (30g)', calories: 195, sugar: 0.8, protein: 4.5, fat: 18, category: 'Atıştırmalık', recommended: true, advice: 'Önerilen - Omega-3 kaynağı' },
  { id: 34, name: 'Fındık (30g)', calories: 180, sugar: 1, protein: 4, fat: 17, category: 'Atıştırmalık', recommended: true, advice: 'Önerilen - E vitamini kaynağı' },
  { id: 35, name: 'Havuç çubukları', calories: 50, sugar: 6, protein: 1, fat: 0.2, category: 'Atıştırmalık', recommended: true, advice: 'Önerilen - Düşük kalorili, beta karoten' },
  { id: 36, name: 'Humus (2 yemek kaşığı)', calories: 70, sugar: 1, protein: 2, fat: 3, category: 'Atıştırmalık', recommended: true, advice: 'Önerilen - Protein ve lif içerir' },
];

const KITCHEN_MEASURE_HINTS = {
  3: '≈ 2 yemek kaşığı rendelenmiş',
  5: '≈ 1 su bardağı',
  7: '≈ avuç içi büyüklüğünde 1 parça',
  8: '≈ 5 yemek kaşığı pişmiş',
  9: '≈ 5 yemek kaşığı pişmiş',
  10: '≈ 4 yemek kaşığı pişmiş',
  11: '≈ küçük servis kasesi (1 su bardağı)',
  12: '≈ 1 kepçe',
  13: '≈ 3 küçük köfte',
  16: '≈ orta boy kase',
  17: '≈ orta boy kase',
  18: '≈ 1 su bardağı haşlanmış',
  19: '≈ küçük servis kasesi',
  20: '≈ 1 avuç (23 adet)',
  21: '≈ 7 bütün ceviz içi',
  30: '≈ avuç içi büyüklüğünde 1 fileto',
  31: '≈ orta boy kase',
  32: '≈ 1 su bardağı',
  34: '≈ 1 avuç (20 adet)',
  35: '≈ 2 orta boy havuç',
  36: '≈ 2 dolu yemek kaşığı',
};

const FOOD_DATABASE = FOOD_DATABASE_BASE.map(food => ({
  ...food,
  kitchenMeasure: KITCHEN_MEASURE_HINTS[food.id],
}));

const QUICK_CATEGORY = 'foods';

const SimpleDietPlanScreen = () => {
  const navigation = useNavigation();
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Tümü');
  const [quickFoods, setQuickFoods] = useState([]);

  const categories = ['Tümü', 'Kahvaltı', 'Ana Yemek', 'Salata', 'Sebze', 'Meyve', 'Atıştırmalık'];
  const dailyCalorieTarget = 2000;
  const dailySugarLimit = 50;

  useEffect(() => {
    const loadQuick = async () => {
      const stored = await getQuickActions(QUICK_CATEGORY);
      setQuickFoods(stored);
    };
    loadQuick();
  }, []);

  const filteredFoods = useMemo(() => {
    if (activeCategory === 'Tümü') return FOOD_DATABASE;
    return FOOD_DATABASE.filter(food => food.category === activeCategory);
  }, [activeCategory]);

  // Toplamları seçilen miktara göre hesapla
  const totalCalories = useMemo(() =>
    selectedFoods.reduce((sum, food) => sum + (food.calories * (food.count || 1)), 0),
    [selectedFoods]
  );
  const totalSugar = useMemo(() =>
    selectedFoods.reduce((sum, food) => sum + (food.sugar * (food.count || 1)), 0),
    [selectedFoods]
  );
  const totalProtein = useMemo(() =>
    selectedFoods.reduce((sum, food) => sum + (food.protein * (food.count || 1)), 0),
    [selectedFoods]
  );
  const totalFat = useMemo(() =>
    selectedFoods.reduce((sum, food) => sum + (food.fat * (food.count || 1)), 0),
    [selectedFoods]
  );

  const remainingCalories = dailyCalorieTarget - totalCalories;
  const remainingSugar = dailySugarLimit - totalSugar;

  const toggleFood = (food) => {
    const exists = selectedFoods.find(f => f.id === food.id);
    if (exists) {
      setSelectedFoods(selectedFoods.filter(f => f.id !== food.id));
    } else {
      setSelectedFoods([...selectedFoods, food]);
    }
  };

  const savePlan = () => {
    if (selectedFoods.length === 0) {
      Alert.alert('Uyarı', 'Lütfen en az bir yiyecek seçin');
      return;
    }
    // Send stats to MainScreen and navigate
    navigation.navigate('Main', {
      stats: {
        calories: totalCalories,
        sugar: totalSugar,
        protein: totalProtein,
        fat: totalFat,
      },
      calorieLimit: dailyCalorieTarget,
    });
    setSelectedFoods([]);
  };

  const clearSelection = () => {
    setSelectedFoods([]);
  };

  const handleQuickAddFood = (food) => {
    const exists = selectedFoods.find((f) => f.id === food.id);
    if (exists) {
      setSelectedFoods(
        selectedFoods.map((f) => (f.id === food.id ? { ...f, count: (f.count || 1) + 1 } : f))
      );
    } else {
      setSelectedFoods([...selectedFoods, { ...food, count: 1 }]);
    }
  };

  const handleSaveFoodFavorite = async (food) => {
    const payload = {
      id: food.id,
      name: food.name,
      calories: food.calories,
      sugar: food.sugar,
      protein: food.protein,
      fat: food.fat,
      category: food.category,
    };
    const updated = await addQuickAction(QUICK_CATEGORY, payload);
    setQuickFoods(updated);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#E8F5E9', '#F5F7FA']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Nutrition Tracker Bileşeni */}
          <NutritionTracker
            calories={totalCalories}
            sugar={totalSugar}
            protein={totalProtein}
            fat={totalFat}
          />

          {quickFoods.length > 0 && (
            <View style={styles.quickSection}>
              <Text style={styles.sectionTitle}>Sık Seçtiklerin</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {quickFoods.map((food) => (
                  <Pressable
                    key={food.id}
                    style={styles.quickChip}
                    onPress={() => handleQuickAddFood(food)}
                  >
                    <Text style={styles.quickChipTitle}>{food.name}</Text>
                    <Text style={styles.quickChipInfo}>{food.calories} kcal • {food.sugar} gr şeker</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Seçilen Yiyecekler */}
          {selectedFoods.length > 0 && (
            <View style={styles.selectedBox}>
              <View style={styles.selectedHeader}>
                <Text style={styles.selectedTitle}>Seçilen Yiyecekler ({selectedFoods.length})</Text>
                <Pressable onPress={clearSelection}>
                  <Text style={styles.clearButton}>Temizle</Text>
                </Pressable>
              </View>
              {selectedFoods.map(food => (
                <Text key={food.id} style={styles.selectedItem}>
                   {food.name} - {food.calories} kcal
                </Text>
              ))}
            </View>
          )}

          {/* Kategori Seçimi */}
          <Text style={styles.sectionTitle}>Kategori Seç</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map(cat => (
              <Pressable
                key={cat}
                style={[styles.categoryButton, activeCategory === cat && styles.categoryButtonActive]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* YEMEK LİSTESİ GERİ EKLENDİ */}
          <Text style={styles.sectionTitle}>Yemek Listesi ({filteredFoods.length})</Text>
          {filteredFoods.map(food => {
            const selectedFood = selectedFoods.find(f => f.id === food.id);
            const count = selectedFood?.count || 0;
            return (
              <View key={food.id} style={[styles.foodCard, count > 0 && styles.foodCardSelected]}> 
                <View style={styles.foodHeader}>
                  <View style={styles.checkbox}>{count > 0 ? <Text style={styles.checkmark}>✓</Text> : null}</View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.foodName}>{food.name}</Text>
                    <Text style={styles.foodMeta}>{food.calories} kcal | {food.sugar} gr şeker | {food.protein || 0} gr protein | {food.fat || 0} gr yağ</Text>
                    {food.kitchenMeasure && (
                      <Text style={styles.foodMeasure}>{food.kitchenMeasure}</Text>
                    )}
                    <Text style={styles.foodAdvice}>{food.advice}</Text>
                  </View>
                  <Pressable style={styles.quickSaveBtn} onPress={() => handleSaveFoodFavorite(food)}>
                    <Text style={styles.quickSaveText}>☆</Text>
                  </Pressable>
                  <View style={styles.counterBox}>
                    <Pressable
                      style={styles.counterBtn}
                      onPress={() => {
                        if (count > 0) {
                          setSelectedFoods(selectedFoods.map(f => f.id === food.id ? { ...f, count: f.count - 1 } : f).filter(f => f.count > 0));
                        }
                      }}
                    >
                      <Text style={styles.counterText}>-</Text>
                    </Pressable>
                    <Text style={styles.counterValue}>{count}</Text>
                    <Pressable
                      style={styles.counterBtn}
                      onPress={() => {
                        if (selectedFood) {
                          setSelectedFoods(selectedFoods.map(f => f.id === food.id ? { ...f, count: f.count + 1 } : f));
                        } else {
                          setSelectedFoods([...selectedFoods, { ...food, count: 1 }]);
                        }
                      }}
                    >
                      <Text style={styles.counterText}>+</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}

          {/* Kaydet Butonu */}
          <Pressable 
            style={[styles.saveButton, selectedFoods.length === 0 && styles.saveButtonDisabled]} 
            onPress={savePlan}
            disabled={selectedFoods.length === 0}
          >
            <Text style={styles.saveButtonText}>
              Diyet Planını Kaydet ({selectedFoods.length} öğe)
            </Text>
          </Pressable>

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
  selectedBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  clearButton: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '500',
  },
  selectedItem: {
    fontSize: 13,
    color: '#1B5E20',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginTop: 8,
    marginBottom: 12,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryButton: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: 'white',
  },
  foodCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  foodCardSelected: {
    backgroundColor: '#E8F5E9',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  foodHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  foodName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
  },
  foodMeta: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  foodAdvice: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
    marginTop: 2,
  },
  foodMeasure: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 2,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickSection: {
    marginTop: 12,
    marginBottom: 12,
  },
  quickChip: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 14,
    marginRight: 10,
    minWidth: 180,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },
  quickChipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1b5e20',
  },
  quickChipInfo: {
    fontSize: 12,
    color: '#2e7d32',
    marginTop: 4,
  },
  counterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  counterBtn: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginHorizontal: 2,
  },
  counterText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  counterValue: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 4,
  },
  quickSaveBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#fff8e1',
    marginLeft: 6,
  },
  quickSaveText: {
    fontSize: 16,
    color: '#f59e0b',
  },
});

export default SimpleDietPlanScreen;
