import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './screens/SplashScreen';
import MainScreen from './screens/MainScreen';
import SimpleDietPlanScreen from './screens/SimpleDietPlanScreen';
import HealthyRecipesScreen from './screens/HealthyRecipesScreen';
import IngredientSearchScreen from './screens/IngredientSearchScreen';

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
