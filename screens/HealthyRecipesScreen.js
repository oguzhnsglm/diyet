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
    name: 'Quinoa Buddha Bowl',
    category: 'Bowl Tarifleri',
    calories: 350,
    prepTime: '25 dk',
    ingredients: ['1 su bardağı quinoa', '1 avuç ıspanak', '1/2 avokado', 'Közlenmiş tatlı patates', 'Nohut (haşlanmış)', 'Tahin sosu', 'Limon suyu'],
    instructions: '1. Quinoa\'yı haşlayın ve soğumaya bırakın.\n2. Tatlı patatesi fırında közleyin.\n3. Kasede quinoa, ıspanak, avokado, patates ve nohutu yerleştirin.\n4. Tahin ve limon suyu karışımı ile servis edin.',
    nutrition: 'Protein: 15g, Karbonhidrat: 45g, Yağ: 12g',
    tags: ['Vegan', 'Glütensiz', 'Yüksek Protein'],
    gi: 48,
    carbGrams: 45,
    sugarGrams: 6,
    proteinGrams: 15,
  },
  {
    id: 2,
    name: 'Akdeniz Köfte Bowl',
    category: 'Bowl Tarifleri',
    calories: 420,
    prepTime: '30 dk',
    ingredients: ['200g dana kıyma (yağsız)', '1/2 su bardağı bulgur', 'Domates', 'Salatalık', 'Kırmızı soğan', 'Maydanoz', 'Yoğurt (yağsız)', 'Baharat: kimyon, kırmızı biber'],
    instructions: '1. Bulguru haşlayın.\n2. Kıymayı baharatlarla yoğurup köfte şeklinde pişirin.\n3. Sebzeleri doğrayın.\n4. Kasede bulgur, köfte, sebzeler ve yoğurt ile servis edin.',
    nutrition: 'Protein: 28g, Karbonhidrat: 38g, Yağ: 14g',
    tags: ['Yüksek Protein', 'Akdeniz Diyeti'],
    gi: 54,
    carbGrams: 38,
    sugarGrams: 4,
    proteinGrams: 28,
  },
  {
    id: 3,
    name: 'Yeşil Detox Bowl',
    category: 'Bowl Tarifleri',
    calories: 280,
    prepTime: '20 dk',
    ingredients: ['2 su bardağı ıspanak', '1 su bardağı brokoli', '1/2 avokado', 'Kenevir tohumu', 'Ceviz', 'Zeytinyağı', 'Limon'],
    instructions: '1. Brokoli ve ıspanağı hafifçe haşlayın.\n2. Avokadoyu dilimleyin.\n3. Kasede tüm malzemeleri yerleştirin.\n4. Zeytinyağı ve limon ile tatlandırın.',
    nutrition: 'Protein: 12g, Karbonhidrat: 22g, Yağ: 16g',
    tags: ['Vegan', 'Detox', 'Düşük Kalori'],
    gi: 35,
    carbGrams: 22,
    sugarGrams: 6,
    proteinGrams: 12,
  },
  {
    id: 4,
    name: 'Yulaf Chia Puding',
    category: 'Şekersiz Tatlı',
    calories: 200,
    prepTime: '5 dk + bekletme',
    ingredients: ['3 yemek kaşığı yulaf', '1 yemek kaşığı chia tohumu', '200ml badem sütü (şekersiz)', '1/2 muz', 'Tarçın', 'Taze meyve (üzeri için)'],
    instructions: '1. Yulaf, chia ve badem sütünü karıştırın.\n2. Buzdolabında 4 saat bekletin.\n3. Ezilmiş muz ve tarçın ekleyin.\n4. Taze meyvelerle süsleyin.',
    nutrition: 'Protein: 8g, Karbonhidrat: 28g, Yağ: 6g',
    tags: ['Şekersiz', 'Kahvaltı', 'Vegan'],
    gi: 42,
    carbGrams: 28,
    sugarGrams: 12,
    proteinGrams: 8,
  },
  {
    id: 5,
    name: 'Fındık Ezmeli Enerji Topları',
    category: 'Şekersiz Tatlı',
    calories: 120,
    prepTime: '15 dk',
    ingredients: ['1 su bardağı hurma (çekirdeksiz)', '1/2 su bardağı badem', '2 yemek kaşığı kakao (şekersiz)', '1 yemek kaşığı chia tohumu', 'Hindistan cevizi (üzeri için)'],
    instructions: '1. Tüm malzemeleri blenderda karıştırın.\n2. Top şeklinde yuvarlayın.\n3. Hindistan cevizine bulayın.\n4. Buzdolabında 1 saat bekletin.',
    nutrition: 'Protein: 4g, Karbonhidrat: 15g, Yağ: 6g (per top)',
    tags: ['Şekersiz', 'Vegan', 'Atıştırmalık'],
    gi: 49,
    carbGrams: 15,
    sugarGrams: 10,
    proteinGrams: 4,
  },
  {
    id: 6,
    name: 'Yoğurtlu Meyve Parfesi',
    category: 'Şekersiz Tatlı',
    calories: 180,
    prepTime: '10 dk',
    ingredients: ['200g yoğurt (yağsız, şekersiz)', 'Taze çilek', 'Yaban mersini', '2 yemek kaşığı yulaf', '1 yemek kaşığı bal (opsiyonel)', 'Ceviz'],
    instructions: '1. Bardakta katmanlar halinde yoğurt, meyve ve yulaf yerleştirin.\n2. Ceviz ile süsleyin.\n3. İsteğe göre bal damlatın.\n4. Hemen servis edin.',
    nutrition: 'Protein: 12g, Karbonhidrat: 24g, Yağ: 4g',
    tags: ['Şekersiz', 'Yüksek Protein', 'Kahvaltı'],
    gi: 46,
    carbGrams: 24,
    sugarGrams: 14,
    proteinGrams: 12,
  },
  {
    id: 7,
    name: 'Kinoa Falafel Bowl',
    category: 'Bowl Tarifleri',
    calories: 380,
    prepTime: '35 dk',
    ingredients: ['1 su bardağı kinoa', '200g nohut (haşlanmış)', 'Maydanoz', 'Soğan', 'Sarımsak', 'Baharat: kimyon, kişniş', 'Yeşil salata', 'Tahin sosu'],
    instructions: '1. Kinoayı haşlayın.\n2. Nohut ve baharatları blenderda karıştırıp falafel yapın.\n3. Falafelleri fırında pişirin.\n4. Kasede kinoa, salata ve falafel ile servis edin.',
    nutrition: 'Protein: 18g, Karbonhidrat: 52g, Yağ: 10g',
    tags: ['Vegan', 'Yüksek Lif', 'Glütensiz'],
    gi: 52,
    carbGrams: 52,
    sugarGrams: 7,
    proteinGrams: 18,
  },
  {
    id: 8,
    name: 'Avokado Çikolata Mousse',
    category: 'Şekersiz Tatlı',
    calories: 160,
    prepTime: '10 dk',
    ingredients: ['1 adet olgun avokado', '2 yemek kaşığı kakao (şekersiz)', '3 yemek kaşığı badem sütü', '1 yemek kaşığı ahududu ekşi meyvesi', 'Vanilya özü', 'Taze meyve'],
    instructions: '1. Avokado, kakao, badem sütü ve vanilya blenderda karıştırın.\n2. Pürüzsüz kıvam alana kadar çırpın.\n3. Kaselere paylaştırın.\n4. Taze meyve ile süsleyip servis edin.',
    nutrition: 'Protein: 3g, Karbonhidrat: 12g, Yağ: 12g',
    tags: ['Şekersiz', 'Vegan', 'Çikolatalı'],
    gi: 40,
    carbGrams: 12,
    sugarGrams: 8,
    proteinGrams: 3,
  },
];

const QUICK_CATEGORY = 'recipes';

const HealthyRecipesScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [expandedRecipe, setExpandedRecipe] = useState(null);
  const [glycemicExpanded, setGlycemicExpanded] = useState({});
  const [quickRecipes, setQuickRecipes] = useState([]);

  const categories = ['Tümü', 'Bowl Tarifleri', 'Şekersiz Tatlı'];

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
              <Text style={styles.headerTitle}>🥗 Sağlıklı Tarifler</Text>
              <Text style={styles.headerSubtitle}>Düşük kalorili ve şekersiz lezzetler</Text>
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
