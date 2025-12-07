import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';

const USER_KEY = '@diet-user-profile';
const MEALS_KEY = '@diet-meals-by-day';

const DEFAULT_USER = {
  name: 'Demo Kullanıcı',
  age: 34,
  gender: 'kadın',
  heightCm: 168,
  weightKg: 72,
  targetWeightKg: 65,
  dailyCalorieTarget: 1800,
  dailySugarLimitGr: 50,
  email: 'demo@diyetapp.com',
  phoneNumber: '+90 555 555 55 55',
  lastLoginAt: new Date().toISOString(),
};

const withDefaultUser = (payload = {}) => ({
  ...DEFAULT_USER,
  ...payload,
  lastLoginAt: payload?.lastLoginAt || new Date().toISOString(),
});

const getStoredMeals = async () => {
  const raw = await AsyncStorage.getItem(MEALS_KEY);
  return raw ? JSON.parse(raw) : {};
};

const persistMeals = async (data) => AsyncStorage.setItem(MEALS_KEY, JSON.stringify(data));

export const getUser = async () => {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
    const seeded = withDefaultUser();
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(seeded));
    return seeded;
  } catch (error) {
    console.warn('Kullanıcı bilgisi okunamadı', error);
    return withDefaultUser();
  }
};

export const saveUser = async (userData) => {
  const payload = withDefaultUser(userData);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(payload));
  return payload;
};

export const getMealsByDate = async (dateISO) => {
  const meals = await getStoredMeals();
  return meals[dateISO] || [];
};

export const addMeal = async (meal) => {
  if (!meal?.dateISO) {
    throw new Error('Meal nesnesi dateISO alanını içermeli');
  }
  const meals = await getStoredMeals();
  const dayMeals = meals[meal.dateISO] || [];
  meals[meal.dateISO] = [meal, ...dayMeals];
  await persistMeals(meals);
  return meal;
};

const throwIfError = (error, context) => {
  if (error) {
    console.error(`[Supabase] ${context}`, error);
    throw error;
  }
};

export const fetchProfileRecord = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  throwIfError(error, 'Profil verisi alınamadı');
  return data;
};

export const fetchLatestPlanRecord = async (userId) => {
  const { data, error } = await supabase
    .from('daily_plans')
    .select('*')
    .eq('user_id', userId)
    .order('plan_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  throwIfError(error, 'Günlük plan verisi alınamadı');
  return data;
};

export const upsertProfileRecord = async (payload) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();
  throwIfError(error, 'Profil kaydedilemedi');
  return data;
};

export const upsertPlanRecord = async (payload) => {
  const { data, error } = await supabase
    .from('daily_plans')
    .upsert(payload, { onConflict: 'user_id,plan_date' })
    .select()
    .single();
  throwIfError(error, 'Günlük plan kaydedilemedi');
  return data;
};

export const fetchMealsByDate = async (userId, dateISO) => {
  const { data, error } = await supabase
    .from('meals')
    .select('id, eaten_at, meal_type, custom_name, calories, sugar_grams, protein_grams, fat_grams, created_at')
    .eq('user_id', userId)
    .eq('eaten_at', dateISO)
    .order('created_at', { ascending: false });
  throwIfError(error, 'Öğünler getirilemedi');
  return data || [];
};

export const insertMealRecord = async (payload) => {
  const { data, error } = await supabase.from('meals').insert(payload).select().single();
  throwIfError(error, 'Öğün kaydedilemedi');
  return data;
};

export const fetchDailySummaryForDate = async (userId, dateISO) => {
  const { data, error } = await supabase
    .from('daily_summaries')
    .select('*')
    .eq('user_id', userId)
    .eq('summary_date', dateISO)
    .maybeSingle();
  throwIfError(error, 'Günlük özet alınamadı');
  return data;
};

export const fetchLatestGlucoseReading = async (userId) => {
  const { data, error } = await supabase
    .from('blood_glucose_readings')
    .select('*')
    .eq('user_id', userId)
    .order('measured_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  throwIfError(error, 'Kan şekeri verisi alınamadı');
  return data;
};

export const fetchGlucoseTrend = async (userId, startDateISO) => {
  const { data, error } = await supabase
    .from('glucose_daily_summaries')
    .select('*')
    .eq('user_id', userId)
    .gte('summary_date', startDateISO)
    .order('summary_date', { ascending: true });
  throwIfError(error, 'Glikoz trendi alınamadı');
  return data || [];
};

export const fetchBloodGlucoseReadings = async (userId, limit = 30) => {
  const { data, error } = await supabase
    .from('blood_glucose_readings')
    .select('*')
    .eq('user_id', userId)
    .order('measured_at', { ascending: false })
    .limit(limit);
  throwIfError(error, 'Kan şekeri ölçümleri alınamadı');
  return data || [];
};

export const insertBloodGlucoseReading = async (payload) => {
  const { data, error } = await supabase
    .from('blood_glucose_readings')
    .insert(payload)
    .select()
    .single();
  throwIfError(error, 'Kan şekeri ölçümü kaydedilemedi');
  return data;
};
