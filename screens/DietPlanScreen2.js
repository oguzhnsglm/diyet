import React, { useContext, useState, useMemo } from 'react';
import { SafeAreaView, ScrollView, Text, View, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DietContext } from '../context/DietContext';
import { PrimaryButton, SummaryCard } from '../components/common';
import { styles, colors } from '../styles';

const FOOD_DATABASE = [
  // Kahvaltı
  { id: 1, name: 'Tam buğday ekmeği (1 dilim)', calories: 70, sugar: 1, category: 'Kahvaltı', glycemic: 'düşük', recommended: true, advice: 'Önerilen - Düşük glisemik indeks' },
  { id: 2, name: 'Yumurta (1 adet)', calories: 78, sugar: 0.6, category: 'Kahvaltı', glycemic: 'düşük', recommended: true, advice: 'Önerilen - Protein kaynağı' },
  { id: 3, name: 'Peynir (30g)', calories: 100, sugar: 0.5, category: 'Kahvaltı', glycemic: 'düşük', recommended: true, advice: 'Önerilen - Kalsiyum açısından zengin' },
  { id: 4, name: 'Zeytin (10 adet)', calories: 50, sugar: 0, category: 'Kahvaltı', glycemic: 'düşük', recommended: true, advice: 'Önerilen - Sağlıklı yağ içerir' },
  { id: 5, name: 'Simit', calories: 290, sugar: 3, category: 'Kahvaltı', glycemic: 'yüksek', recommended: false, advice: 'Şekerli olacağı için önerilmez - Yüksek kalori' },
  { id: 6, name: 'Çikolatalı gofret', calories: 150, sugar: 12, category: 'Atıştırmalık', glycemic: 'yüksek', recommended: false, advice: 'Şekerli - Alternatif: Yoğurt veya meyve tercih edin' },
  
  // Ana Yemekler - Tavuk ve Et
  { id: 7, name: 'Izgara tavuk göğsü (150g)', calories: 165, sugar: 0, category: 'Ana Yemek', glycemic: 'düşük', recommended: true, advice: 'Önerilen - Yağsız protein kaynağı' },
  { id: 13, name: 'Izgara köfte (100g)', calories: 250, sugar: 0, category: 'Ana Yemek', glycemic: 'düşük', recommended: true, advice: 'Önerilen - Protein açısından zengin' },
  
  // Ana Yemekler - Pilavlar (Alternatifler)
  { id: 8, name: 'Basmati pilavı (tereyağlı, 1 porsiyon)', calories: 200, sugar: 0.2, category: 'Ana Yemek', glycemic: 'orta', recommended: true, advice: 'Önerilen - Tercihen tereyağlı' },
  { id: 9, name: 'Basmati pilavı (zeytinyağlı, 1 porsiyon)', calories: 190, sugar: 0.2, category: 'Ana Yemek', glycemic: 'orta', recommended: true, advice: 'Önerilen - Tercihen zeytinyağlı (Daha sağlıklı)' },
  { id: 10, name: 'Bulgur pilavı (1 porsiyon)', calories: 150, sugar: 0.3, category: 'Ana Yemek', glycemic: 'düşük', recommended: true, advice: 'Önerilen - Lif açısından zengin, düşük glisemik' },
  
  // Ana Yemekler - Sebze Yemekleri
  { id: 11, name: 'Zeytinyağlı fasulye (1 porsiyon)', calories: 180, sugar: 3, category: 'Ana Yemek', glycemic: 'düşük', recommended: true, advice: 'Önerilen - Lif ve protein içerir' },
  { id: 12, name: 'Mercimek çorbası (1 kase)', calories: 120, sugar: 2, category: 'Ana Yemek', glycemic: 'düşük', recommended: true, advice: 'Önerilen - Protein ve lif kaynağı' },
  
  // Ana Yemekler - Önerilmeyen
  { id: 14, name: 'Kızarmış patates (büyük porsiyon)', calories: 365, sugar: 0.5, category: 'Ana Yemek', glycemic: 'yüksek', recommended: false, advice: 'Şekerli olacağı için önerilmez - Alternatif: Fırında patates tercih edin' },
  { id: 15, name: 'Makarna (1 tabak)', calories: 310, sugar: 2, category: 'Ana Yemek', glycemic: 'yüksek', recommended: false, advice: 'Şekerli - Tam buğday makarna tercih edilebilir' },
  
  // Salata ve Sebzeler
  { id: 16, name: 'Mevsim salatası (zeytinyağlı)', calories: 80, sugar: 3, category: 'Salata', glycemic: 'düşük', recommended: true, advice: 'Önerilen - Her öğünde tüketin' },
  { id: 17, name: 'Çoban salatası', calories: 90, sugar: 4, category: 'Salata', glycemic: 'düşük', recommended: true, advice: 'Önerilen - Vitamin ve mineral kaynağı' },
  { id: 18, name: 'Haşlanmış brokoli (1 porsiyon)', calories: 55, sugar: 2, category: 'Sebze', glycemic: 'düşük', recommended: true, advice: 'Önerilen - Antioksidan açısından zengin' },
  { id: 19, name: 'Közlenmiş patlıcan salatası', calories: 120, sugar: 5, category: 'Salata', glycemic: 'düşük', recommended: true, advice: 'Önerilen - Lif içeriği yüksek' },
  
  // Atıştırmalıklar - Sağlıklı
  { id: 20, name: 'Badem (30g)', calories: 170, sugar: 1.2, category: 'Atıştırmalık', glycemic: 'düşük', recommended: true, advice: 'Önerilen - Sağlıklı yağ ve protein içerir' },
  { id: 21, name: 'Ceviz (30g)', calories: 195, sugar: 0.8, category: 'Atıştırmalık', glycemic: 'düşük', recommended: true, advice: 'Önerilen - Omega-3 kaynağı' },
  { id: 24, name: 'Yoğurt (yağsız, 200g)', calories: 100, sugar: 7, category: 'Atıştırmalık', glycemic: 'düşük', recommended: true, advice: 'Önerilen - Probiyotik içerir' },
  
  // Meyveler
  { id: 22, name: 'Elma (1 adet orta boy)', calories: 95, sugar: 19, category: 'Meyve', glycemic: 'düşük', recommended: true, advice: 'Önerilen - Doğal şeker, lif içerir' },
  { id: 23, name: 'Muz (1 adet)', calories: 105, sugar: 14, category: 'Meyve', glycemic: 'orta', recommended: true, advice: 'Önerilen - Potasyum kaynağı, ölçülü tüketin' },
  
  // Atıştırmalıklar - Sağlıksız (Alternatifler)
  { id: 25, name: 'Paket çikolata (50g)', calories: 260, sugar: 28, category: 'Atıştırmalık', glycemic: 'yüksek', recommended: false, advice: 'Şekerli - Alternatif: 1 tabak yoğurt veya bir avuç badem tercih edin' },
  { id: 26, name: 'Cips (büyük paket)', calories: 540, sugar: 2, category: 'Atıştırmalık', glycemic: 'yüksek', recommended: false, advice: 'Şekerli olacağı için önerilmez - Yüksek kalori ve tuz içerir' },
  
  // İçecekler
  { id: 27, name: 'Kola (330ml)', calories: 140, sugar: 39, category: 'İçecek', glycemic: 'yüksek', recommended: false, advice: 'Çok şekerli - Alternatif: Sade su veya maden suyu tercih edin' },
  { id: 28, name: 'Portakal suyu (1 bardak)', calories: 110, sugar: 21, category: 'İçecek', glycemic: 'orta', recommended: false, advice: 'Şekerli - Alternatif: Taze meyve tüketin' },
  
  // Tatlılar
  { id: 29, name: 'Sütlaç (1 porsiyon)', calories: 180, sugar: 18, category: 'Tatlı', glycemic: 'yüksek', recommended: false, advice: 'Şekerli - Haftada 1-2 kez, küçük porsiyon tüketin' },
  { id: 30, name: 'Baklava (1 dilim)', calories: 430, sugar: 35, category: 'Tatlı', glycemic: 'yüksek', recommended: false, advice: 'Çok şekerli - Özel günlere saklayın, küçük dilim tercih edin' },
];

