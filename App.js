import React, { useEffect, useState } from "react";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { registerRootComponent } from 'expo';
import { DietProvider } from './context/DietContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';

import AuthHomeScreen from './screens/Auth/AuthHomeScreen';
import LoginScreenNew from './screens/Auth/LoginScreenNew';
import RegisterStepOneScreen from './screens/Auth/RegisterStepOneScreen';
import RegisterStepTwoScreen from './screens/Auth/RegisterStepTwoScreen';
import QuestionWizardScreen from './screens/Auth/QuestionWizardScreen';
import CreateAccountScreen from './screens/Auth/CreateAccountScreen';
import DietPlannerScreen from './screens/DietPlannerScreen';
import HealthyRecipesScreen from './screens/HealthyRecipesScreen';
import GlucoseCalendarScreen from './screens/GlucoseCalendarScreen';
import StressSleepAnalysisScreen from './screens/StressSleepAnalysisScreen';
import BloodSugarScreen from './screens/BloodSugarScreen';
import VoiceCoachScreen from './screens/VoiceCoachScreen';
import ProfileScreen from './screens/ProfileScreen';
import IngredientSearchScreen from './screens/IngredientSearchScreen';
import DietPlanScreen from './screens/DietPlannerScreen';
import AddMealScreen from './screens/AddMealScreen';
import SettingsScreen from './screens/SettingsScreen';
import TodaySummaryCard from './components/TodaySummaryCard';
import MilestoneCard from './components/MilestoneCard';
import ProgressBar from './components/ProgressBar';
import WaterTrackerScreen from './screens/WaterTrackerScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LogBox } from 'react-native';
import MainScreen from './screens/MainScreen';
import FoodCameraScreen from './screens/FoodCameraScreen';
import DiabetesInfoScreen from './screens/DiabetesInfoScreen';
import PersonalInsightsScreen from './screens/PersonalInsightsScreen';
import DoctorReportScreen from './screens/DoctorReportScreen';
import HealthSyncScreen from './screens/HealthSyncScreen';
import LibreStatsScreen from './screens/LibreStatsScreen';
import UrineTrackerScreen from './screens/UrineTrackerScreen';

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

// Disable all log notifications
LogBox.ignoreAllLogs();

const screenOptions = {
  headerStyle: {
    backgroundColor: '#0b1728',
  },
  headerTitleStyle: {
    color: '#e5f2ff',
    fontWeight: 'bold',
  },
  headerTintColor: '#e5f2ff',
};

function AuthStackNavigator({ onLogin }) {
  return (
    <AuthStack.Navigator
      initialRouteName="AuthHome"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <AuthStack.Screen name="AuthHome" component={AuthHomeScreen} />
      <AuthStack.Screen name="LoginScreen">
        {(props) => <LoginScreenNew {...props} onLogin={onLogin} />}
      </AuthStack.Screen>
      <AuthStack.Screen name="RegisterStepOne" component={RegisterStepOneScreen} />
      <AuthStack.Screen name="RegisterStepTwo" component={RegisterStepTwoScreen} />
      <AuthStack.Screen name="QuestionWizard" component={QuestionWizardScreen} />
      <AuthStack.Screen name="CreateAccount" component={CreateAccountScreen} />
    </AuthStack.Navigator>
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const stored = await AsyncStorage.getItem('isAuthenticated');
        if (stored === 'true') {
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to load login state', error);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleLogin = async () => {
    setIsAuthenticated(true);
    await AsyncStorage.setItem('isAuthenticated', 'true');
  };

  const handleLogout = async () => {
    setIsAuthenticated(false);
    await AsyncStorage.removeItem('isAuthenticated');
  };

  return (
    <LanguageProvider>
    <ThemeProvider>
      <DietProvider>
        <NavigationContainer>
        <Stack.Navigator initialRouteName="Auth" screenOptions={screenOptions}>
          {isAuthenticated ? (
              <>
                <Stack.Screen name="Main" options={{ headerShown: false }}>
                  {(props) => <MainScreen {...props} onLogout={handleLogout} />}
                </Stack.Screen>
                <Stack.Screen name="WaterTracker" component={WaterTrackerScreen} options={{ headerShown: false }} />
                <Stack.Screen name="PersonalInsights" component={PersonalInsightsScreen} options={{ headerShown: false }} />
                <Stack.Screen name="DietPlanner" component={DietPlanScreen} options={{ headerShown: false }} />
                <Stack.Screen name="DietPlan" component={DietPlanScreen} options={{ headerShown: false }} />
                <Stack.Screen name="HealthyRecipes" component={HealthyRecipesScreen} options={{ headerShown: false }} />
                <Stack.Screen name="GlucoseCalendar" component={GlucoseCalendarScreen} options={{ headerShown: false }} />
                <Stack.Screen name="StressSleep" component={StressSleepAnalysisScreen} options={{ headerShown: false }} />
                <Stack.Screen name="BloodSugar" component={BloodSugarScreen} options={{ headerShown: false }} />
                <Stack.Screen name="VoiceCoach" component={VoiceCoachScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
                <Stack.Screen name="IngredientSearch" component={IngredientSearchScreen} options={{ headerShown: false }} />
                <Stack.Screen name="AddMeal" component={AddMealScreen} options={{ headerShown: false }} />
                <Stack.Screen name="FoodCamera" component={FoodCameraScreen} options={{ headerShown: false }} />
                <Stack.Screen name="DiabetesInfo" component={DiabetesInfoScreen} options={{ headerShown: false }} />
                <Stack.Screen name="DoctorReport" component={DoctorReportScreen} options={{ headerShown: false }} />
                <Stack.Screen name="HealthSync" component={HealthSyncScreen} options={{ headerShown: false }} />
                <Stack.Screen name="LibreStats" component={LibreStatsScreen} options={{ headerShown: false }} />
                <Stack.Screen name="UrineTracker" component={UrineTrackerScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
            </>
          ) : (
            <Stack.Screen name="Auth" options={{ headerShown: false }}>
              {(props) => <AuthStackNavigator {...props} onLogin={handleLogin} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
        </NavigationContainer>
      </DietProvider>
    </ThemeProvider>
  </LanguageProvider>
  );
}

registerRootComponent(App);
export default App;
