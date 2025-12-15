import React, { useState, useEffect, useMemo } from 'react';
import { SafeAreaView, ScrollView, Text, View, Pressable, TextInput, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import BottomNavBar from '../components/BottomNavBar';
import BackButton from '../components/BackButton';

const PLAN_KEY = '@diyetPlan';

const MEAL_SLOTS = [
  { id: 'breakfast', label: 'Kahvaltı', window: '07:00 - 09:00', ratio: 0.25 },
  { id: 'snack_morning', label: 'Sabah Ara Öğünü', window: '10:30', ratio: 0.1 },
  { id: 'lunch', label: 'Öğle', window: '12:00 - 13:30', ratio: 0.25 },
  { id: 'snack_afternoon', label: 'İkindi Ara Öğünü', window: '15:30', ratio: 0.15 },
  { id: 'dinner', label: 'Akşam', window: '18:30 - 20:30', ratio: 0.2 },
  { id: 'snack_evening', label: 'Akşam Sonrası', window: '21:30', ratio: 0.05 },
];

const FOOD_LIBRARY = [
  // Kahvaltılıklar
  { id: 'egg01', name: 'Yumurta (1 adet)', calories: 80, category: 'Kahvaltı' },
  { id: 'egg02', name: 'Haşlanmış yumurta', calories: 78, category: 'Kahvaltı' },
  { id: 'egg03', name: 'Sahanda yumurta', calories: 95, category: 'Kahvaltı' },
  { id: 'omlet', name: 'Omlet (2 yumurta)', calories: 154, category: 'Kahvaltı' },
  { id: 'menemen', name: 'Menemen (1 porsiyon)', calories: 150, category: 'Kahvaltı' },
  { id: 'peynir', name: 'Peynir (30g)', calories: 100, category: 'Kahvaltı' },
  { id: 'beyazpeynir', name: 'Beyaz peynir (30g)', calories: 75, category: 'Kahvaltı' },
  { id: 'kasar', name: 'Kaşar peyniri (30g)', calories: 113, category: 'Kahvaltı' },
  { id: 'zeytin', name: 'Zeytin (10 adet)', calories: 45, category: 'Kahvaltı' },
  { id: 'ekmek', name: 'Ekmek (1 dilim)', calories: 70, category: 'Kahvaltı' },
  { id: 'kepekliekmek', name: 'Kepekli ekmek (1 dilim)', calories: 65, category: 'Kahvaltı' },
  { id: 'simit', name: 'Simit (1 adet)', calories: 280, category: 'Kahvaltı' },
  { id: 'borek', name: 'Börek (1 dilim)', calories: 250, category: 'Kahvaltı' },
  { id: 'pogaca', name: 'Poğaça (1 adet)', calories: 290, category: 'Kahvaltı' },
  { id: 'oat', name: 'Yulaf lapası (1 porsiyon)', calories: 220, category: 'Kahvaltı' },
  { id: 'bal', name: 'Bal (1 ykaş)', calories: 64, category: 'Kahvaltı' },
  { id: 'recel', name: 'Reçel (1 ykaş)', calories: 50, category: 'Kahvaltı' },
  
  // Ana Yemekler
  { id: 'pilav', name: 'Pilav (1 porsiyon)', calories: 200, category: 'Ana Yemek' },
  { id: 'bulgurpilav', name: 'Bulgur pilavı (1 porsiyon)', calories: 180, category: 'Ana Yemek' },
  { id: 'makarna', name: 'Makarna (1 porsiyon)', calories: 220, category: 'Ana Yemek' },
  { id: 'tavuk', name: 'Izgara tavuk (150g)', calories: 240, category: 'Ana Yemek' },
  { id: 'kofte', name: 'Köfte (3 adet)', calories: 290, category: 'Ana Yemek' },
  { id: 'somon', name: 'Fırında somon (150g)', calories: 380, category: 'Ana Yemek' },
  { id: 'kebap', name: 'Kebap (1 porsiyon)', calories: 420, category: 'Ana Yemek' },
  { id: 'kuru fasulye', name: 'Kuru fasulye (1 porsiyon)', calories: 280, category: 'Ana Yemek' },
  { id: 'mercimek', name: 'Mercimek yemeği (1 porsiyon)', calories: 250, category: 'Ana Yemek' },
  { id: 'tavukdoner', name: 'Tavuk döner (1 porsiyon)', calories: 350, category: 'Ana Yemek' },
  
  // Çorbalar
  { id: 'mercimekcorba', name: 'Mercimek çorbası', calories: 150, category: 'Çorba' },
  { id: 'domates corba', name: 'Domates çorbası', calories: 130, category: 'Çorba' },
  { id: 'tarhana', name: 'Tarhana çorbası', calories: 180, category: 'Çorba' },
  { id: 'ezogelin', name: 'Ezogelin çorbası', calories: 160, category: 'Çorba' },
  
  // Salatalar
  { id: 'salata', name: 'Yeşil salata', calories: 50, category: 'Salata' },
  { id: 'cобансалата', name: 'Çoban salata', calories: 80, category: 'Salata' },
  { id: 'roka', name: 'Roka salatası', calories: 60, category: 'Salata' },
  { id: 'kinoa salata', name: 'Kinoa salatası', calories: 210, category: 'Salata' },
  
  // Zeytinyağlılar
  { id: 'fasulye', name: 'Zeytinyağlı taze fasulye', calories: 110, category: 'Zeytinyağlı' },
  { id: 'enginar', name: 'Zeytinyağlı enginar', calories: 120, category: 'Zeytinyağlı' },
  { id: 'yaprak sarma', name: 'Yaprak sarma (3 adet)', calories: 140, category: 'Zeytinyağlı' },
  
  // Meyveler
  { id: 'elma', name: 'Elma (1 adet)', calories: 95, category: 'Meyve' },
  { id: 'muz', name: 'Muz (1 adet)', calories: 105, category: 'Meyve' },
  { id: 'portakal', name: 'Portakal (1 adet)', calories: 62, category: 'Meyve' },
  { id: 'armut', name: 'Armut (1 adet)', calories: 102, category: 'Meyve' },
  { id: 'karpuz', name: 'Karpuz (1 dilim)', calories: 85, category: 'Meyve' },
  { id: 'uzum', name: 'Üzüm (1 salkm)', calories: 110, category: 'Meyve' },
  
  // Atıştırmalıklar
  { id: 'yogurt', name: 'Yoğurt (1 kase)', calories: 110, category: 'Atıştırmalık' },
  { id: 'badem', name: 'Badem (10 adet)', calories: 70, category: 'Atıştırmalık' },
  { id: 'ceviz', name: 'Ceviz (5 adet)', calories: 90, category: 'Atıştırmalık' },
  { id: 'findik', name: 'Fındık (10 adet)', calories: 88, category: 'Atıştırmalık' },
  { id: 'havuc', name: 'Havuç (1 adet)', calories: 41, category: 'Atıştırmalık' },
  { id: 'salatalik', name: 'Salatalık (1 adet)', calories: 16, category: 'Atıştırmalık' },
  { id: 'protein', name: 'Protein shake', calories: 180, category: 'Atıştırmalık' },
  { id: 'bitter', name: 'Bitter çikolata (20g)', calories: 120, category: 'Atıştırmalık' },
];

const GOAL_OPTIONS = [
  { value: 'kilo-ver', label: 'Kilo vermek' },
  { value: 'kilo-koru', label: 'Kilonu korumak' },
  { value: 'kilo-al', label: 'Kilo almak' },
  { value: 'kas-kazan', label: 'Kas kazanmak' },
  { value: 'tip1', label: 'Tip 1 diyabet' },
  { value: 'tip2', label: 'Tip 2 diyabet' },
];

const getMealSlots = (mealCount = 6) => {
  if (mealCount === 3) {
    return [MEAL_SLOTS[0], MEAL_SLOTS[2], MEAL_SLOTS[4]]; // Kahvaltı, Öğle, Akşam
  } else if (mealCount === 4) {
    return [MEAL_SLOTS[0], MEAL_SLOTS[1], MEAL_SLOTS[2], MEAL_SLOTS[4]]; // + Sabah ara
  } else if (mealCount === 5) {
    return [MEAL_SLOTS[0], MEAL_SLOTS[1], MEAL_SLOTS[2], MEAL_SLOTS[3], MEAL_SLOTS[4]]; // + İkindi ara
  }
  return MEAL_SLOTS; // 6 öğün (hepsi)
};

const ensureEntryShape = (entries = {}, mealCount = 6) => {
  const normalized = {};
  const slots = getMealSlots(mealCount);
  slots.forEach((slot) => {
    normalized[slot.id] = Array.isArray(entries[slot.id]) ? [...entries[slot.id]] : [];
  });
  return normalized;
};

const buildPlanStructure = (kalori, amacValue, mealCount = 6, existingEntries = {}) => {
  const activeSlots = getMealSlots(mealCount);
  const meals = activeSlots.map((slot) => ({
    id: slot.id,
    label: slot.label,
    window: slot.window,
    hedefKalori: Math.round(kalori * slot.ratio),
  }));
  return {
    hedefKalori: kalori,
    amac: amacValue,
    mealCount: mealCount,
    meals,
    entries: ensureEntryShape(existingEntries, mealCount),
  };
};

const getMotivationMessage = (total, target, amacValue) => {
  if (!target) return 'Plan oluşturduğunda seni motive eden cümle burada olacak.';
  const diff = total - target;
  const amacText = {
    'kilo-ver': 'defisite sadık kalmak',
    'kilo-koru': 'dengeyi korumak',
    'kilo-al': 'fazla kalori toplamak',
    'kas-kazan': 'kas liflerini beslemek',
    tip1: 'hipo riskini azaltmak',
    tip2: 'insülin direncini kırmak',
  }[amacValue] || 'hedefine yaklaşmak';

  if (Math.abs(diff) <= 80) {
    return `Harika gidiyorsun! Günlük hedefine çok yakınsın, ${amacText} için aynı ritimde devam.`;
  }
  if (diff < -80) {
    return 'Biraz daha enerji ekleyebilirsin, protein ağırlıklı küçük bir ara öğün seni dengeler.';
  }
  return 'Kalori çizgisini aştın ama sorun değil; yarın hafif bir yürüyüşle tabloyu dengeleyebilirsin.';
};

const DietPlannerScreenContent = ({ navigation }) => {
  const { isDarkMode, colors } = useTheme();
  const [plan, setPlan] = useState(null);
  const [mealEntries, setMealEntries] = useState(ensureEntryShape());
  const [showForm, setShowForm] = useState(false);
  const [hedefKalori, setHedefKalori] = useState('');
  const [amac, setAmac] = useState('kilo-ver');
  const [mealCount, setMealCount] = useState(6);
  const [activeMeal, setActiveMeal] = useState(MEAL_SLOTS[0].id);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Tümü');

  useEffect(() => {
    loadPlan();
  }, []);

  const persistPlan = async (nextPlan) => {
    try {
      await AsyncStorage.setItem(PLAN_KEY, JSON.stringify(nextPlan));
      setPlan(nextPlan);
      setMealEntries(nextPlan.entries);
    } catch (error) {
      console.error('Plan kaydedilemedi:', error);
    }
  };

  const loadPlan = async () => {
    try {
      const savedData = await AsyncStorage.getItem(PLAN_KEY);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        if (parsed?.meals) {
          setMealCount(parsed.mealCount || 6);
          setPlan(parsed);
          setMealEntries(ensureEntryShape(parsed.entries, parsed.mealCount || 6));
          return;
        }
        if (parsed?.hedefKalori) {
          const migratedPlan = buildPlanStructure(parsed.hedefKalori, parsed.amac || 'kilo-ver');
          await persistPlan(migratedPlan);
        }
      }
    } catch (error) {
      console.error('Plan yüklenemedi:', error);
    }
  };

  const savePlan = async () => {
    const kalori = Number(hedefKalori);
    if (!kalori || kalori < 500) {
      Alert.alert('Hata', 'Geçerli bir kalori hedefi girin (min: 500)');
      return;
    }

    const yeniPlan = buildPlanStructure(kalori, amac, mealCount);

    try {
      await persistPlan(yeniPlan);
      setShowForm(false);
      setHedefKalori('');
    } catch (error) {
      Alert.alert('Hata', 'Plan kaydedilemedi');
    }
  };

  const deletePlan = () => {
    Alert.alert(
      'Planı Sil',
      'Mevcut planı silmek istediğine emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.removeItem(PLAN_KEY);
              setPlan(null);
              setMealEntries(ensureEntryShape({}, 6));
              setMealCount(6);
              setHedefKalori('');
            } catch (error) {
              Alert.alert('Hata', 'Plan silinemedi');
            }
          },
        },
      ]
    );
  };

  const calculateMealTotal = (mealId) => {
    return (mealEntries[mealId] || []).reduce((sum, food) => sum + (food.calories || 0), 0);
  };

  const dailyTotal = useMemo(() => {
    return Object.keys(mealEntries).reduce((sum, key) => sum + calculateMealTotal(key), 0);
  }, [mealEntries]);

  const filteredFoods = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let foods = FOOD_LIBRARY;
    
    // Kategori filtresi
    if (categoryFilter !== 'Tümü') {
      foods = foods.filter(food => food.category === categoryFilter);
    }
    
    // Arama filtresi
    if (query) {
      foods = foods.filter(food => food.name.toLowerCase().includes(query));
    }
    
    return foods;
  }, [searchQuery, categoryFilter]);

  const motivationMessage = useMemo(() => {
    return getMotivationMessage(dailyTotal, plan?.hedefKalori || 0, plan?.amac);
  }, [dailyTotal, plan?.hedefKalori, plan?.amac]);

  const handleAddFood = async (food) => {
    if (!plan) return;
    const updatedEntries = {
      ...mealEntries,
      [activeMeal]: [
        ...(mealEntries[activeMeal] || []),
        { ...food, entryId: `${food.id}-${Date.now()}` },
      ],
    };
    const nextPlan = { ...plan, entries: updatedEntries };
    await persistPlan(nextPlan);
    setPickerOpen(false);
    setSearchQuery('');
  };

  const handleRemoveFood = async (mealId, entryId) => {
    if (!plan) return;
    const updatedEntries = {
      ...mealEntries,
      [mealId]: (mealEntries[mealId] || []).filter(item => item.entryId !== entryId),
    };
    const nextPlan = { ...plan, entries: updatedEntries };
    await persistPlan(nextPlan);
  };

  const getAmacText = (amacValue) => {
    switch (amacValue) {
      case 'kilo-ver': return 'Kilo Verme';
      case 'kilo-koru': return 'Kilo Koruma';
      case 'kilo-al': return 'Kilo Alma';
      case 'kas-kazan': return 'Kas Kazanma';
      case 'tip1': return 'Tip 1 Diyabet';
      case 'tip2': return 'Tip 2 Diyabet';
      default: return 'Bilinmiyor';
    }
  };

  // EMPTY STATE
  if (!plan && !showForm) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={isDarkMode ? ['#1C1C1E', '#000000'] : ['#E8F5E9', '#F5F7FA']} style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <BackButton navigation={navigation} />
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={[styles.card, { 
              backgroundColor: colors.cardBackground,
              borderColor: colors.border,
              shadowColor: isDarkMode ? '#000' : '#000',
              shadowOpacity: isDarkMode ? 0.3 : 0.05,
            }]}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Henüz bir planın yok</Text>
              <Text style={[styles.emptySubtitle, { color: colors.secondaryText }]}>
                Hedeflerine ulaşmak için hemen yeni bir diyet planı oluştur.
              </Text>
              <Pressable style={styles.primaryButton} onPress={() => setShowForm(true)}>
                <Text style={styles.primaryButtonText}>+ Diyet Planı Oluştur</Text>
              </Pressable>
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // FORM VIEW
  if (showForm) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient colors={isDarkMode ? ['#1C1C1E', '#000000'] : ['#E8F5E9', '#F5F7FA']} style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
            <BackButton navigation={navigation} />
          </View>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={[styles.card, { 
              backgroundColor: colors.cardBackground, 
              borderColor: '#22c55e', 
              borderWidth: 2,
              shadowColor: isDarkMode ? '#000' : '#000',
              shadowOpacity: isDarkMode ? 0.3 : 0.05,
            }]}>
              <Text style={[styles.formTitle, { color: colors.text }]}>Planını Yapılandır</Text>
              <Text style={[styles.formSubtitle, { color: colors.secondaryText }]}>Bilgilerini gir, senin için hesaplayalım.</Text>

              <View style={[styles.formContainer, {
                backgroundColor: isDarkMode ? '#1C1C1E' : '#f9fafb',
                borderColor: colors.border,
              }]}>
                <View style={styles.formRow}>
                  <Text style={[styles.label, { color: colors.text }]}>Günlük hedef kalori</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
                    placeholder="Örn: 1800"
                    placeholderTextColor={colors.secondaryText}
                    keyboardType="numeric"
                    value={hedefKalori}
                    onChangeText={setHedefKalori}
                  />
                </View>

                <View style={styles.formRow}>
                  <Text style={[styles.label, { color: colors.text }]}>Amacın</Text>
                  <View style={styles.radioGroup}>
                    {GOAL_OPTIONS.map((option) => (
                      <Pressable
                        key={option.value}
                        style={[
                          styles.radioOption,
                          { backgroundColor: colors.cardBackground, borderColor: colors.border },
                          amac === option.value && { 
                            borderColor: '#22c55e',
                            backgroundColor: isDarkMode ? '#064e3b' : '#ecfdf3',
                          }
                        ]}
                        onPress={() => setAmac(option.value)}
                      >
                        <Text style={[
                          styles.radioText,
                          { color: colors.text },
                          amac === option.value && styles.radioTextActive
                        ]}>
                          {option.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.formRow}>
                  <Text style={[styles.label, { color: colors.text }]}>Öğün sayısı</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {[3, 4, 5, 6].map((num) => (
                      <Pressable
                        key={num}
                        style={[
                          styles.optionButton,
                          { borderColor: mealCount === num ? '#0ea5e9' : colors.border },
                          { backgroundColor: mealCount === num ? '#e0f2fe' : (isDarkMode ? '#2C2C2E' : '#F9FAFB') }
                        ]}
                        onPress={() => setMealCount(num)}
                      >
                        <Text style={[styles.optionButtonText, { color: mealCount === num ? '#0ea5e9' : colors.text }]}>{num} öğün</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={[styles.muted, { fontSize: 12, marginTop: 4, color: colors.secondaryText }]}>
                    {mealCount === 6 ? 'Diyabet yönetimi için önerilen öğün sayısı' : `${mealCount} öğün seçildi`}
                  </Text>
                </View>

                <View style={styles.buttonRow}>
                  <Pressable
                    style={[styles.secondaryButton, { flex: 1 }]}
                    onPress={() => {
                      setShowForm(false);
                      setHedefKalori('');
                    }}
                  >
                    <Text style={styles.secondaryButtonText}>İptal</Text>
                  </Pressable>
                  <Pressable style={[styles.primaryButton, { flex: 2 }]} onPress={savePlan}>
                    <Text style={styles.primaryButtonText}>Kaydet ve Oluştur</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </ScrollView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // DASHBOARD VIEW (Plan exists)
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient colors={isDarkMode ? ['#1C1C1E', '#000000'] : ['#E8F5E9', '#F5F7FA']} style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <BackButton navigation={navigation} />
        </View>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
            <View style={styles.summaryHeader}>
              <View>
                <Text style={[styles.totalCal, { color: colors.text }]}>{plan.hedefKalori} kcal</Text>
                <Text style={[styles.totalCalSubtitle, { color: colors.secondaryText }]}>Günlük Hedef</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{getAmacText(plan.amac)}</Text>
              </View>
            </View>
            <View style={styles.mealGrid}>
              {plan.meals.map((meal) => {
                const items = mealEntries[meal.id] || [];
                const consumed = calculateMealTotal(meal.id);
                const remaining = Math.max(0, meal.hedefKalori - consumed);
                const isActive = activeMeal === meal.id;
                return (
                  <View key={meal.id} style={[styles.mealCard, { backgroundColor: isDarkMode ? '#2C2C2E' : '#f8fafc', borderColor: colors.border }]}>
                    <View style={styles.mealHeader}>
                      <View>
                        <Text style={[styles.mealName, { color: colors.text }]}>{meal.label}</Text>
                        <Text style={[styles.mealWindow, { color: colors.secondaryText }]}>{meal.window}</Text>
                      </View>
                      <View style={styles.mealCalBox}>
                        <Text style={styles.mealCal}>{consumed} / {meal.hedefKalori} kcal</Text>
                        <Text style={styles.mealHint}>{remaining === 0 ? 'Tamamlandı' : `${remaining} kcal kaldı`}</Text>
                      </View>
                    </View>

                    {items.length ? (
                      <View style={styles.foodList}>
                        {items.map(item => (
                          <View key={item.entryId} style={[styles.foodRow, { borderBottomColor: colors.border }]}>
                            <View>
                              <Text style={[styles.foodName, { color: colors.text }]}>{item.name}</Text>
                              <Text style={[styles.foodCal, { color: colors.secondaryText }]}>{item.calories} kcal</Text>
                            </View>
                            <Pressable
                              style={styles.removePill}
                              onPress={() => handleRemoveFood(meal.id, item.entryId)}
                            >
                              <Text style={styles.removePillText}>x</Text>
                            </Pressable>
                          </View>
                        ))}
                      </View>
                    ) : (
                      <Text style={[styles.foodEmptyText, { color: colors.secondaryText }]}>Henüz yemek eklenmedi.</Text>
                    )}

                    <Pressable
                      style={[styles.mealAddButton, isActive && styles.mealAddButtonActive]}
                      onPress={() => {
                        setActiveMeal(meal.id);
                        setPickerOpen(true);
                      }}
                    >
                      <Text style={[styles.mealAddText, isActive && styles.mealAddTextActive]}>Bu öğüne ekle</Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>

            <Pressable style={styles.dangerButton} onPress={deletePlan}>
              <Text style={styles.dangerButtonText}>Planı Sil ve Yeniden Başla</Text>
            </Pressable>
          </View>
        </ScrollView>

        {pickerOpen && plan ? (
          <View style={styles.pickerOverlay}>
            <View style={[styles.pickerCard, { backgroundColor: colors.cardBackground }]}>
              <View style={styles.pickerHeader}>
                <Text style={[styles.pickerTitle, { color: colors.text }]}>Yemek Ekle</Text>
                <Pressable onPress={() => { setPickerOpen(false); setCategoryFilter('Tümü'); }}>
                  <Text style={styles.closeText}>✕</Text>
                </Pressable>
              </View>

              {/* Kategori Filtreleri */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
                <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 4 }}>
                  {['Tümü', 'Kahvaltı', 'Ana Yemek', 'Çorba', 'Salata', 'Zeytinyağlı', 'Meyve', 'Atıştırmalık'].map(cat => (
                    <Pressable
                      key={cat}
                      style={[
                        styles.categoryChip,
                        { backgroundColor: categoryFilter === cat ? '#22c55e' : (isDarkMode ? '#2C2C2E' : '#f3f4f6') }
                      ]}
                      onPress={() => setCategoryFilter(cat)}
                    >
                      <Text style={[
                        styles.categoryChipText,
                        { color: categoryFilter === cat ? '#fff' : colors.text }
                      ]}>
                        {cat}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </ScrollView>

              <TextInput
                style={[styles.searchInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                placeholder="Ara..."
                placeholderTextColor={colors.secondaryText}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              <ScrollView style={styles.foodPickerList}>
                {filteredFoods.map(food => (
                  <View key={food.id} style={[styles.foodPickerRow, { borderBottomColor: colors.border }]}>
                    <View>
                      <Text style={[styles.foodPickerName, { color: colors.text }]}>{food.name}</Text>
                      <Text style={[styles.foodPickerCal, { color: colors.secondaryText }]}>{food.calories} kcal</Text>
                    </View>
                    <Pressable style={styles.foodAddButton} onPress={() => handleAddFood(food)}>
                      <Text style={styles.foodAddText}>Ekle</Text>
                    </Pressable>
                  </View>
                ))}
                {!filteredFoods.length && (
                  <Text style={[styles.noFoodText, { color: colors.secondaryText }]}>Aramına uygun yemek bulunamadı.</Text>
                )}
              </ScrollView>
            </View>
          </View>
        ) : null}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 25,
    elevation: 5,
    borderWidth: 1,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  formContainer: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 16,
  },
  formRow: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 14,
  },
  inputDisabled: {
    backgroundColor: '#e5e7eb',
    color: '#6b7280',
  },
  radioGroup: {
    gap: 8,
  },
  radioOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  radioOptionActive: {
    borderColor: '#22c55e',
  },
  radioText: {
    fontSize: 14,
  },
  radioTextActive: {
    color: '#16a34a',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: '#22c55e',
    borderRadius: 999,
    padding: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#94a3b8',
    borderRadius: 999,
    padding: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  dangerButton: {
    backgroundColor: '#fee2e2',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
    marginTop: 12,
  },
  dangerButtonText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '600',
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 12,
  },
  totalCal: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#15803d',
  },
  totalCalSubtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  badge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: 'bold',
  },
  mealGrid: {
    marginTop: 12,
    gap: 16,
  },
  mealCard: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  mealWindow: {
    fontSize: 12,
    color: '#475569',
    marginTop: 2,
  },
  mealCalBox: {
    alignItems: 'flex-end',
  },
  mealCal: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
  mealHint: {
    fontSize: 12,
    color: '#64748b',
  },
  foodList: {
    gap: 8,
    marginBottom: 10,
  },
  foodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  foodName: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '600',
  },
  foodCal: {
    fontSize: 12,
    color: '#475569',
  },
  removePill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePillText: {
    color: '#b91c1c',
    fontSize: 16,
    fontWeight: '700',
  },
  foodEmptyText: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 10,
  },
  mealAddButton: {
    borderWidth: 1,
    borderColor: '#cbd5f5',
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  mealAddButtonActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  mealAddText: {
    color: '#0f172a',
    fontWeight: '600',
  },
  mealAddTextActive: {
    color: '#fff',
  },
  tableContainer: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  tableHeaderRow: {
    backgroundColor: '#e0f2fe',
  },
  tableFooterRow: {
    backgroundColor: '#ecfdf3',
  },
  tableCell: {
    fontSize: 13,
    color: '#1e293b',
    flex: 1,
    fontWeight: '500',
  },
  tableHeadText: {
    fontWeight: '700',
  },
  motivationCard: {
    marginTop: 16,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 16,
  },
  motivationLabel: {
    color: '#a5b4fc',
    fontSize: 12,
    marginBottom: 6,
    fontWeight: '600',
  },
  motivationText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  fabIcon: {
    fontSize: 30,
    color: '#fff',
    marginTop: -2,
  },
  pickerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 16,
    justifyContent: 'flex-end',
  },
  pickerCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    maxHeight: '80%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeText: {
    color: '#ef4444',
    fontWeight: '700',
  },
  mealChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  mealChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  mealChipActive: {
    backgroundColor: '#0f172a',
    borderColor: '#0f172a',
  },
  mealChipText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '600',
  },
  mealChipTextActive: {
    color: '#fff',
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 10,
    fontSize: 14,
    marginBottom: 12,
  },
  foodPickerList: {
    maxHeight: 300,
  },
  foodPickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  foodPickerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  foodPickerCal: {
    fontSize: 12,
    color: '#475569',
  },
  foodAddButton: {
    backgroundColor: '#0f172a',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  foodAddText: {
    color: '#fff',
    fontWeight: '700',
  },
  noFoodText: {
    textAlign: 'center',
    paddingVertical: 20,
    color: '#94a3b8',
  },
});

const DietPlannerScreen = ({ navigation }) => (
  <View style={{ flex: 1 }}>
    <DietPlannerScreenContent navigation={navigation} />
    <BottomNavBar navigation={navigation} activeKey="DietPlan" />
  </View>
);

export default DietPlannerScreen;
