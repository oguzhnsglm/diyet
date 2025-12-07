import React, { useState, useEffect, useMemo } from 'react';
import { SafeAreaView, ScrollView, Text, View, Pressable, TextInput, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

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
  { id: 'oat08', name: 'Yulaf lapası (1 porsiyon)', calories: 220 },
  { id: 'egg02', name: 'Haşlanmış yumurta', calories: 78 },
  { id: 'avocado', name: 'Avokado dilimi', calories: 60 },
  { id: 'almond10', name: '10 adet çiğ badem', calories: 70 },
  { id: 'apple', name: 'Elma', calories: 95 },
  { id: 'salad', name: 'Zeytinyağlı salata', calories: 120 },
  { id: 'kinoa', name: 'Kinoa tabak', calories: 210 },
  { id: 'chicken', name: 'Izgara tavuk (150g)', calories: 240 },
  { id: 'soup', name: 'Mercimek çorbası', calories: 150 },
  { id: 'yogurt', name: 'Yoğurt + chia', calories: 110 },
  { id: 'darkchoco', name: 'Bitter çikolata (20g)', calories: 120 },
  { id: 'nutsmix', name: 'Küçük kuru yemiş', calories: 140 },
  { id: 'protein', name: 'Protein shake', calories: 180 },
  { id: 'fruitbowl', name: '3 meyveli kase', calories: 160 },
];

const GOAL_OPTIONS = [
  { value: 'kilo-ver', label: 'Kilo vermek' },
  { value: 'kilo-koru', label: 'Kilonu korumak' },
  { value: 'kilo-al', label: 'Kilo almak' },
  { value: 'kas-kazan', label: 'Kas kazanmak' },
  { value: 'tip1', label: 'Tip 1 diyabet' },
  { value: 'tip2', label: 'Tip 2 diyabet' },
];

const ensureEntryShape = (entries = {}) => {
  const normalized = {};
  MEAL_SLOTS.forEach((slot) => {
    normalized[slot.id] = Array.isArray(entries[slot.id]) ? [...entries[slot.id]] : [];
  });
  return normalized;
};