const DietPlanScreen = ({ navigation }) => {
  const { user, addMeal } = useContext(DietContext);
  const [selectedFoods, setSelectedFoods] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Tümü');

  const categories = ['Tümü', 'Kahvaltı', 'Ana Yemek', 'Salata', 'Sebze', 'Meyve', 'Atıştırmalık', 'Tatlı'];

  const dailyCalorieTarget = user?.dailyCalorieTarget || 2000;
  const dailySugarLimit = user?.dailySugarLimitGr || 50;

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

  const savePlan = async () => {
    for (const food of selectedFoods) {
      await addMeal({
        foodName: food.name,
        calories: food.calories,
        sugarGrams: food.sugar,
        mealType: food.category,
      });
    }
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[colors.bgGradientStart, colors.bgGradientEnd]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.card, styles.glassCard]}>
            <Text style={styles.title}>🍽️ Diyet Planı Oluştur</Text>
            <Text style={styles.muted}>Boy ve kilonuza göre günlük {dailyCalorieTarget} kalori önerilir</Text>
          </View>

          <View style={styles.cardRow}>
            <SummaryCard
              title="Seçilen kalori"
              value={`${totalCalories} kcal`}
              subtitle={`Kalan: ${remainingCalories} kcal`}
              danger={remainingCalories < 0}
            />
            <SummaryCard
              title="Seçilen şeker"
              value={`${totalSugar.toFixed(1)} gr`}
              subtitle={`Kalan: ${remainingSugar.toFixed(1)} gr`}
              danger={remainingSugar < 0}
            />
          </View>

          {selectedFoods.length > 0 && (
            <View style={localStyles.selectedBox}>
              <Text style={localStyles.selectedTitle}>Seçilen Yiyecekler ({selectedFoods.length})</Text>
              {selectedFoods.map(food => (
                <Text key={food.id} style={localStyles.selectedItem}>
                  • {food.name} - {food.calories} kcal
                </Text>
              ))}
            </View>
          )}

          <Text style={styles.sectionTitle}>Kategori Seç</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {categories.map(cat => (
              <Pressable
                key={cat}
                style={[
                  localStyles.categoryChip,
                  activeCategory === cat && localStyles.categoryChipActive
                ]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[
                  localStyles.categoryText,
                  activeCategory === cat && localStyles.categoryTextActive
                ]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Yiyecek Seç</Text>
          {filteredFoods.map(food => {
            const isSelected = selectedFoods.find(f => f.id === food.id);
            return (
              <Pressable
                key={food.id}
                style={[
                  localStyles.foodItem,
                  isSelected && localStyles.foodItemSelected
                ]}
                onPress={() => toggleFood(food)}
              >
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={localStyles.foodName}>{food.name}</Text>
                    {food.recommended && (
                      <View style={localStyles.recommendedBadge}>
                        <Text style={localStyles.recommendedText}>✓</Text>
                      </View>
                    )}
                    {!food.recommended && (
                      <View style={localStyles.warningBadge}>
                        <Text style={localStyles.warningText}>⚠</Text>
                      </View>
                    )}
                  </View>
                  <Text style={localStyles.foodMeta}>
                    {food.calories} kcal • {food.sugar}g şeker • Glisemik: {food.glycemic}
                  </Text>
                  {food.advice && (
                    <Text style={food.recommended ? localStyles.foodAdvice : localStyles.foodWarning}>
                      💡 {food.advice}
                    </Text>
                  )}
                </View>
                <View style={[
                  localStyles.checkbox,
                  isSelected && localStyles.checkboxSelected
                ]}>
                  {isSelected && <Text style={localStyles.checkmark}>✓</Text>}
                </View>
              </Pressable>
            );
          })}

          {selectedFoods.length > 0 && (
            <PrimaryButton 
              label={`Planı Kaydet (${selectedFoods.length} yiyecek)`}
              onPress={savePlan}
              style={{ marginTop: 20 }}
            />
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const localStyles = StyleSheet.create({
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#fff',
  },
  foodItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  foodItemSelected: {
    borderColor: colors.primary,
    backgroundColor: '#f0f9ff',
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  foodMeta: {
    fontSize: 13,
    color: colors.textLight,
  },
  foodAdvice: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  foodWarning: {
    fontSize: 12,
    color: '#FF6B6B',
    marginTop: 4,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  foodNote: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
    fontStyle: 'italic',
  },
  recommendedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  recommendedText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  warningBadge: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  warningText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedBox: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  selectedItem: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
});

export default DietPlanScreen;
