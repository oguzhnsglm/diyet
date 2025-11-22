import React from 'react';
import { SafeAreaView, ScrollView, Text, View, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const MainScreen = ({ navigation }) => {
  const menuOptions = [
    {
      id: 1,
      title: '🍽️ Diyet Planı Oluştur',
      description: 'Sağlıklı yiyeceklerle kendi diyet planını oluştur',
      color: '#4CAF50',
      screen: 'DietPlan',
    },
    {
      id: 2,
      title: '🥗 Sağlıklı Tarifler',
      description: 'Bowl tarifleri, şekersiz tatlılar ve daha fazlası',
      color: '#FF9800',
      screen: 'HealthyRecipes',
    },
    {
      id: 3,
      title: '🔍 Malzemeden Tarif Bul',
      description: 'Elindeki malzemelerle yapabileceğin tarifleri keşfet',
      color: '#2196F3',
      screen: 'IngredientSearch',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#E8F5E9', '#F5F7FA']} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Sağlıklı Yaşam</Text>
            <Text style={styles.headerSubtitle}>Beslenme asistanına hoş geldin!</Text>
          </View>

          {menuOptions.map(option => (
            <Pressable
              key={option.id}
              style={[styles.menuCard, { borderLeftColor: option.color }]}
              onPress={() => navigation.navigate(option.screen)}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F8F9FA']}
                style={styles.menuGradient}
              >
                <Text style={styles.menuTitle}>{option.title}</Text>
                <Text style={styles.menuDescription}>{option.description}</Text>
                <View style={[styles.menuBadge, { backgroundColor: option.color }]}>
                  <Text style={styles.menuBadgeText}>Başla →</Text>
                </View>
              </LinearGradient>
            </Pressable>
          ))}

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              💚 Sağlıklı beslenerek hayat kalitenizi artırın
            </Text>
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
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  menuCard: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderLeftWidth: 6,
  },
  menuGradient: {
    padding: 20,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 8,
  },
  menuDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    marginBottom: 16,
    lineHeight: 20,
  },
  menuBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  menuBadgeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#2E7D32',
    textAlign: 'center',
  },
});

export default MainScreen;
