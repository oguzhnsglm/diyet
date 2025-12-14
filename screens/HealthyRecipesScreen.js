import React, { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { addQuickAction, getQuickActions } from '../logic/quickActions';
import GlycemicInfoBadge from '../components/GlycemicInfoBadge';
import MealRiskEstimator from '../components/MealRiskEstimator';
import SmartMealWarnings from '../components/SmartMealWarnings';

const RECIPES = [
  {
    id: 1,
    name: 'Baharatlı Izgara Tavuk Salatası',
    category: 'Ana Yemek',
    calories: 320,
    prepTime: '25 dk',
    ingredients: ['150g tavuk göğsü (derisi alınmış)', '2 su bardağı karışık yeşillik', '1/2 salatalık', 'Cherry domates', 'Az tuz (1/4 çay kaşığı)', 'Limon suyu', 'Zeytinyağı (1 yemek kaşığı)', 'Sumak, kekik'],
    instructions: '1. Tavuğu baharatlar ve az tuzla marine edin.\n2. Izgara tavada pişirin.\n3. Yeşillikleri, salatalık ve domatesi doğrayın.\n4. Zeytinyağı ve limon ile servis edin.',
    nutrition: 'Protein: 32g, Karbonhidrat: 12g, Yağ: 8g, Sodyum: 180mg',
    tags: ['Düşük Tuz', 'Yüksek Protein', 'Diyabet Dostu'],
    gi: 15,
    carbGrams: 12,
    sugarGrams: 4,
    proteinGrams: 32,
  },
  {
    id: 2,
    name: 'Fırında Somon ve Sebze',
    category: 'Ana Yemek',
    calories: 380,
    prepTime: '30 dk',
    ingredients: ['150g somon fileto', '1 adet kabak', '1 adet patlıcan', 'Brokoli', 'Sarımsak (1 diş)', 'Taze kekik', 'Az tuz (1/4 çay kaşığı)', 'Zeytinyağı (1 çay kaşığı)'],
    instructions: '1. Sebzeleri küp şeklinde doğrayın.\n2. Tüm malzemeleri fırın kağıdına yerleştirin.\n3. 180°C fırında 25 dakika pişirin.\n4. Taze kekikle servis edin.',
    nutrition: 'Protein: 28g, Karbonhidrat: 18g, Yağ: 14g, Sodyum: 150mg',
    tags: ['Omega-3', 'Düşük Tuz', 'Kalp Dostu'],
    gi: 20,
    carbGrams: 18,
    sugarGrams: 6,
    proteinGrams: 28,
  },
  {
    id: 3,
    name: 'Mercimek Köftesi (Az Tuzlu)',
    category: 'Vegan Ana Yemek',
    calories: 280,
    prepTime: '40 dk',
    ingredients: ['1 su bardağı kırmızı mercimek', '1/2 su bardağı ince bulgur', 'Maydanoz', 'Yeşil soğan', 'Az tuz (1/4 çay kaşığı)', 'Kimyon', 'Pul biber', 'Limon'],
    instructions: '1. Mercimeği haşlayın ve ezin.\n2. Bulgur ile karıştırıp dinlendirin.\n3. Az tuz ve baharatlarla yoğurun.\n4. Köfte şeklinde yuvarlayıp limonla servis edin.',
    nutrition: 'Protein: 14g, Karbonhidrat: 42g, Yağ: 2g, Sodyum: 120mg',
    tags: ['Vegan', 'Düşük Tuz', 'Yüksek Lif'],
    gi: 35,
    carbGrams: 42,
    sugarGrams: 3,
    proteinGrams: 14,
  },
  {
    id: 4,
    name: 'Şekersiz Yulaf Pankek',
    category: 'Kahvaltı',
    calories: 220,
    prepTime: '15 dk',
    ingredients: ['1/2 su bardağı yulaf', '1 adet yumurta', '100ml süt (yağsız)', '1 adet muz (ezik)', 'Tarçın', 'Vanilya (şekersiz)', 'Taze meyve (üzeri için)'],
    instructions: '1. Tüm malzemeleri blenderda karıştırın.\n2. Yapışmaz tavada pişirin.\n3. Taze meyvelerle süsleyin.\n4. Bal yerine muz doğal tatlandırıcı olarak kullanıldı.',
    nutrition: 'Protein: 10g, Karbonhidrat: 32g, Yağ: 5g, Şeker: 8g (doğal)',
    tags: ['Şekersiz', 'Kahvaltı', 'Tam Tahıl'],
    gi: 42,
    carbGrams: 32,
    sugarGrams: 8,
    proteinGrams: 10,
  },
  {
    id: 5,
    name: 'Badem Sütlü Chia Puding',
    category: 'Tatlı/Atıştırmalık',
    calories: 180,
    prepTime: '5 dk + bekletme',
    ingredients: ['2 yemek kaşığı chia tohumu', '200ml badem sütü (şekersiz)', 'Tarçın', 'Vanilya (şekersiz)', 'Taze çilek', 'Ceviz (3-4 adet)'],
    instructions: '1. Chia ve badem sütünü karıştırın.\n2. Tarçın ve vanilya ekleyin.\n3. Buzdolabında 4 saat bekletin.\n4. Çilek ve cevizle süsleyin.',
    nutrition: 'Protein: 6g, Karbonhidrat: 18g, Yağ: 8g, Şeker: 2g',
    tags: ['Şekersiz', 'Vegan', 'Omega-3'],
    gi: 30,
    carbGrams: 18,
    sugarGrams: 2,
    proteinGrams: 6,
  },
  {
    id: 6,
    name: 'Sebzeli Omlet (Az Tuzlu)',
    category: 'Kahvaltı',
    calories: 200,
    prepTime: '15 dk',
    ingredients: ['2 adet yumurta', 'Domates', 'Mantar', 'Yeşil biber', 'Maydanoz', 'Az tuz (1/4 çay kaşığı)', 'Karabiber'],
    instructions: '1. Sebzeleri ince doğrayın.\n2. Yumurtaları çırpın, az tuz ekleyin.\n3. Sebzeleri hafif soteleyin.\n4. Yumurtaları ekleyip omlet yapın.',
    nutrition: 'Protein: 14g, Karbonhidrat: 8g, Yağ: 12g, Sodyum: 200mg',
    tags: ['Düşük Tuz', 'Yüksek Protein', 'Kahvaltı'],
    gi: 0,
    carbGrams: 8,
    sugarGrams: 3,
    proteinGrams: 14,
  },
  {
    id: 7,
    name: 'Izgara Köfte (Az Yağlı)',
    category: 'Ana Yemek',
    calories: 290,
    prepTime: '25 dk',
    ingredients: ['200g dana kıyma (%90 yağsız)', 'Soğan', 'Maydanoz', 'Az tuz (1/4 çay kaşığı)', 'Kimyon', 'Karabiber', 'Yanında: Izgara sebze'],
    instructions: '1. Kıymayı ince doğranmış soğan ve baharatlarla yoğurun.\n2. Az tuz ekleyin.\n3. Köfte şeklinde yuvarlayıp ızgarada pişirin.\n4. Izgara sebzelerle servis edin.',
    nutrition: 'Protein: 26g, Karbonhidrat: 8g, Yağ: 10g, Sodyum: 180mg',
    tags: ['Düşük Tuz', 'Yüksek Protein', 'Izgara'],
    gi: 0,
    carbGrams: 8,
    sugarGrams: 2,
    proteinGrams: 26,
  },
  {
    id: 8,
    name: 'Çikolatasız Kakao Topları',
    category: 'Tatlı/Atıştırmalık',
    calories: 90,
    prepTime: '15 dk',
    ingredients: ['1 su bardağı hurma (çekirdeksiz)', '3 yemek kaşığı kakao tozu (şekersiz)', 'Badem', 'Hindistan cevizi rendesi'],
    instructions: '1. Hurma ve bademi blenderda çekin.\n2. Kakao ekleyip karıştırın.\n3. Top şeklinde yuvarlayın.\n4. Hindistan cevizine bulayın.',
    nutrition: 'Protein: 2g, Karbonhidrat: 14g, Yağ: 3g, Şeker: 10g (doğal)',
    tags: ['Şekersiz', 'Vegan', 'Atıştırmalık'],
    gi: 42,
    carbGrams: 14,
    sugarGrams: 10,
    proteinGrams: 2,
  },
  {
    id: 9,
    name: 'Sebze Çorbası (Tuzsuz)',
    category: 'Çorba',
    calories: 120,
    prepTime: '30 dk',
    ingredients: ['Brokoli', 'Havuç', 'Kabak', 'Kereviz', 'Soğan (1 adet)', 'Sarımsak (1 diş)', 'Taze kekik', 'Limon suyu'],
    instructions: '1. Sebzeleri doğrayın.\n2. Az suda haşlayın.\n3. Blenderdan geçirin.\n4. Limon ve taze kekikle tatlandırın.',
    nutrition: 'Protein: 4g, Karbonhidrat: 20g, Yağ: 1g, Sodyum: 60mg',
    tags: ['Tuzsuz', 'Vegan', 'Düşük Kalori'],
    gi: 15,
    carbGrams: 20,
    sugarGrams: 8,
    proteinGrams: 4,
  },
  {
    id: 10,
    name: 'Yoğurtlu Enginar',
    category: 'Meze/Yan Yemek',
    calories: 150,
    prepTime: '20 dk',
    ingredients: ['4 adet enginar (hazır veya taze)', '200g yoğurt (yağsız)', 'Dereotu', 'Sarımsak (1 diş)', 'Az tuz (1/4 çay kaşığı)', 'Limon suyu'],
    instructions: '1. Enginarları haşlayın.\n2. Yoğurt, sarımsak ve dereotunu karıştırın.\n3. Az tuz ve limon ekleyin.\n4. Enginarları yoğurtla servis edin.',
    nutrition: 'Protein: 8g, Karbonhidrat: 16g, Yağ: 2g, Sodyum: 140mg',
    tags: ['Düşük Tuz', 'Probiyotik', 'Düşük Kalori'],
    gi: 15,
    carbGrams: 16,
    sugarGrams: 4,
    proteinGrams: 8,
  },
];

const QUICK_CATEGORY = 'recipes';

const HealthyRecipesScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [expandedRecipe, setExpandedRecipe] = useState(null);
  const [glycemicExpanded, setGlycemicExpanded] = useState({});
  const [quickRecipes, setQuickRecipes] = useState([]);

  const categories = ['Tümü', 'Ana Yemek', 'Kahvaltı', 'Tatlı/Atıştırmalık', 'Çorba', 'Meze/Yan Yemek', 'Vegan Ana Yemek'];

  const filteredRecipes = selectedCategory === 'Tümü' 
    ? RECIPES 
    : RECIPES.filter(r => r.category === selectedCategory);

  useEffect(() => {
    const loadQuick = async () => {
      const stored = await getQuickActions(QUICK_CATEGORY);
      setQuickRecipes(stored);
    };
    loadQuick();
  }, []);

  const handleSaveFavorite = async (recipe) => {
    const payload = {
      id: recipe.id,
      name: recipe.name,
      category: recipe.category,
      calories: recipe.calories,
      prepTime: recipe.prepTime,
    };
    const updated = await addQuickAction(QUICK_CATEGORY, payload);
    setQuickRecipes(updated);
  };

  const handleQuickSelect = (recipe) => {
    if (recipe.category !== selectedCategory && recipe.category !== 'Tümü') {
      setSelectedCategory(recipe.category);
    }
    setExpandedRecipe(recipe.id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FFF3E0', '#F5F7FA']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          
          <View style={styles.headerRow}>
            <Pressable
              style={styles.backButton}
              onPress={() => {
                if (navigation && navigation.canGoBack()) {
                  navigation.goBack();
                }
              }}
            >
              <Text style={styles.backIcon}>‹</Text>
            </Pressable>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>🥗 Diyabet Dostu Tarifler</Text>
              <Text style={styles.headerSubtitle}>Az tuzlu, şekersiz ve sağlıklı lezzetler</Text>
            </View>
          </View>

          {quickRecipes.length > 0 && (
            <View style={styles.quickSection}>
              <Text style={styles.quickTitle}>Sık yaptıkların</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                {quickRecipes.map((recipe) => (
                  <Pressable
                    key={recipe.id}
                    style={styles.quickCard}
                    onPress={() => handleQuickSelect(recipe)}
                  >
                    <Text style={styles.quickCardTitle}>{recipe.name}</Text>
                    <Text style={styles.quickCardMeta}>{recipe.calories} kcal • {recipe.prepTime}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Kategori Seçimi */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map(cat => (
              <Pressable
                key={cat}
                style={[styles.categoryButton, selectedCategory === cat && styles.categoryButtonActive]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[styles.categoryText, selectedCategory === cat && styles.categoryTextActive]}>
                  {cat}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Tarifler */}
          <Text style={styles.sectionTitle}>{filteredRecipes.length} Tarif</Text>
          {filteredRecipes.map(recipe => {
            const isGlycemicExpanded = glycemicExpanded[recipe.id];
            return (
              <View key={recipe.id} style={styles.recipeCard}>
              <Pressable onPress={() => setExpandedRecipe(expandedRecipe === recipe.id ? null : recipe.id)}>
                <View style={styles.recipeHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recipeName}>{recipe.name}</Text>
                    <Text style={styles.recipeCategory}>{recipe.category}</Text>
                  </View>
                  <View style={styles.recipeStats}>
                    <Text style={styles.recipeCalories}>{recipe.calories} kcal</Text>
                    <Text style={styles.recipeTime}>⏱️ {recipe.prepTime}</Text>
                  </View>
                </View>

                <Pressable style={styles.favoriteButton} onPress={() => handleSaveFavorite(recipe)}>
                  <Text style={styles.favoriteButtonText}>+ Sık Kullan</Text>
                </Pressable>

                <View style={styles.tagsContainer}>
                  {recipe.tags.map((tag, idx) => (
                    <View key={idx} style={styles.tag}>
                      <Text style={styles.tagText}>{tag}</Text>
                    </View>
                  ))}
                </View>

                {expandedRecipe === recipe.id && (
                  <View style={styles.recipeDetails}>
                    <Text style={styles.detailsTitle}>Malzemeler:</Text>
                    {recipe.ingredients.map((ing, idx) => (
                      <Text key={idx} style={styles.ingredientItem}>• {ing}</Text>
                    ))}

                    <Text style={styles.detailsTitle}>Yapılışı:</Text>
                    <Text style={styles.instructions}>{recipe.instructions}</Text>

                    <Text style={styles.detailsTitle}>Besin Değerleri:</Text>
                    <Text style={styles.nutrition}>{recipe.nutrition}</Text>

                    {typeof recipe.gi === 'number' && (
                      <View style={styles.metabolicStack}>
                        {!isGlycemicExpanded ? (
                          <Pressable
                            style={styles.detailToggle}
                            onPress={() =>
                              setGlycemicExpanded(prev => ({ ...prev, [recipe.id]: true }))
                            }
                          >
                            <Text style={styles.detailToggleText}>Glisemik rehberi aç</Text>
                          </Pressable>
                        ) : (
                          <>
                            <GlycemicInfoBadge gi={recipe.gi} carbGrams={recipe.carbGrams} />
                            <MealRiskEstimator
                              gi={recipe.gi}
                              carbGrams={recipe.carbGrams}
                              proteinGrams={recipe.proteinGrams || 0}
                            />
                            <SmartMealWarnings
                              gi={recipe.gi}
                              carbGrams={recipe.carbGrams}
                              sugarGrams={recipe.sugarGrams || 0}
                              protein={recipe.proteinGrams || 0}
                            />
                            <Pressable
                              style={[styles.detailToggle, styles.detailToggleActive]}
                              onPress={() =>
                                setGlycemicExpanded(prev => ({ ...prev, [recipe.id]: false }))
                              }
                            >
                              <Text style={styles.detailToggleText}>Gizle</Text>
                            </Pressable>
                          </>
                        )}
                      </View>
                    )}
                  </View>
                )}

                <Text style={styles.expandButton}>
                  {expandedRecipe === recipe.id ? '▲ Daralt' : '▼ Tarifi Gör'}
                </Text>
              </Pressable>
              </View>
          );
          })}

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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  backIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
  },
  header: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  quickSection: {
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8D4A0B',
  },
  quickCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    width: 200,
  },
  quickCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8D4A0B',
  },
  quickCardMeta: {
    fontSize: 12,
    color: '#a15c20',
    marginTop: 4,
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
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: 'white',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 12,
  },
  recipeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  recipeCategory: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
  },
  recipeStats: {
    alignItems: 'flex-end',
  },
  favoriteButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF3E0',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },
  favoriteButtonText: {
    fontSize: 12,
    color: '#F57C00',
    fontWeight: '600',
  },
  recipeCalories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  recipeTime: {
    fontSize: 12,
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 12,
  },
  tag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '500',
  },
  recipeDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginTop: 12,
    marginBottom: 6,
  },
  ingredientItem: {
    fontSize: 13,
    color: '#555',
    marginBottom: 4,
    lineHeight: 20,
  },
  instructions: {
    fontSize: 13,
    color: '#555',
    lineHeight: 22,
  },
  nutrition: {
    fontSize: 13,
    color: '#666',
    fontStyle: 'italic',
  },
  metabolicStack: {
    marginTop: 12,
    gap: 6,
  },
  detailToggle: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#ffe4c7',
    alignSelf: 'flex-start',
    backgroundColor: '#fff7ed',
  },
  detailToggleActive: {
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
  },
  detailToggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#c2410c',
  },
  expandButton: {
    fontSize: 13,
    color: '#FF9800',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default HealthyRecipesScreen;
