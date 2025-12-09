import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, LogBox, Platform, Appearance } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './screens/SplashScreen';
import MainScreen from './screens/MainScreen';
import HomeScreen from './screens/HomeScreen';
import AddMealScreen from './screens/AddMealScreen';
import RecommendationsScreen from './screens/RecommendationsScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import AuthHomeScreen from './screens/Auth/AuthHomeScreen';
import LoginScreenNew from './screens/Auth/LoginScreenNew';
import RegisterStepOneScreen from './screens/Auth/RegisterStepOneScreen';
import RegisterStepTwoScreen from './screens/Auth/RegisterStepTwoScreen';
import QuestionWizardScreen from './screens/Auth/QuestionWizardScreen';
import CreateAccountScreen from './screens/Auth/CreateAccountScreen';
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
import GlucoseCalendarScreen from './screens/GlucoseCalendarScreen';
import ProfileScreen from './screens/ProfileScreen';
import WaterTrackerScreen from './screens/WaterTrackerScreen';
import ActivitiesScreen from './screens/ActivitiesScreen';
import LibreStatsScreen from './screens/LibreStatsScreen';
import UrineAnalysisScreen from './screens/UrineAnalysisScreen';
import MainMenuScreen from './screens/MainMenuScreen';
import AnaSayfaScreen from './screens/AnaSayfaScreen';
import BasicMainMenuScreen from './screens/BasicMainMenuScreen';
import FoodCameraScreen from './screens/FoodCameraScreen';
import StressSleepAnalysisScreen from './screens/StressSleepAnalysisScreen';
import VoiceCoachScreen from './screens/VoiceCoachScreen';
import DoctorReportScreen from './screens/DoctorReportScreen';
import PersonalInsightsScreen from './screens/PersonalInsightsScreen';
import DiabetesInfoScreen from './screens/DiabetesInfoScreen';
import HealthSyncScreen from './screens/HealthSyncScreen';
import AchievementsScreen from './screens/AchievementsScreen';
import { DietProvider } from './context/DietContext';
import { initializeDigitalTwin } from './logic/digitalTwin';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Network hatalarını ve yaygın uyarıları sustur
LogBox.ignoreLogs([
  'Network request failed',
  'The internet connection appears to be offline',
  'Possible Unhandled Promise Rejection',
]);

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

function AuthStackNavigator() {
  return (
    <AuthStack.Navigator
      initialRouteName="AuthHome"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#020617' },
      }}
    >
      <AuthStack.Screen name="AuthHome" component={AuthHomeScreen} />
      <AuthStack.Screen name="LoginScreen" component={LoginScreenNew} />
      <AuthStack.Screen name="RegisterStepOne" component={RegisterStepOneScreen} />
      <AuthStack.Screen name="RegisterStepTwo" component={RegisterStepTwoScreen} />
      <AuthStack.Screen name="QuestionWizard" component={QuestionWizardScreen} />
      <AuthStack.Screen name="CreateAccount" component={CreateAccountScreen} />
    </AuthStack.Navigator>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [theme, setTheme] = useState('dark');

  const toggleTheme = useCallback(async () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem('app_theme', next).catch(() => {});
      return next;
    });
  }, []);

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const stored = await AsyncStorage.getItem('app_theme');
        if (stored === 'light' || stored === 'dark') {
          setTheme(stored);
        } else {
          const system = Appearance.getColorScheme();
          setTheme(system === 'light' ? 'light' : 'dark');
        }
      } catch {
        const system = Appearance.getColorScheme();
        setTheme(system === 'light' ? 'light' : 'dark');
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Dijital İkiz'i başlat
    initializeDigitalTwin();
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  const screenOptions = {
    headerTitleAlign: 'center',
    headerTransparent: true,
    headerBlurEffect: Platform.OS === 'ios' ? 'systemUltraThinMaterialDark' : undefined,
    headerTintColor: theme === 'dark' ? '#E5F2FF' : '#0F172A',
    headerTitleStyle: { fontWeight: '600', fontSize: 16, letterSpacing: 0.3 },
    headerShadowVisible: false,
    contentStyle: { backgroundColor: 'transparent' },
    animation: 'slide_from_right',
  };

  return (
    <DietProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Auth"
          screenOptions={screenOptions}
        >
        <Stack.Screen
          name="Auth"
          component={AuthStackNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Main" 
          component={MainScreen}
          options={{
            title: 'Ana Sayfa',
            headerShown: false,
          }}
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
          options={{ title: 'Sağlıklı Tarifler' }}
        />
        <Stack.Screen
          name="IngredientSearch"
          component={IngredientSearchScreen}
          options={{ title: 'Malzeme Ara' }}
        />
        <Stack.Screen
          name="ExerciseLibrary"
          component={ExerciseLibraryScreen}
          options={{ title: 'Egzersiz Kütüphanesi' }}
        />
        <Stack.Screen
          name="BloodSugar"
          component={BloodSugarScreen}
          options={{ title: 'Kan Şekeri Takibi' }}
        />
        <Stack.Screen
          name="Emergency"
          component={EmergencyScreen}
          options={{ title: 'Acil Durum' }}
        />
        <Stack.Screen
          name="GlucoseCalendar"
          component={GlucoseCalendarScreen}
          options={{ title: 'Günlük Takvim' }}
        />
        <Stack.Screen
          name="FoodCamera"
          component={FoodCameraScreen}
          options={{
            title: 'Akıllı Yemek Analizi',
            headerStyle: { backgroundColor: '#ec4899' },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="StressSleep"
          component={StressSleepAnalysisScreen}
          options={{
            title: 'Uyku & Stres Analitiği',
            headerStyle: { backgroundColor: '#8b5cf6' },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="VoiceCoach"
          component={VoiceCoachScreen}
          options={{
            title: 'Diyabet Koçu',
            headerStyle: { backgroundColor: '#6366f1' },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="DoctorReport"
          component={DoctorReportScreen}
          options={{
            title: 'Doktor Raporu',
            headerStyle: { backgroundColor: '#10b981' },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="PersonalInsights"
          component={PersonalInsightsScreen}
          options={{
            title: 'Kişisel İçgörüler',
            headerStyle: { backgroundColor: '#f59e0b' },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="DiabetesInfo"
          component={DiabetesInfoScreen}
          options={{
            title: 'Diyabet Bilgileri',
            headerStyle: { backgroundColor: '#3b82f6' },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="HealthSync"
          component={HealthSyncScreen}
          options={{
            title: 'Sağlık Senkronizasyonu',
            headerStyle: { backgroundColor: '#667eea' },
            headerTintColor: '#FFFFFF',
          }}
        />
        <Stack.Screen
          name="Achievements"
          component={AchievementsScreen}
          options={{
            title: 'Başarılarım',
            headerStyle: { backgroundColor: '#3b82f6' },
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 18,
    color: 'white',
  },
});
