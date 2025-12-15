import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  View,
  Pressable,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Svg, { Path, Circle } from 'react-native-svg';
import BottomNavBar from '../components/BottomNavBar';

const UrineTrackerScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [todayRecords, setTodayRecords] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedFrequency, setSelectedFrequency] = useState('normal');

  // İdrar renkleri (açıktan koyuya)
  const urineColors = [
    { id: 1, name: 'Çok Açık', color: '#FFFACD', status: 'Çok iyi hidrasyon', icon: '💧' },
    { id: 2, name: 'Açık Sarı', color: '#FFEB99', status: 'Sağlıklı', icon: '✅' },
    { id: 3, name: 'Sarı', color: '#FFD700', status: 'Normal', icon: '😊' },
    { id: 4, name: 'Koyu Sarı', color: '#FFA500', status: 'Hafif susuz', icon: '⚠️' },
    { id: 5, name: 'Turuncu', color: '#FF8C00', status: 'Susuz - Su için!', icon: '🚨' },
    { id: 6, name: 'Kahverengi', color: '#8B4513', status: 'Ciddi susuzluk', icon: '❌' },
  ];

  // Sıklık seçenekleri
  const frequencyOptions = [
    { id: 'az', label: 'Az (1-3 kez)', color: '#FF3B30' },
    { id: 'normal', label: 'Normal (4-8 kez)', color: '#32D74B' },
    { id: 'sık', label: 'Sık (9+ kez)', color: '#FF9500' },
  ];

  // Verileri yükle
  useEffect(() => {
    loadTodayRecords();
  }, []);

  const loadTodayRecords = async () => {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      const stored = await AsyncStorage.getItem('urineRecords');
      if (stored) {
        const allRecords = JSON.parse(stored);
        const today = new Date().toDateString();
        const todayData = allRecords.filter(r => new Date(r.timestamp).toDateString() === today);
        setTodayRecords(todayData);
      }
    } catch (error) {
      console.log('Kayıtlar yüklenemedi:', error);
    }
  };

  const saveRecord = async () => {
    if (!selectedColor) {
      Alert.alert('Uyarı', 'Lütfen idrar rengini seçin');
      return;
    }

    const newRecord = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      color: selectedColor,
      frequency: selectedFrequency,
    };

    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      const stored = await AsyncStorage.getItem('urineRecords');
      const allRecords = stored ? JSON.parse(stored) : [];
      allRecords.push(newRecord);
      await AsyncStorage.setItem('urineRecords', JSON.stringify(allRecords));
      
      // Günlük sayacı güncelle
      const count = await AsyncStorage.getItem('urineCount');
      const newCount = count ? parseInt(count) + 1 : 1;
      await AsyncStorage.setItem('urineCount', newCount.toString());

      setTodayRecords([...todayRecords, newRecord]);
      setSelectedColor(null);
      Alert.alert('✅ Kaydedildi', 'İdrar kaydınız eklendi');
    } catch (error) {
      Alert.alert('Hata', 'Kayıt eklenemedi');
    }
  };

  const deleteRecord = async (recordId) => {
    try {
      const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
      const stored = await AsyncStorage.getItem('urineRecords');
      const allRecords = stored ? JSON.parse(stored) : [];
      const filtered = allRecords.filter(r => r.id !== recordId);
      await AsyncStorage.setItem('urineRecords', JSON.stringify(filtered));
      
      setTodayRecords(todayRecords.filter(r => r.id !== recordId));
      
      // Günlük sayacı azalt
      const count = await AsyncStorage.getItem('urineCount');
      const newCount = count ? Math.max(0, parseInt(count) - 1) : 0;
      await AsyncStorage.setItem('urineCount', newCount.toString());
    } catch (error) {
      Alert.alert('Hata', 'Kayıt silinemedi');
    }
  };

  const getHealthAdvice = () => {
    const count = todayRecords.length;
    const hasWarning = todayRecords.some(r => r.color && r.color.id >= 4);

    if (hasWarning) {
      return {
        icon: '⚠️',
        title: 'Dikkat: Su İçin!',
        message: 'İdrar renginiz susuzluk gösteriyor. Daha fazla su için.',
        color: '#FF9500',
      };
    }

    if (count < 4) {
      return {
        icon: '💧',
        title: 'Daha Fazla Su İçin',
        message: 'Günde 4-8 kez idrar yapmanız normal kabul edilir.',
        color: '#0A84FF',
      };
    }

    if (count > 10) {
      return {
        icon: '🏥',
        title: 'Çok Sık İdrar',
        message: 'Günde 10+ kez idrar normalin üstünde. Doktora danışın.',
        color: '#FF3B30',
      };
    }

    return {
      icon: '✅',
      title: 'Harika!',
      message: 'İdrar sıklığınız ve renginiz normal görünüyor.',
      color: '#32D74B',
    };
  };

  const advice = getHealthAdvice();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Svg width={24} height={24} viewBox="0 0 24 24">
              <Path d="M15 18l-6-6 6-6" stroke={colors.text} strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>İdrar Takibi</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Sağlık Tavsiyesi */}
        <View style={[styles.adviceCard, { backgroundColor: advice.color + '15', borderColor: advice.color }]}>
          <Text style={styles.adviceIcon}>{advice.icon}</Text>
          <View style={styles.adviceContent}>
            <Text style={[styles.adviceTitle, { color: advice.color }]}>{advice.title}</Text>
            <Text style={[styles.adviceMessage, { color: colors.text }]}>{advice.message}</Text>
          </View>
        </View>

        {/* Bugünün Özeti */}
        <View style={[styles.summaryCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Bugün</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{todayRecords.length}</Text>
              <Text style={[styles.summaryLabel, { color: colors.secondaryText }]}>İdrar Sayısı</Text>
            </View>
          </View>
        </View>

        {/* Renk Seçimi */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>İdrar Rengi</Text>
          
          <View style={styles.colorGrid}>
            {urineColors.map((item) => (
              <Pressable
                key={item.id}
                style={[
                  styles.colorOption,
                  selectedColor?.id === item.id && styles.colorOptionSelected,
                  { borderColor: selectedColor?.id === item.id ? '#0A84FF' : colors.border }
                ]}
                onPress={() => setSelectedColor(item)}
              >
                <View style={[styles.colorCircle, { backgroundColor: item.color }]} />
                <Text style={[styles.colorName, { color: colors.text }]}>{item.name}</Text>
                <Text style={styles.colorIcon}>{item.icon}</Text>
                <Text style={[styles.colorStatus, { color: colors.secondaryText }]}>{item.status}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Sıklık Seçimi */}
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Günlük Sıklık</Text>
          
          <View style={styles.frequencyButtons}>
            {frequencyOptions.map((option) => (
              <Pressable
                key={option.id}
                style={[
                  styles.frequencyButton,
                  { 
                    backgroundColor: selectedFrequency === option.id ? option.color + '15' : colors.background,
                    borderColor: selectedFrequency === option.id ? option.color : colors.border,
                  }
                ]}
                onPress={() => setSelectedFrequency(option.id)}
              >
                <Text style={[
                  styles.frequencyLabel,
                  { color: selectedFrequency === option.id ? option.color : colors.text }
                ]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Kaydet Butonu */}
        <Pressable
          style={[styles.saveButton, { backgroundColor: '#0A84FF' }]}
          onPress={saveRecord}
        >
          <Text style={styles.saveButtonText}>Kaydet</Text>
        </Pressable>

        {/* Bugünün Kayıtları */}
        {todayRecords.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Bugünün Kayıtları</Text>
            
            {todayRecords.map((record, index) => {
              const colorData = urineColors.find(c => c.id === record.color?.id);
              return (
                <View key={record.id} style={[styles.recordItem, { borderBottomColor: colors.border }]}>
                  <View style={styles.recordLeft}>
                    <View style={[styles.recordColorDot, { backgroundColor: colorData?.color || '#DDD' }]} />
                    <View>
                      <Text style={[styles.recordTime, { color: colors.text }]}>
                        {new Date(record.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                      <Text style={[styles.recordColor, { color: colors.secondaryText }]}>
                        {colorData?.name || 'Bilinmiyor'}
                      </Text>
                    </View>
                  </View>
                  <Pressable
                    style={styles.deleteButton}
                    onPress={() => {
                      Alert.alert(
                        'Sil',
                        'Bu kaydı silmek istediğinizden emin misiniz?',
                        [
                          { text: 'İptal', style: 'cancel' },
                          { text: 'Sil', style: 'destructive', onPress: () => deleteRecord(record.id) }
                        ]
                      );
                    }}
                  >
                    <Text style={styles.deleteIcon}>🗑️</Text>
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        {/* Bilgilendirme */}
        <View style={[styles.infoCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>📊 İdrar Rengi Rehberi</Text>
          <Text style={[styles.infoText, { color: colors.secondaryText }]}>
            • <Text style={{ fontWeight: '600' }}>Açık Sarı:</Text> Sağlıklı hidrasyon{'\n'}
            • <Text style={{ fontWeight: '600' }}>Koyu Sarı/Turuncu:</Text> Daha fazla su için{'\n'}
            • <Text style={{ fontWeight: '600' }}>Kahverengi:</Text> Acil su ihtiyacı{'\n'}
            • <Text style={{ fontWeight: '600' }}>Normal Sıklık:</Text> Günde 4-8 kez
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 0 : 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  adviceCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  adviceIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  adviceContent: {
    flex: 1,
  },
  adviceTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  adviceMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E5EA',
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: '47%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    backgroundColor: '#FFFFFF10',
  },
  colorOptionSelected: {
    borderWidth: 3,
  },
  colorCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#00000020',
  },
  colorName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  colorIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  colorStatus: {
    fontSize: 11,
    textAlign: 'center',
  },
  frequencyButtons: {
    gap: 12,
  },
  frequencyButton: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  frequencyLabel: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#0A84FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  recordLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  recordColorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#00000020',
  },
  recordTime: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  recordColor: {
    fontSize: 13,
  },
  deleteButton: {
    padding: 8,
  },
  deleteIcon: {
    fontSize: 20,
  },
  infoCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
  },
});

function UrineTrackerScreenWithNav(props) {
  return (
    <>
      <UrineTrackerScreen {...props} />
      <BottomNavBar activeKey="Diary" />
    </>
  );
}

export default UrineTrackerScreenWithNav;
