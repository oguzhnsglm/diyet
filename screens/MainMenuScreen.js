import React, { useContext } from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { DietContext } from '../context/DietContext';
import { PrimaryButton } from '../components/common';
import { styles, colors } from '../styles';

const MainMenuScreen = ({ navigation }) => {
  const { user } = useContext(DietContext);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[colors.bgGradientStart, colors.bgGradientEnd]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {/* Hero Section */}
          <View style={styles.heroContainer}>
            <Text style={styles.heroTitle}>Diyetisyen Uygulaması</Text>
            <Text style={styles.heroSubtitle}>
              Sağlıklı beslenme alışkanlıkları kazanın ve hedeflerinize ulaşın
            </Text>
            {user && (
              <Text style={styles.neonPill}>
                Hoş geldin, {user.name}!
              </Text>
            )}
          </View>

          {/* Authentication Section - Only if no user */}
          {!user && (
            <View style={{ marginBottom: 24 }}>
              <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Hesap İşlemleri</Text>
              <View style={[styles.card, { marginBottom: 12 }]}>
                <Text style={styles.cardTitle}>YENİ KULLANICI</Text>
                <Text style={[styles.muted, { marginBottom: 16 }]}>
                  Kişiselleştirilmiş diyet planı oluşturun
                </Text>
                <PrimaryButton
                  label="Kayıt Ol"
                  onPress={() => navigation.navigate('Onboarding')}
                />
              </View>
              <View style={styles.card}>
                <Text style={styles.cardTitle}>HESABIM VAR</Text>
                <Text style={[styles.muted, { marginBottom: 16 }]}>
                  Mevcut hesabınıza giriş yapın
                </Text>
                <PrimaryButton
                  label="Giriş Yap"
                  variant="outline"
                  onPress={() => navigation.navigate('Onboarding')}
                />
              </View>
            </View>
          )}

          {/* Daily Tracking Section */}
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.sectionTitle}>Günlük Takip</Text>
            <View style={[styles.card, { marginBottom: 12 }]}>
              <Text style={styles.mealTitle}>Günlük Özet</Text>
              <Text style={[styles.muted, { marginBottom: 16 }]}>
                Bugünkü kalori ve besin değerlerinizi görüntüleyin
              </Text>
              <PrimaryButton
                label="Özetimi Gör"
                onPress={() => navigation.navigate('Home')}
              />
            </View>
            <View style={styles.card}>
              <Text style={styles.mealTitle}>Öğün Ekle</Text>
              <Text style={[styles.muted, { marginBottom: 16 }]}>
                Yediğiniz yemekleri kaydedin ve takip edin
              </Text>
              <PrimaryButton
                label="Öğün Kaydet"
                onPress={() => navigation.navigate('AddMeal')}
              />
            </View>
          </View>

          {/* Personalization Section */}
          <View style={{ marginBottom: 24 }}>
            <Text style={styles.sectionTitle}>Kişiselleştirme</Text>
            <View style={[styles.card, { marginBottom: 12 }]}>
              <Text style={styles.mealTitle}>Akıllı Öneriler</Text>
              <Text style={[styles.muted, { marginBottom: 16 }]}>
                Size özel yemek ve besin önerileri alın
              </Text>
              <PrimaryButton
                label="Öneri Al"
                variant="outline"
                onPress={() => navigation.navigate('Recommendations')}
              />
            </View>
            {user && (
              <View style={styles.card}>
                <Text style={styles.mealTitle}>Profil Ayarları</Text>
                <Text style={[styles.muted, { marginBottom: 16 }]}>
                  Kişisel bilgilerinizi ve hedeflerinizi güncelleyin
                </Text>
                <PrimaryButton
                  label="Profili Düzenle"
                  variant="outline"
                  onPress={() => navigation.navigate('Profile')}
                />
              </View>
            )}
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

export default MainMenuScreen;
