import React, { useState, useMemo } from 'react';
import { SafeAreaView, ScrollView, Text, View, Pressable, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const FOOD_DATABASE = [
  // Kahvaltı - Sadece Sağlıklı
  { id: 1, name: 'Tam buğday ekmeği (1 dilim)', calories: 70, sugar: 1, category: 'Kahvaltı', recommended: true, advice: 'Önerilen - Düşük glisemik indeks' },
  { id: 2, name: 'Yumurta (1 adet)', calories: 78, sugar: 0.6, category: 'Kahvaltı', recommended: true, advice: 'Önerilen - Protein kaynağı' },
  { id: 3, name: 'Peynir (30g)', calories: 100, sugar: 0.5, category: 'Kahvaltı', recommended: true, advice: 'Önerilen - Kalsiyum açısından zengin' },
  { id: 4, name: 'Zeytin (10 adet)', calories: 50, sugar: 0, category: 'Kahvaltı', recommended: true, advice: 'Önerilen - Sağlıklı yağ içerir' },
  { id: 5, name: 'Yoğurt (yağsız, 200g)', calories: 100, sugar: 7, category: 'Kahvaltı', recommended: true, advice: 'Önerilen - Probiyotik içerir' },
  
  // Ana Yemekler - Sadece Sağlıklı
  { id: 7, name: 'Izgara tavuk göğsü (150g)', calories: 165, sugar: 0, category: 'Ana Yemek', recommended: true, advice: 'Önerilen - Yağsız protein kaynağı' },
  { id: 13, name: 'Izgara köfte (100g)', calories: 250, sugar: 0, category: 'Ana Yemek', recommended: true, advice: 'Önerilen - Protein açısından zengin' },
  { id: 8, name: 'Basmati pilavı (tereyağlı, 1 porsiyon)', calories: 200, sugar: 0.2, category: 'Ana Yemek', recommended: true, advice: 'Önerilen - Tercihen tereyağlı' },
  { id: 9, name: 'Basmati pilavı (zeytinyağlı, 1 porsiyon)', calories: 190, sugar: 0.2, category: 'Ana Yemek', recommended: true, advice: 'Önerilen - Tercihen zeytinyağlı (Daha sağlıklı)' },
  { id: 10, name: 'Bulgur pilavı (1 porsiyon)', calories: 150, sugar: 0.3, category: 'Ana Yemek', recommended: true, advice: 'Önerilen - Lif açısından zengin, düşük glisemik' },
  { id: 11, name: 'Zeytinyağlı fasulye (1 porsiyon)', calories: 180, sugar: 3, category: 'Ana Yemek', recommended: true, advice: 'Önerilen - Lif ve protein içerir' },
  { id: 12, name: 'Mercimek çorbası (1 kase)', calories: 120, sugar: 2, category: 'Ana Yemek', recommended: true, advice: 'Önerilen - Protein ve lif kaynağı' },
  { id: 30, name: 'Izgara somon (150g)', calories: 280, sugar: 0, category: 'Ana Yemek', recommended: true, advice: 'Önerilen - Omega-3 açısından zengin' },
  
  // Salata ve Sebzeler
  { id: 16, name: 'Mevsim salatası (zeytinyağlı)', calories: 80, sugar: 3, category: 'Salata', recommended: true, advice: 'Önerilen - Her öğünde tüketin' },
  { id: 17, name: 'Çoban salatası', calories: 90, sugar: 4, category: 'Salata', recommended: true, advice: 'Önerilen - Vitamin ve mineral kaynağı' },
  { id: 18, name: 'Haşlanmış brokoli (1 porsiyon)', calories: 55, sugar: 2, category: 'Sebze', recommended: true, advice: 'Önerilen - Antioksidan açısından zengin' },
  { id: 19, name: 'Közlenmiş patlıcan salatası', calories: 120, sugar: 5, category: 'Salata', recommended: true, advice: 'Önerilen - Lif içeriği yüksek' },
  { id: 31, name: 'Kinoa salatası', calories: 180, sugar: 2, category: 'Salata', recommended: true, advice: 'Önerilen - Tam protein kaynağı' },
  
  // Meyveler
  { id: 22, name: 'Elma (1 adet orta boy)', calories: 95, sugar: 19, category: 'Meyve', recommended: true, advice: 'Önerilen - Doğal şeker, lif içerir' },
  { id: 23, name: 'Muz (1 adet)', calories: 105, sugar: 14, category: 'Meyve', recommended: true, advice: 'Önerilen - Potasyum kaynağı, ölçülü tüketin' },
  { id: 32, name: 'Yaban mersini (1 kase)', calories: 85, sugar: 15, category: 'Meyve', recommended: true, advice: 'Önerilen - Antioksidan bombası' },
  { id: 33, name: 'Kivi (1 adet)', calories: 42, sugar: 6, category: 'Meyve', recommended: true, advice: 'Önerilen - C vitamini açısından zengin' },
  
  // Atıştırmalıklar - Sadece Sağlıklı
  { id: 20, name: 'Badem (30g)', calories: 170, sugar: 1.2, category: 'Atıştırmalık', recommended: true, advice: 'Önerilen - Sağlıklı yağ ve protein içerir' },
  { id: 21, name: 'Ceviz (30g)', calories: 195, sugar: 0.8, category: 'Atıştırmalık', recommended: true, advice: 'Önerilen - Omega-3 kaynağı' },
  { id: 34, name: 'Fındık (30g)', calories: 180, sugar: 1, category: 'Atıştırmalık', recommended: true, advice: 'Önerilen - E vitamini kaynağı' },
  { id: 35, name: 'Havuç çubukları', calories: 50, sugar: 6, category: 'Atıştırmalık', recommended: true, advice: 'Önerilen - Düşük kalorili, beta karoten' },
  { id: 36, name: 'Humus (2 yemek kaşığı)', calories: 70, sugar: 1, category: 'Atıştırmalık', recommended: true, advice: 'Önerilen - Protein ve lif içerir' },
];

const SimpleDietPlanScreen = () => {
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Tümü');

  const categories = ['Tümü', 'Kahvaltı', 'Ana Yemek', 'Salata', 'Sebze', 'Meyve', 'Atıştırmalık'];
  const dailyCalorieTarget = 2000;
  const dailySugarLimit = 50;

  const filteredFoods = useMemo(() => {
    if (activeCategory === 'Tümü') return FOOD_DATABASE;
    return FOOD_DATABASE.filter(food => food.category === activeCategory);
  }, [activeCategory]);

  const totalCalories = useMemo(() =>
    selectedFoods.reduce((sum, food) => sum + food.calories, 0),
    [selectedFoods]
  );

  const totalSugar = useMemo(() =>
    selectedFoods.reduce((sum, food) => sum + food.sugar, 0),
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
    Alert.alert(
      'Diyet Planı Kaydedildi',
      (selectedFoods.length) + ' yiyecek seçtiniz.\nToplam: ' + totalCalories + ' kalori\nŞeker: ' + totalSugar.toFixed(1) + ' gr',
      [{ text: 'Tamam', onPress: () => setSelectedFoods([]) }]
    );
  };

  const clearSelection = () => {
    setSelectedFoods([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#E8F5E9', '#F5F7FA']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          
          {/* Özet Kartları */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, remainingCalories < 0 && styles.dangerCard]}>
              <Text style={styles.summaryTitle}>Seçilen Kalori</Text>
              <Text style={styles.summaryValue}>{totalCalories} kcal</Text>
              <Text style={styles.summarySubtitle}>Kalan: {remainingCalories} kcal</Text>
            </View>
            <View style={[styles.summaryCard, remainingSugar < 0 && styles.dangerCard]}>
              <Text style={styles.summaryTitle}>Seçilen Şeker</Text>
              <Text style={styles.summaryValue}>{totalSugar.toFixed(1)} gr</Text>
              <Text style={styles.summarySubtitle}>Kalan: {remainingSugar.toFixed(1)} gr</Text>
            </View>
          </View>

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

          {/* Yiyecek Listesi */}
          <Text style={styles.sectionTitle}>Sağlıklı Yiyecekler ({filteredFoods.length})</Text>
          {filteredFoods.map(food => {
            const isSelected = selectedFoods.some(f => f.id === food.id);
            return (
              <Pressable
                key={food.id}
                style={[styles.foodCard, isSelected && styles.foodCardSelected]}
                onPress={() => toggleFood(food)}
              >
                <View style={styles.foodHeader}>
                  <View style={styles.checkbox}>
                    {isSelected && <Text style={styles.checkmark}></Text>}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.foodName}>
                       {food.name}
                    </Text>
                    <Text style={styles.foodMeta}>
                      {food.calories} kcal  {food.sugar}g şeker
                    </Text>
                    {food.advice && (
                      <Text style={styles.foodAdvice}>
                        {food.advice}
                      </Text>
                    )}
                  </View>
                </View>
              </Pressable>
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
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dangerCard: {
    backgroundColor: '#FFEBEE',
  },
  summaryTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 2,
  },
  summarySubtitle: {
    fontSize: 11,
    color: '#999',
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
});

export default SimpleDietPlanScreen;
