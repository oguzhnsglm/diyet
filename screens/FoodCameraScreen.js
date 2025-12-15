import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { addMealRecord, predictBloodSugarAfterMeal, getSimilarMealsFromHistory } from '../logic/digitalTwin';
import BottomNavBar from '../components/BottomNavBar';

const FoodCameraScreen = ({ navigation }) => {
  const [photoUri, setPhotoUri] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [currentGlucose, setCurrentGlucose] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [foodHistory, setFoodHistory] = useState([]);

  // Kamera ile fotoğraf çek
  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Kamera kullanmak için izin vermeniz gerekiyor.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      analyzeFood(result.assets[0].uri);
    }
  };

  // Galeriden seç
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Galeri erişimi için izin vermeniz gerekiyor.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
      analyzeFood(result.assets[0].uri);
    }
  };

  // Yemek analizini simüle et (gerçek AI için API entegrasyonu gerekir)
  const analyzeFood = async (uri) => {
    setAnalyzing(true);
    setAnalysisResult(null);

    // Simülasyon: 2 saniye bekle
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock AI analizi
    const mockFoods = [
      { name: 'Pilav', carbs: 45, calories: 200, portion: '1 porsiyon (150g)', score: 7 },
      { name: 'Tavuk Izgara', carbs: 5, calories: 180, portion: '1 parça (120g)', score: 3 },
      { name: 'Salata', carbs: 8, calories: 50, portion: '1 kase', score: 2 },
      { name: 'Makarna', carbs: 55, calories: 250, portion: '1 porsiyon (200g)', score: 8 },
      { name: 'Köfte', carbs: 12, calories: 220, portion: '2 adet', score: 5 },
      { name: 'Ekmek', carbs: 30, calories: 150, portion: '2 dilim', score: 6 },
    ];

    const randomFood = mockFoods[Math.floor(Math.random() * mockFoods.length)];
    const totalCarbs = Math.round(randomFood.carbs + Math.random() * 20 - 10);
    const totalCalories = Math.round(randomFood.calories + Math.random() * 50 - 25);

    setAnalysisResult({
      detectedFoods: [randomFood.name, mockFoods[Math.floor(Math.random() * mockFoods.length)].name],
      totalCarbs,
      totalCalories,
      glucoseImpactScore: randomFood.score,
      portion: randomFood.portion,
      advice: getAdviceForScore(randomFood.score),
    });

    setAnalyzing(false);
  };

  const getAdviceForScore = (score) => {
    if (score >= 8) return '⚠️ Yüksek etkili! Porsiyon kontrolü önemli, sonrasında hafif aktivite düşün.';
    if (score >= 6) return '⚡ Orta-yüksek etki. Bu yemekten sonra 2 saat içinde ölçüm yapmayı unutma.';
    if (score >= 4) return '✅ Orta etki. Dengeli bir seçim, şeker yavaş yükselir.';
    return '🌟 Düşük etki! Bu yemek kan şekerine çok az etki eder, güvenle yiyebilirsin.';
  };

  // Tahmin hesapla
  const calculatePrediction = async () => {
    if (!currentGlucose || !analysisResult) {
      Alert.alert('Eksik Bilgi', 'Lütfen şu anki kan şekerinizi girin.');
      return;
    }

    const glucose = parseFloat(currentGlucose);
    if (isNaN(glucose) || glucose < 40 || glucose > 600) {
      Alert.alert('Geçersiz Değer', 'Lütfen geçerli bir kan şekeri değeri girin (40-600 mg/dL).');
      return;
    }

    const prediction = await predictBloodSugarAfterMeal(analysisResult.totalCarbs, glucose);

    Alert.alert(
      '🔮 Kişisel Tahmin',
      `Şu anki: ${glucose} mg/dL\n2 saat sonra (tahmini): ${prediction.prediction} mg/dL\n\nGüven: ${prediction.confidence}\n\n${prediction.advice}`,
      [{ text: 'Tamam', style: 'default' }]
    );
  };

  // Yemeği kaydet
  const saveMeal = async () => {
    if (!analysisResult) {
      Alert.alert('Hata', 'Önce bir yemek analiz edin.');
      return;
    }

    await addMealRecord({
      timestamp: Date.now(),
      foodName: analysisResult.detectedFoods.join(', '),
      carbs: analysisResult.totalCarbs,
      calories: analysisResult.totalCalories,
      portion: analysisResult.portion,
      photoUri: photoUri,
      glucoseImpactScore: analysisResult.glucoseImpactScore,
    });

    Alert.alert('✅ Kaydedildi', 'Yemek dijital ikizine eklendi. 2 saat sonra kan şekeri ölçümü yapmayı unutma!');
    setPhotoUri(null);
    setAnalysisResult(null);
    setCurrentGlucose('');
  };

  // Yemek geçmişini göster
  const showFoodHistory = async () => {
    if (!analysisResult) return;
    
    const history = await getSimilarMealsFromHistory(analysisResult.detectedFoods[0]);
    setFoodHistory(history);
    setShowHistory(true);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LinearGradient colors={['#ec4899', '#f472b6', '#fda4af']} style={styles.header}>
        <Text style={styles.headerTitle}>📸 Akıllı Yemek Analizi</Text>
        <Text style={styles.headerSubtitle}>Fotoğraf çek, glikoz etkisini öğren</Text>
      </LinearGradient>

      {!photoUri ? (
        <View style={styles.cameraSection}>
          <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
            <Text style={styles.cameraIcon}>📷</Text>
            <Text style={styles.cameraButtonText}>Fotoğraf Çek</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.galleryButton} onPress={pickImage}>
            <Text style={styles.galleryIcon}>🖼️</Text>
            <Text style={styles.galleryButtonText}>Galeriden Seç</Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              💡 Yemeğin fotoğrafını çek, yapay zeka:
            </Text>
            <Text style={styles.infoItem}>• Yemek türlerini tanısın</Text>
            <Text style={styles.infoItem}>• Porsiyon ve karbonhidrat hesaplasın</Text>
            <Text style={styles.infoItem}>• Sana özel glikoz etkisi skoru versin</Text>
            <Text style={styles.infoItem}>• Geçmiş verilerinle karşılaştırsın</Text>
          </View>
        </View>
      ) : (
        <View style={styles.resultSection}>
          <Image source={{ uri: photoUri }} style={styles.foodImage} />

          {analyzing ? (
            <View style={styles.analyzingBox}>
              <ActivityIndicator size="large" color="#ec4899" />
              <Text style={styles.analyzingText}>Yemek analiz ediliyor...</Text>
              <Text style={styles.analyzingSubtext}>AI yemeği tanıyor 🤖</Text>
            </View>
          ) : analysisResult ? (
            <View style={styles.analysisBox}>
              <View style={styles.scoreCircle}>
                <Text style={styles.scoreNumber}>{analysisResult.glucoseImpactScore}</Text>
                <Text style={styles.scoreLabel}>/ 10</Text>
              </View>

              <Text style={styles.scoreTitle}>Glikoz Etkisi Skoru</Text>
              <Text style={styles.adviceText}>{analysisResult.advice}</Text>

              <View style={styles.detailsGrid}>
                <View style={styles.detailCard}>
                  <Text style={styles.detailIcon}>🍽️</Text>
                  <Text style={styles.detailLabel}>Tespit Edilen</Text>
                  <Text style={styles.detailValue}>{analysisResult.detectedFoods.join(', ')}</Text>
                </View>

                <View style={styles.detailCard}>
                  <Text style={styles.detailIcon}>🍚</Text>
                  <Text style={styles.detailLabel}>Karbonhidrat</Text>
                  <Text style={styles.detailValue}>{analysisResult.totalCarbs}g</Text>
                </View>

                <View style={styles.detailCard}>
                  <Text style={styles.detailIcon}>🔥</Text>
                  <Text style={styles.detailLabel}>Kalori</Text>
                  <Text style={styles.detailValue}>{analysisResult.totalCalories} kcal</Text>
                </View>

                <View style={styles.detailCard}>
                  <Text style={styles.detailIcon}>⚖️</Text>
                  <Text style={styles.detailLabel}>Porsiyon</Text>
                  <Text style={styles.detailValue}>{analysisResult.portion}</Text>
                </View>
              </View>

              <View style={styles.predictionBox}>
                <Text style={styles.predictionTitle}>🔮 Kişisel Tahmin Al</Text>
                <Text style={styles.predictionSubtitle}>Şu anki kan şekerini gir, 2 saat sonrasını tahmin edelim:</Text>
                <TextInput
                  style={styles.glucoseInput}
                  placeholder="Örn: 120"
                  keyboardType="numeric"
                  value={currentGlucose}
                  onChangeText={setCurrentGlucose}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity style={styles.predictButton} onPress={calculatePrediction}>
                  <Text style={styles.predictButtonText}>Tahmin Hesapla</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.saveButton} onPress={saveMeal}>
                  <Text style={styles.saveButtonText}>💾 Yemeği Kaydet</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.historyButton} onPress={showFoodHistory}>
                  <Text style={styles.historyButtonText}>📚 Benzer Yemekler</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.retakeButton}
                onPress={() => {
                  setPhotoUri(null);
                  setAnalysisResult(null);
                  setCurrentGlucose('');
                }}
              >
                <Text style={styles.retakeButtonText}>🔄 Yeni Fotoğraf</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      )}

      {/* Yemek Geçmişi Modalı */}
      <Modal visible={showHistory} animationType="slide" onRequestClose={() => setShowHistory(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📚 Benzer Yemek Geçmişi</Text>
            <TouchableOpacity onPress={() => setShowHistory(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {foodHistory.length === 0 ? (
              <Text style={styles.noHistoryText}>Bu yemeği daha önce kaydetmemişsin.</Text>
            ) : (
              foodHistory.map((meal, index) => (
                <View key={meal.id} style={styles.historyItem}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyDate}>
                      {new Date(meal.timestamp).toLocaleDateString('tr-TR')}
                    </Text>
                    {meal.avgGlucoseImpact !== undefined && (
                      <Text
                        style={[
                          styles.historyImpact,
                          {
                            color:
                              meal.avgGlucoseImpact > 50
                                ? '#ef4444'
                                : meal.avgGlucoseImpact > 30
                                ? '#f59e0b'
                                : '#10b981',
                          },
                        ]}
                      >
                        {meal.avgGlucoseImpact > 0 ? '+' : ''}
                        {Math.round(meal.avgGlucoseImpact)} mg/dL
                      </Text>
                    )}
                  </View>
                  <Text style={styles.historyFood}>{meal.foodName}</Text>
                  <Text style={styles.historyDetails}>
                    {meal.carbs}g karb • {meal.calories} kcal • {meal.portion}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    paddingBottom: 30,
  },
  header: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  cameraSection: {
    padding: 20,
  },
  cameraButton: {
    backgroundColor: '#ec4899',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cameraIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  galleryButton: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ec4899',
  },
  galleryIcon: {
    fontSize: 50,
    marginBottom: 10,
  },
  galleryButtonText: {
    color: '#ec4899',
    fontSize: 18,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  infoItem: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 5,
    paddingLeft: 10,
  },
  resultSection: {
    padding: 20,
  },
  foodImage: {
    width: '100%',
    height: 250,
    borderRadius: 15,
    marginBottom: 20,
  },
  analyzingBox: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 30,
    alignItems: 'center',
  },
  analyzingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 15,
  },
  analyzingSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 5,
  },
  analysisBox: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ec4899',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  scoreTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 10,
  },
  adviceText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailCard: {
    width: '48%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  detailIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  predictionBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  predictionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 5,
  },
  predictionSubtitle: {
    fontSize: 13,
    color: '#92400e',
    marginBottom: 10,
  },
  glucoseInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#fbbf24',
    marginBottom: 10,
  },
  predictButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  predictButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10b981',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginRight: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  historyButton: {
    flex: 1,
    backgroundColor: '#6366f1',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginLeft: 8,
  },
  historyButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  retakeButton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
  },
  modalClose: {
    fontSize: 28,
    color: '#9ca3af',
    fontWeight: '300',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  noHistoryText: {
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 16,
    marginTop: 50,
  },
  historyItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 13,
    color: '#9ca3af',
  },
  historyImpact: {
    fontSize: 14,
    fontWeight: '700',
  },
  historyFood: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 5,
  },
  historyDetails: {
    fontSize: 13,
    color: '#6b7280',
  },
});

function FoodCameraScreenWithNav(props) {
  return (
    <>
      <FoodCameraScreen {...props} />
      <BottomNavBar activeKey="Diary" />
    </>
  );
}

export default FoodCameraScreenWithNav;
