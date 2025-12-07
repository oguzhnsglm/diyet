import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './screens/SplashScreen';
import MainScreen from './screens/MainScreen';
import HomeScreen from './screens/HomeScreen';
import AddMealScreen from './screens/AddMealScreen';
import RecommendationsScreen from './screens/RecommendationsScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import LevelSelectScreen from './screens/LevelSelectScreen';
import LevelDetailScreen from './screens/LevelDetailScreen';
import PracticeScreen from './screens/PracticeScreen';
import ResultScreen from './screens/ResultScreen';
import SimpleDietPlanScreen from './screens/SimpleDietPlanScreen';
import DietPlannerScreen from './screens/DietPlannerScreen';
import HealthyRecipesScreen from './screens/HealthyRecipesScreen';
import IngredientSearchScreen from './screens/IngredientSearchScreen';
import ExerciseLibraryScreen from './screens/ExerciseLibraryScreen';
import BloodSugarScreen from './screens/BloodSugarScreen';
import EmergencyScreen from './screens/EmergencyScreen';
import DiabetesInfoScreen from './screens/DiabetesInfoScreen';
import GlucoseCalendarScreen from './screens/GlucoseCalendarScreen';
import ProfileScreen from './screens/ProfileScreen';
import { DietProvider } from './context/DietContext';
import { supabase } from './lib/supabase';
import WaterTrackerScreen from './screens/WaterTrackerScreen';
import ActivitiesScreen from './screens/ActivitiesScreen';
import LibreStatsScreen from './screens/LibreStatsScreen';
import UrineAnalysisScreen from './screens/UrineAnalysisScreen';
import MainMenuScreen from './screens/MainMenuScreen';
import AnaSayfaScreen from './screens/AnaSayfaScreen';
import BasicMainMenuScreen from './screens/BasicMainMenuScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const testDb = async () => {
      const { data, error } = await supabase.from('profiles').select('*').limit(1);
      console.log('Supabase test:', { data, error });
    };

    testDb();
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <DietProvider>
      <NavigationContainer>
        <Stack.Navigator
        initialRouteName="Main"
        screenOptions={{
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: '#4CAF50' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        <Stack.Screen 
          name="Main" 
          component={MainScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="MainMenu"
          component={MainMenuScreen}
          options={{ title: 'Menü', headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#FFFFFF' }}
        />
        <Stack.Screen
          name="AnaSayfa"
          component={AnaSayfaScreen}
          options={{ title: 'Ana Sayfa', headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#FFFFFF' }}
        />
        <Stack.Screen
          name="BasicMainMenu"
          component={BasicMainMenuScreen}
          options={{ title: 'Hızlı Menü', headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#FFFFFF' }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Günlük Özet', headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#FFFFFF' }}
        />
        <Stack.Screen
          name="AddMeal"
          component={AddMealScreen}
          options={{ title: 'Öğün Ekle', headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#FFFFFF' }}
        />
        <Stack.Screen
          name="Recommendations"
          component={RecommendationsScreen}
          options={{ title: 'Akıllı Öneriler', headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#FFFFFF' }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Giriş Yap', headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#FFFFFF' }}
        />
        <Stack.Screen
          name="Register"
          component={RegisterScreen}
          options={{ title: 'Kayıt Ol', headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#FFFFFF' }}
        />
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ title: 'Profil Oluştur', headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#FFFFFF' }}
        />
        <Stack.Screen
          name="Levels"
          component={LevelSelectScreen}
          options={{ title: 'Seviye Seç', headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#FFFFFF' }}
        />
        <Stack.Screen
          name="LevelDetail"
          component={LevelDetailScreen}
          options={{ title: 'Seviye Detayı', headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#FFFFFF' }}
        />
        <Stack.Screen
          name="Practice"
          component={PracticeScreen}
          options={{ title: 'Pratik', headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#FFFFFF' }}
        />
        <Stack.Screen
          name="Result"
          component={ResultScreen}
          options={{ title: 'Sonuçlar', headerStyle: { backgroundColor: '#4CAF50' }, headerTintColor: '#FFFFFF' }}
        />
        <Stack.Screen 
          name="DietPlan" 
          component={SimpleDietPlanScreen} 
          options={{ title: 'Fasting Alani' }} 
        />
        <Stack.Screen
          name="DietPlanner"
          component={DietPlannerScreen}
          options={{ title: 'Yeni Diyet Plani' }}
        />
        <Stack.Screen 
          name="HealthyRecipes" 
          component={HealthyRecipesScreen} 
          options={{ 
            title: 'Sağlıklı Tarifler',
            headerStyle: { backgroundColor: '#FF9800' },
          }} 
        />
        <Stack.Screen 
          name="IngredientSearch" 
          component={IngredientSearchScreen} 
          options={{ 
            title: 'Malzemeden Tarif Bul',
            headerStyle: { backgroundColor: '#2196F3' },
          }} 
        />
        <Stack.Screen
          name="ExerciseLibrary"
          component={ExerciseLibraryScreen}
          options={{
            title: 'Egzersiz Önerileri',
            headerStyle: { backgroundColor: '#3b82f6' },
          }}
        />
        <Stack.Screen
          name="BloodSugar"
          component={BloodSugarScreen}
          options={{
            title: 'Kan Şekeri Takibi',
            headerStyle: { backgroundColor: '#0ea5e9' },
          }}
        />
        <Stack.Screen
          name="Emergency"
          component={EmergencyScreen}
          options={{
            title: 'Acil Durum Önerileri',
            headerStyle: { backgroundColor: '#dc2626' },
          }}
        />
        <Stack.Screen
          name="DiabetesInfo"
          component={DiabetesInfoScreen}
          options={{
            title: 'Diyabet Bilgi Merkezi',
            headerStyle: { backgroundColor: '#0ea5e9' },
            headerTintColor: 'white',
          }}
        />
        <Stack.Screen
          name="GlucoseCalendar"
          component={GlucoseCalendarScreen}
          options={{
            title: 'Günlük Takvim',
            headerStyle: { backgroundColor: '#0ea5e9' },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="WaterTracker"
          component={WaterTrackerScreen}
          options={{
            title: 'Su Takibi',
            headerStyle: { backgroundColor: '#0ea5e9' },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="Activities"
          component={ActivitiesScreen}
          options={{
            title: 'Aktiviteler',
            headerStyle: { backgroundColor: '#10b981' },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="LibreStats"
          component={LibreStatsScreen}
          options={{
            title: 'Libre Sensör',
            headerStyle: { backgroundColor: '#16a34a' },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="UrineAnalysis"
          component={UrineAnalysisScreen}
          options={{
            title: 'İdrar Analizi',
            headerStyle: { backgroundColor: '#a21caf' },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            title: 'Profil',
            headerStyle: { backgroundColor: '#4CAF50' },
            headerTintColor: '#FFFFFF',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
    </DietProvider>
  );
}
