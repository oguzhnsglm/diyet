import React, { useState, useEffect } from 'react';
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

const Stack = createNativeStackNavigator();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
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
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="DietPlan" 
          component={SimpleDietPlanScreen} 
          options={{ title: 'Diyet Planı Oluştur' }} 
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
