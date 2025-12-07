import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './screens/SplashScreen';
import MainScreen from './screens/MainScreen';
import SimpleDietPlanScreen from './screens/SimpleDietPlanScreen';
import HealthyRecipesScreen from './screens/HealthyRecipesScreen';
import IngredientSearchScreen from './screens/IngredientSearchScreen';
import ExerciseLibraryScreen from './screens/ExerciseLibraryScreen';
import BloodSugarScreen from './screens/BloodSugarScreen';
import EmergencyScreen from './screens/EmergencyScreen';
import GlucoseCalendarScreen from './screens/GlucoseCalendarScreen';
import FoodCameraScreen from './screens/FoodCameraScreen';
import StressSleepAnalysisScreen from './screens/StressSleepAnalysisScreen';
import VoiceCoachScreen from './screens/VoiceCoachScreen';
import DoctorReportScreen from './screens/DoctorReportScreen';
import PersonalInsightsScreen from './screens/PersonalInsightsScreen';
import DiabetesInfoScreen from './screens/DiabetesInfoScreen';
import HealthSyncScreen from './screens/HealthSyncScreen';
import AchievementsScreen from './screens/AchievementsScreen';
import { initializeDigitalTwin } from './logic/digitalTwin';

// Network hatalarını ve yaygın uyarıları sustur
LogBox.ignoreLogs([
  'Network request failed',
  'The internet connection appears to be offline',
  'Possible Unhandled Promise Rejection',
]);

const Stack = createNativeStackNavigator();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

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

  return (
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
          options={{ title: 'Ana Sayfa' }}
        />
        <Stack.Screen
          name="SimpleDietPlan"
          component={SimpleDietPlanScreen}
          options={{ title: 'Basit Diyet Planı' }}
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
      </Stack.Navigator>
    </NavigationContainer>
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