const buildPlanStructure = (kalori, amacValue, existingEntries = {}) => {
  const meals = MEAL_SLOTS.map((slot) => ({
    id: slot.id,
    label: slot.label,
    window: slot.window,
    hedefKalori: Math.round(kalori * slot.ratio),
  }));
  return {
    hedefKalori: kalori,
    amac: amacValue,
    meals,
    entries: ensureEntryShape(existingEntries),
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

const DietPlannerScreen = () => {
  const [plan, setPlan] = useState(null);
  const [mealEntries, setMealEntries] = useState(ensureEntryShape());
  const [showForm, setShowForm] = useState(false);
  const [hedefKalori, setHedefKalori] = useState('');
  const [amac, setAmac] = useState('kilo-ver');
  const [activeMeal, setActiveMeal] = useState(MEAL_SLOTS[0].id);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
          setPlan(parsed);
          setMealEntries(ensureEntryShape(parsed.entries));
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

    const yeniPlan = buildPlanStructure(kalori, amac);

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
              setMealEntries(ensureEntryShape());
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
    if (!query) return FOOD_LIBRARY;
    return FOOD_LIBRARY.filter(food => food.name.toLowerCase().includes(query));
  }, [searchQuery]);

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
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#E8F5E9', '#F5F7FA']} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.card}>
              <Text style={styles.emptyTitle}>Henüz bir planın yok</Text>
              <Text style={styles.emptySubtitle}>
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
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#E8F5E9', '#F5F7FA']} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={[styles.card, { borderColor: '#22c55e', borderWidth: 2 }]}>
              <Text style={styles.formTitle}>Planını Yapılandır</Text>
              <Text style={styles.formSubtitle}>Bilgilerini gir, senin için hesaplayalım.</Text>

              <View style={styles.formContainer}>
                <View style={styles.formRow}>
                  <Text style={styles.label}>Günlük hedef kalori</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Örn: 1800"
                    keyboardType="numeric"
                    value={hedefKalori}
                    onChangeText={setHedefKalori}
                  />
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.label}>Amacın</Text>
                  <View style={styles.radioGroup}>
                    {GOAL_OPTIONS.map((option) => (
                      <Pressable
                        key={option.value}
                        style={[styles.radioOption, amac === option.value && styles.radioOptionActive]}
                        onPress={() => setAmac(option.value)}
                      >
                        <Text style={[styles.radioText, amac === option.value && styles.radioTextActive]}>
                          {option.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>

                <View style={styles.formRow}>
                  <Text style={styles.label}>Öğün sayısı</Text>
                  <TextInput
                    style={[styles.input, styles.inputDisabled]}
                    value="6"
                    editable={false}
                  />
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
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#E8F5E9', '#F5F7FA']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <View style={styles.summaryHeader}>
              <View>
                <Text style={styles.totalCal}>{plan.hedefKalori} kcal</Text>
                <Text style={styles.totalCalSubtitle}>Günlük Hedef</Text>
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
                  <View key={meal.id} style={styles.mealCard}>
                    <View style={styles.mealHeader}>
                      <View>
                        <Text style={styles.mealName}>{meal.label}</Text>
                        <Text style={styles.mealWindow}>{meal.window}</Text>
                      </View>
                      <View style={styles.mealCalBox}>
                        <Text style={styles.mealCal}>{consumed} / {meal.hedefKalori} kcal</Text>
                        <Text style={styles.mealHint}>{remaining === 0 ? 'Tamamlandı' : `${remaining} kcal kaldı`}</Text>
                      </View>
                    </View>

                    {items.length ? (
                      <View style={styles.foodList}>
                        {items.map(item => (
                          <View key={item.entryId} style={styles.foodRow}>
                            <View>
                              <Text style={styles.foodName}>{item.name}</Text>
                              <Text style={styles.foodCal}>{item.calories} kcal</Text>
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
                      <Text style={styles.foodEmptyText}>Henüz yemek eklenmedi.</Text>
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

            <View style={styles.tableContainer}>
              <View style={[styles.tableRow, styles.tableHeaderRow]}>
                <Text style={[styles.tableCell, styles.tableHeadText]}>Öğün</Text>
                <Text style={[styles.tableCell, styles.tableHeadText]}>Hedef</Text>
                <Text style={[styles.tableCell, styles.tableHeadText]}>Alınan</Text>
              </View>
              {plan.meals.map(meal => (
                <View key={meal.id} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{meal.label}</Text>
                  <Text style={styles.tableCell}>{meal.hedefKalori} kcal</Text>
                  <Text style={styles.tableCell}>{calculateMealTotal(meal.id)} kcal</Text>
                </View>
              ))}
              <View style={[styles.tableRow, styles.tableFooterRow]}>
                <Text style={[styles.tableCell, styles.tableHeadText]}>Toplam</Text>
                <Text style={[styles.tableCell, styles.tableHeadText]}>{plan.hedefKalori} kcal</Text>
                <Text style={[styles.tableCell, styles.tableHeadText]}>{dailyTotal} kcal</Text>
              </View>
            </View>

            <View style={styles.motivationCard}>
              <Text style={styles.motivationLabel}>Motivasyon</Text>
              <Text style={styles.motivationText}>{motivationMessage}</Text>
            </View>

            <Pressable style={styles.dangerButton} onPress={deletePlan}>
              <Text style={styles.dangerButtonText}>Planı Sil ve Yeniden Başla</Text>
            </Pressable>
          </View>
        </ScrollView>

        <Pressable style={styles.fab} onPress={() => setPickerOpen(true)}>
          <Text style={styles.fabIcon}>＋</Text>
        </Pressable>

        {pickerOpen && plan ? (
          <View style={styles.pickerOverlay}>
            <View style={styles.pickerCard}>
              <View style={styles.pickerHeader}>
                <Text style={styles.pickerTitle}>Yemek seç ve ekle</Text>
                <Pressable onPress={() => setPickerOpen(false)}>
                  <Text style={styles.closeText}>Kapat</Text>
                </Pressable>
              </View>

              <View style={styles.mealChipRow}>
                {MEAL_SLOTS.map(slot => (
                  <Pressable
                    key={slot.id}
                    style={[styles.mealChip, activeMeal === slot.id && styles.mealChipActive]}
                    onPress={() => setActiveMeal(slot.id)}
                  >
                    <Text style={[styles.mealChipText, activeMeal === slot.id && styles.mealChipTextActive]}>
                      {slot.label}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <TextInput
                style={styles.searchInput}
                placeholder="Yemek ara (örn: tavuk, çorba)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />

              <ScrollView style={styles.foodPickerList}>
                {filteredFoods.map(food => (
                  <View key={food.id} style={styles.foodPickerRow}>
                    <View>
                      <Text style={styles.foodPickerName}>{food.name}</Text>
                      <Text style={styles.foodPickerCal}>{food.calories} kcal</Text>
                    </View>
                    <Pressable style={styles.foodAddButton} onPress={() => handleAddFood(food)}>
                      <Text style={styles.foodAddText}>Ekle</Text>
                    </Pressable>
                  </View>
                ))}
                {!filteredFoods.length && (
                  <Text style={styles.noFoodText}>Aramana uygun yemek bulunamadı.</Text>
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
    backgroundColor: '#F5F7FA',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 25,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 24,
    lineHeight: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#d1d5db',
    gap: 16,
  },
  formRow: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4b5563',
  },
  input: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    fontSize: 14,
    backgroundColor: '#fff',
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
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
  },
  radioOptionActive: {
    borderColor: '#22c55e',
    backgroundColor: '#ecfdf3',
  },
  radioText: {
    fontSize: 14,
    color: '#4b5563',
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

export default DietPlannerScreen;
