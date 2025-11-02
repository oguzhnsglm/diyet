import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PracticeScreen from './screens/PracticeScreen';
import ResultScreen from './screens/ResultScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import LevelSelectScreen from './screens/LevelSelectScreen';
import LevelDetailScreen from './screens/LevelDetailScreen';
import { PracticeProvider } from './context/PracticeContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PracticeProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Levels" component={LevelSelectScreen} />
          <Stack.Screen name="LevelDetail" component={LevelDetailScreen} />
          <Stack.Screen name="Practice" component={PracticeScreen} />
          <Stack.Screen name="Result" component={ResultScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PracticeProvider>
  );
}
