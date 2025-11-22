import React, { useContext } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { DietContext } from '../context/DietContext';
import { SummaryCard, PrimaryButton } from '../components/common';
import { formatDateTR, getTodayISO } from '../logic/utils';
import { styles, colors } from '../styles';

const HomeScreen = ({ navigation }) => {
  const { user, meals, refreshTodayMeals, reloadUser, loading } = useContext(DietContext);

  useFocusEffect(
    React.useCallback(() => {
      refreshTodayMeals();
      reloadUser();
    }, [refreshTodayMeals, reloadUser])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.containerCenter}>
        <Text style={{ color: colors.primary, fontSize: 16 }}>Yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.containerCenter}>
        <Text style={{ color: colors.text, marginBottom: 16, fontSize: 16 }}>Kullanıcı profili bulunamadı.</Text>
        <PrimaryButton label="Yeni profil oluştur" onPress={() => navigation.replace('Onboarding')} />
      </SafeAreaView>
    );
  }

  const totalCalories = meals.reduce((sum, m) => sum + Number(m.calories || 0), 0);
  const totalSugar = meals.reduce((sum, m) => sum + Number(m.sugarGrams || 0), 0);
  const remainingCalories = user.dailyCalorieTarget - totalCalories;
  const remainingSugar = user.dailySugarLimitGr - totalSugar;
  const overLimit = remainingCalories < 0 || remainingSugar < 0;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[colors.bgGradientStart, colors.bgGradientEnd]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={[styles.card, styles.glassCard]}>
            <Text style={styles.title}>Merhaba {user.name}! </Text>
            <Text style={styles.subtitle}>{formatDateTR(getTodayISO())}</Text>
            <Text style={styles.muted}>Günlük beslenme hedeflerinizi takip edin</Text>
          </View>

          <View style={styles.cardRow}>
            <SummaryCard
              title="Toplam alınan kalori"
              value={`${totalCalories} kcal`}
              subtitle={`Hedef: ${user.dailyCalorieTarget} kcal`}
              danger={remainingCalories < 0}
            />
            <SummaryCard
              title="Kalan günlük kalori"
              value={`${remainingCalories} kcal`}
              subtitle={remainingCalories < 0 ? 'Hedef aşıldı' : 'Dengeyi koru'}
              danger={remainingCalories < 0}
            />
          </View>

          <View style={styles.cardRow}>
            <SummaryCard
              title="Alınan şeker"
              value={`${totalSugar} gr`}
              subtitle={`Limit: ${user.dailySugarLimitGr} gr`}
              danger={remainingSugar < 0}
            />
            <SummaryCard
              title="Kalan şeker limiti"
              value={`${remainingSugar} gr`}
              subtitle={remainingSugar < 0 ? 'Limit aşıldı' : 'Güvenli bölge'}
              danger={remainingSugar < 0}
            />
          </View>

          {overLimit && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                Günlük kalori veya şeker limitini aştın. Daha hafif, düşük glisemik seçenekler tercih ederek
                obezite/diyabet riskini azalt.
              </Text>
            </View>
          )}

          <Text style={styles.sectionTitle}>Bugünkü öğünler</Text>
          {meals.length === 0 ? (
            <Text style={styles.muted}>Henüz öğün eklenmedi.</Text>
          ) : (
            meals.map((m) => (
              <View key={m.id} style={styles.mealItem}>
                <Text style={styles.mealTitle}>
                  {m.mealType.toUpperCase()}  {m.foodName}
                </Text>
                <Text style={styles.mealMeta}>
                  {m.calories} kcal  {m.sugarGrams || 0} gr şeker
                </Text>
              </View>
            ))
          )}

          <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
          <View style={{ gap: 12 }}>
            <PrimaryButton 
              label=" Diyet Planı Oluştur" 
              onPress={() => navigation.navigate('DietPlan')} 
            />
            <PrimaryButton 
              label="Öğün Ekle" 
              variant="outline"
              onPress={() => navigation.navigate('AddMeal')} 
            />
            <PrimaryButton
              label="Akıllı Öneri Al"
              variant="outline"
              onPress={() =>
                navigation.navigate('Recommendations', {
                  remainingCalories,
                  remainingSugar,
                })
              }
            />
            <PrimaryButton
              label="Profil Ayarları"
              variant="outline"
              onPress={() => navigation.navigate('Profile')}
            />
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default HomeScreen;
