import React, { useState, useEffect } from 'react';
import { SafeAreaView, ScrollView, Text, View, Pressable, TextInput, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const PLAN_KEY = '@diyetPlan';

const DietPlannerScreen = () => {
  const [plan, setPlan] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [hedefKalori, setHedefKalori] = useState('');
  const [amac, setAmac] = useState('kilo-ver');

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    try {
      const savedData = await AsyncStorage.getItem(PLAN_KEY);
      if (savedData) {
        setPlan(JSON.parse(savedData));
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

    const kahvalti = Math.round(kalori * 0.3);
    const ogle = Math.round(kalori * 0.35);
    const aksam = kalori - kahvalti - ogle;

    const yeniPlan = {
      hedefKalori: kalori,
      amac,
      ogunler: [
        { ad: 'Kahvaltı', kalori: kahvalti },
        { ad: 'Öğle', kalori: ogle },
        { ad: 'Akşam', kalori: aksam },
      ],
    };

    try {
      await AsyncStorage.setItem(PLAN_KEY, JSON.stringify(yeniPlan));
      setPlan(yeniPlan);
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
              setHedefKalori('');
            } catch (error) {
              Alert.alert('Hata', 'Plan silinemedi');
            }
          },
        },
      ]
    );
  };

  const getAmacText = (amacValue) => {
    switch (amacValue) {
      case 'kilo-ver': return 'Kilo Verme';
      case 'kilo-koru': return 'Kilo Koruma';
      case 'kilo-al': return 'Kilo Alma';
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
                    {[
                      { value: 'kilo-ver', label: 'Kilo vermek' },
                      { value: 'kilo-koru', label: 'Kilonu korumak' },
                      { value: 'kilo-al', label: 'Kilo almak' },
                    ].map((option) => (
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
                    value="3"
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

            <View style={styles.mealList}>
              {plan.ogunler.map((ogun, idx) => (
                <View key={idx} style={styles.mealItem}>
                  <Text style={styles.mealName}>{ogun.ad}</Text>
                  <Text style={styles.mealCal}>{ogun.kalori} kcal</Text>
                </View>
              ))}
            </View>

            <Pressable style={styles.dangerButton} onPress={deletePlan}>
              <Text style={styles.dangerButtonText}>Planı Sil ve Yeniden Başla</Text>
            </Pressable>
          </View>
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
  mealList: {
    gap: 0,
  },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
  },
  mealCal: {
    fontSize: 14,
    color: '#64748b',
  },
});

export default DietPlannerScreen;
