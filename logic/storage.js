import { supabase } from '../lib/supabase';

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
