import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, Platform } from 'react-native';

const USER_KEY = '@user';
const MEALS_KEY = '@meals';

const showError = (title, message) => {
  if (Platform.OS === 'web') {
    console.error(title, message);
  } else {
    Alert.alert(title, message);
  }
};

export const getUser = async () => {
  try {
    const stored = await AsyncStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Kullanıcı verisi okunamadı', error);
    showError('Hata', 'Veriler yüklenirken bir sorun oluştu.');
    return null;
  }
};

export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Kullanıcı kaydedilemedi', error);
    showError('Hata', 'Veriler kaydedilirken bir sorun oluştu.');
  }
};

export const getAllMeals = async () => {
  try {
    const stored = await AsyncStorage.getItem(MEALS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Öğünler okunamadı', error);
    showError('Hata', 'Veriler yüklenirken bir sorun oluştu.');
    return [];
  }
};

export const addMeal = async (meal) => {
  try {
    const meals = await getAllMeals();
    meals.push(meal);
    await AsyncStorage.setItem(MEALS_KEY, JSON.stringify(meals));
  } catch (error) {
    console.error('Öğün kaydı başarısız', error);
    showError('Hata', 'Öğün kaydedilirken bir sorun oluştu.');
  }
};

export const getMealsByDate = async (dateISO) => {
  const meals = await getAllMeals();
  return meals.filter((m) => m.dateISO === dateISO);
};
