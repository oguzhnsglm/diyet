import React, { useContext, useState, useEffect } from 'react';
import { SafeAreaView, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DietProvider, DietContext } from './context/DietContext';
import SplashScreen from './screens/SplashScreen';
import MainMenuScreen from './screens/MainMenuScreen';
import AnaSayfaScreen from './screens/AnaSayfaScreen';
import BasicMainMenuScreen from './screens/BasicMainMenuScreen';
import AuthPageScreen from './screens/AuthPageScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import HomeScreen from './screens/HomeScreen';
import AddMealScreen from './screens/AddMealScreen';
import RecommendationsScreen from './screens/RecommendationsScreen';
import ProfileScreen from './screens/ProfileScreen';

const Stack = createNativeStackNavigator();

const Navigator = () => {
  const { loading } = useContext(DietContext);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F7FA' }}>
        <Text style={{ color: '#4CAF50', fontWeight: '600', fontSize: 16 }}>Yükleniyor...</Text>
      </SafeAreaView>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName="Auth"
      screenOptions={{
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#2C3E50',
        headerShadowVisible: true,
      }}
    >
      <Stack.Screen name="Auth" component={AuthPageScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Giriş Yap' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Kaydol' }} />
      <Stack.Screen name="AnaSayfa" component={AnaSayfaScreen} options={{ headerShown: false }} />
      <Stack.Screen name="BasicMainMenu" component={BasicMainMenuScreen} options={{ title: 'Menü', headerShown: true }} />
      <Stack.Screen name="MainMenu" component={MainMenuScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Günlük Özet' }} />
      <Stack.Screen name="AddMeal" component={AddMealScreen} options={{ title: 'Öğün Ekle' }} />
      <Stack.Screen name="Recommendations" component={RecommendationsScreen} options={{ title: 'Öneriler' }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Stack.Navigator>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Safety timeout in case something blocks onFinish
    const failSafe = setTimeout(() => setShowSplash(false), 4000);
    return () => clearTimeout(failSafe);
  }, []);

  return (
    <DietProvider>
      {showSplash ? (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      ) : (
        <NavigationContainer>
          <Navigator />
        </NavigationContainer>
      )}
    </DietProvider>
  );
}
