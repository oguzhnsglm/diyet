import React, { useState } from 'react';
import { SafeAreaView, ScrollView, Text, View, Pressable, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavBar from '../components/BottomNavBar';

const INGREDIENTS = [
  // Protein
  { id: 1, name: 'Tavuk göğsü', category: 'Protein' },
  { id: 2, name: 'Yumurta', category: 'Protein' },
  { id: 3, name: 'Nohut', category: 'Protein' },
  { id: 4, name: 'Mercimek', category: 'Protein' },
  { id: 5, name: 'Ton balığı', category: 'Protein' },
  
  // Karbonhidrat
  { id: 6, name: 'Quinoa', category: 'Karbonhidrat' },
  { id: 7, name: 'Bulgur', category: 'Karbonhidrat' },
  { id: 8, name: 'Basmati pirinç', category: 'Karbonhidrat' },
  { id: 9, name: 'Yulaf', category: 'Karbonhidrat' },
  { id: 10, name: 'Tatlı patates', category: 'Karbonhidrat' },
  
  // Sebze
  { id: 11, name: 'Brokoli', category: 'Sebze' },
  { id: 12, name: 'Ispanak', category: 'Sebze' },
  { id: 13, name: 'Havuç', category: 'Sebze' },
  { id: 14, name: 'Domates', category: 'Sebze' },
  { id: 15, name: 'Salatalık', category: 'Sebze' },
  { id: 16, name: 'Patlıcan', category: 'Sebze' },
  
  // Sağlıklı Yağlar
  { id: 17, name: 'Avokado', category: 'Sağlıklı Yağ' },
  { id: 18, name: 'Zeytinyağı', category: 'Sağlıklı Yağ' },
  { id: 19, name: 'Badem', category: 'Sağlıklı Yağ' },
  { id: 20, name: 'Ceviz', category: 'Sağlıklı Yağ' },
  
  // Süt Ürünleri
  { id: 21, name: 'Yoğurt (yağsız)', category: 'Süt Ürünü' },
  { id: 22, name: 'Lor peyniri', category: 'Süt Ürünü' },
  
  // Meyve
  { id: 23, name: 'Muz', category: 'Meyve' },
  { id: 24, name: 'Elma', category: 'Meyve' },
  { id: 25, name: 'Çilek', category: 'Meyve' },
];

const RECIPE_SUGGESTIONS = [
  {
    ingredients: ['Tavuk göğsü', 'Quinoa', 'Brokoli', 'Havuç'],
    recipe: {
      name: 'Tavuklu Quinoa Bowl',
      description: 'Izgara tavuk, quinoa ve buharda pişmiş sebzelerle protein dolu bir öğün',
      instructions: '1. Quinoayı haşlayın\n2. Tavuğu ızgarada pişirin\n3. Sebzeleri buharda pişirin\n4. Kasede birleştirin',
      calories: 380,
    },
  },
  {
    ingredients: ['Yumurta', 'Ispanak', 'Domates', 'Yoğurt (yağsız)'],
    recipe: {
      name: 'Ispanaklı Omlet ve Yoğurt',
      description: 'Protein açısından zengin, düşük kalorili bir kahvaltı',
      instructions: '1. Ispanağı soteleyin\n2. Yumurtayı çırpıp ıspanakla karıştırın\n3. Domates dilimleyin\n4. Yoğurt ile servis edin',
      calories: 280,
    },
  },
  {
    ingredients: ['Nohut', 'Bulgur', 'Domates', 'Salatalık', 'Zeytinyağı'],
    recipe: {
      name: 'Nohutlu Bulgur Salatası',
      description: 'Vegan, lif açısından zengin ve doyurucu bir salata',
      instructions: '1. Bulguru haşlayın\n2. Nohutu ekleyin\n3. Sebzeleri doğrayın\n4. Zeytinyağı ve limon ile karıştırın',
      calories: 320,
    },
  },
  {
    ingredients: ['Ton balığı', 'Yulaf', 'Yumurta', 'Havuç'],
    recipe: {
      name: 'Ton Balıklı Yulaflı Köfte',
      description: 'Yüksek protein, sağlıklı omega-3 içeren bir öğün',
      instructions: '1. Ton balığı, yulaf, yumurta karıştırın\n2. Köfte şeklinde yoğurun\n3. Fırında pişirin\n4. Havuç salatası ile servis edin',
      calories: 340,
    },
  },
  {
    ingredients: ['Avokado', 'Yumurta', 'Domates', 'Ispanak'],
    recipe: {
      name: 'Avokado Toast Bowl',
      description: 'Sağlıklı yağlar ve proteinle dolu kahvaltı alternatifi',
      instructions: '1. Avokadoyu ezin\n2. Yumurtayı haşlayın\n3. Ispanak ve domates ekleyin\n4. Birlikte servis edin',
      calories: 310,
    },
  },
  {
    ingredients: ['Tatlı patates', 'Nohut', 'Ispanak', 'Badem'],
    recipe: {
      name: 'Fırın Tatlı Patates ve Nohut',
      description: 'Vegan, antioksidan yüklü ve lezzetli bir öğün',
      instructions: '1. Tatlı patatesi küp şeklinde kesin\n2. Nohut ile fırında közleyin\n3. Ispanağı soteleyin\n4. Üzerine badem serpin',
      calories: 360,
    },
  },
  {
    ingredients: ['Yoğurt (yağsız)', 'Yulaf', 'Muz', 'Ceviz'],
    recipe: {
      name: 'Overnight Oats',
      description: 'Hazırlaması kolay, besleyici kahvaltı',
      instructions: '1. Yulaf ve yoğurdu karıştırın\n2. Gece buzdolabında bekletin\n3. Muz dilimleyin\n4. Ceviz ile servis edin',
      calories: 290,
    },
  },
  {
    ingredients: ['Mercimek', 'Bulgur', 'Havuç', 'Domates'],
    recipe: {
      name: 'Mercimek Köftesi',
      description: 'Vegan, protein ve lif açısından zengin geleneksel lezzet',
      instructions: '1. Mercimek ve bulguru haşlayın\n2. Sebzeleri rendeleyip ekleyin\n3. Yoğurup köfte şeklinde verin\n4. Salata ile servis edin',
      calories: 300,
    },
  },
];

const IngredientSearchScreen = () => {
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tümü');
  const [suggestedRecipe, setSuggestedRecipe] = useState(null);

  const categories = ['Tümü', 'Protein', 'Karbonhidrat', 'Sebze', 'Sağlıklı Yağ', 'Süt Ürünü', 'Meyve'];

  const filteredIngredients = selectedCategory === 'Tümü'
    ? INGREDIENTS
    : INGREDIENTS.filter(ing => ing.category === selectedCategory);

  const toggleIngredient = (ingredient) => {
    if (selectedIngredients.find(i => i.id === ingredient.id)) {
      setSelectedIngredients(selectedIngredients.filter(i => i.id !== ingredient.id));
    } else {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
    setSuggestedRecipe(null);
  };

  const findRecipe = () => {
    if (selectedIngredients.length < 2) {
      Alert.alert('Uyarı', 'En az 2 malzeme seçin');
      return;
    }

    const selectedNames = selectedIngredients.map(i => i.name);
    
    // En çok eşleşen tarifi bul
    let bestMatch = null;
    let maxMatches = 0;

    RECIPE_SUGGESTIONS.forEach(suggestion => {
      const matches = suggestion.ingredients.filter(ing => 
        selectedNames.includes(ing)
      ).length;

      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = suggestion;
      }
    });

    if (bestMatch) {
      setSuggestedRecipe(bestMatch.recipe);
    } else {
      // Genel bir öneri
      setSuggestedRecipe({
        name: 'Karışık Sağlıklı Bowl',
        description: `Seçtiğiniz ${selectedIngredients.length} malzemeyle harika bir öğün hazırlayabilirsiniz!`,
        instructions: `1. ${selectedNames.slice(0, 2).join(' ve ')} hazırlayın\n2. ${selectedNames.slice(2).join(', ')} ekleyin\n3. Zeytinyağı ve baharat ile tatlandırın\n4. Keyifle tüketin!`,
        calories: 300,
      });
    }
  };

  const clearAll = () => {
    setSelectedIngredients([]);
    setSuggestedRecipe(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#E3F2FD', '#F5F7FA']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          
          <View style={styles.header}>
            <Text style={styles.headerTitle}>🔍 Malzemeden Tarif Bul</Text>
            <Text style={styles.headerSubtitle}>Elindeki malzemelerle ne yapabilirsin?</Text>
          </View>

          {/* Seçilen Malzemeler */}
          {selectedIngredients.length > 0 && (
            <View style={styles.selectedBox}>
              <View style={styles.selectedHeader}>
                <Text style={styles.selectedTitle}>
                  Seçilen Malzemeler ({selectedIngredients.length})
                </Text>
                <Pressable onPress={clearAll}>
                  <Text style={styles.clearButton}>Temizle</Text>
                </Pressable>
              </View>
              <View style={styles.selectedItems}>
                {selectedIngredients.map(ing => (
                  <View key={ing.id} style={styles.selectedChip}>
                    <Text style={styles.selectedChipText}>{ing.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Kategori Seçimi */}
          <Text style={styles.sectionTitle}>Malzeme Kategorileri</Text>
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

          {/* Malzeme Listesi */}
          <Text style={styles.sectionTitle}>Malzemeler</Text>
          <View style={styles.ingredientsGrid}>
            {filteredIngredients.map(ing => {
              const isSelected = selectedIngredients.some(i => i.id === ing.id);
              return (
                <Pressable
                  key={ing.id}
                  style={[styles.ingredientCard, isSelected && styles.ingredientCardSelected]}
                  onPress={() => toggleIngredient(ing)}
                >
                  <Text style={[styles.ingredientName, isSelected && styles.ingredientNameSelected]}>
                    {isSelected ? '✓ ' : ''}{ing.name}
                  </Text>
                  <Text style={styles.ingredientCategory}>{ing.category}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Tarif Bul Butonu */}
          <Pressable
            style={[styles.findButton, selectedIngredients.length < 2 && styles.findButtonDisabled]}
            onPress={findRecipe}
            disabled={selectedIngredients.length < 2}
          >
            <Text style={styles.findButtonText}>
              Tarif Öner ({selectedIngredients.length} malzeme)
            </Text>
          </Pressable>

          {/* Önerilen Tarif */}
          {suggestedRecipe && (
            <View style={styles.recipeCard}>
              <Text style={styles.recipeTitle}>🎉 Önerilen Tarif</Text>
              <Text style={styles.recipeName}>{suggestedRecipe.name}</Text>
              <Text style={styles.recipeDescription}>{suggestedRecipe.description}</Text>
              
              <View style={styles.recipeCalories}>
                <Text style={styles.recipeCaloriesText}>
                  📊 {suggestedRecipe.calories} kalori
                </Text>
              </View>

              <Text style={styles.recipeInstructionsTitle}>Yapılışı:</Text>
              <Text style={styles.recipeInstructions}>{suggestedRecipe.instructions}</Text>
            </View>
          )}

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
  header: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
  },
  selectedBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  selectedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
  },
  clearButton: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '500',
  },
  selectedItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedChip: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  selectedChipText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
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
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: 'white',
  },
  ingredientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  ingredientCard: {
    backgroundColor: 'white',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    minWidth: '30%',
  },
  ingredientCardSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  ingredientName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  ingredientNameSelected: {
    color: '#2196F3',
  },
  ingredientCategory: {
    fontSize: 11,
    color: '#999',
  },
  findButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  findButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  findButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recipeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
    marginBottom: 8,
  },
  recipeName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  recipeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  recipeCalories: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  recipeCaloriesText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '600',
  },
  recipeInstructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  recipeInstructions: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
});

function IngredientSearchScreenWithNav(props) {
  return (
    <>
      <IngredientSearchScreen {...props} />
      <BottomNavBar activeKey="HealthyRecipes" />
    </>
  );
}

export default IngredientSearchScreenWithNav;
