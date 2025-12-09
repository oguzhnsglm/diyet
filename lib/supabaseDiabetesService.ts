import { supabase } from './supabase';

/* ────────────────────────────────
   1) Client Setup & Initialization
   ──────────────────────────────── */

export function ensureSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase client başlatılamadı.');
  }
  return supabase;
}

/* ────────────────────────────────
   2) Diyabet / İdrar Analizleri
   ──────────────────────────────── */

export async function getUrineAnalysisByUser(userId: string, options?: { from?: string; to?: string }) {
  const { data, error } = await supabase.rpc('get_urine_analysis', {
    p_user_id: userId,
    p_from: options?.from ?? null,
    p_to: options?.to ?? null,
  });

  if (error) throw error;
  return data;
}

/* ────────────────────────────────
   3) Exercise & Recipe Fetcher / Öneriler
   ──────────────────────────────── */

export async function fetchDiabetesExerciseAndRecipes(userId: string, diabetesType?: string) {
  const { data, error } = await supabase.rpc('fetch_diabetes_exercise_and_recipes', {
    p_user_id: userId,
    p_diabetes_type: diabetesType ?? null,
  });

  if (error) throw error;
  return data;
}

export async function getDiabetesFriendlyRecipeSuggestions(userId: string) {
  const { data, error } = await supabase.rpc('get_diabetes_friendly_recipes', {
    p_user_id: userId,
  });

  if (error) throw error;
  return data;
}

export async function getPersonalizedExerciseRecommendations(userId: string, bmi?: number, diabetesType?: string) {
  const { data, error } = await supabase.rpc('get_personalized_exercise_recommendations', {
    p_user_id: userId,
    p_bmi: bmi ?? null,
    p_diabetes_type: diabetesType ?? null,
  });

  if (error) throw error;
  return data;
}

/* ────────────────────────────────
   4) Günlük / Haftalık / Aylık Glukoz Özetleri
   ──────────────────────────────── */

export async function updateGlucoseDailySummary(userId: string, date: string) {
  const { data, error } = await supabase.rpc('update_glucose_daily_summary', {
    p_user_id: userId,
    p_date: date,
  });

  if (error) throw error;
  return data;
}

export async function getDailyGlucoseSummary(userId: string, date: string) {
  const { data, error } = await supabase.rpc('get_daily_glucose_summary', {
    p_user_id: userId,
    p_date: date,
  });

  if (error) throw error;
  return data;
}

export async function getWeeklyGlucoseSummaries(userId: string, weekStartDate: string) {
  const { data, error } = await supabase.rpc('get_weekly_glucose_summaries', {
    p_user_id: userId,
    p_week_start: weekStartDate,
  });

  if (error) throw error;
  return data;
}

export async function getMonthlyGlucoseSummary(userId: string, month: string) {
  const { data, error } = await supabase.rpc('get_monthly_glucose_summary', {
    p_user_id: userId,
    p_month: month,
  });

  if (error) throw error;
  return data;
}

export async function getLastSixMonthsGlucoseSummary(userId: string) {
  const { data, error } = await supabase.rpc('get_last_6_months_glucose_summary', {
    p_user_id: userId,
  });

  if (error) throw error;
  return data;
}

export async function getGlucoseSummary(userId: string, range: { from: string; to: string }) {
  const { data, error } = await supabase.rpc('get_glucose_summary_in_range', {
    p_user_id: userId,
    p_from: range.from,
    p_to: range.to,
  });

  if (error) throw error;
  return data;
}

/* ────────────────────────────────
   5) Kan Şekeri Okumaları
   ──────────────────────────────── */

export async function getBloodGlucoseReadings(
  userId: string,
  options?: { from?: string; to?: string; limit?: number }
) {
  let query = supabase
    .from('blood_glucose_readings')
    .select('*')
    .eq('user_id', userId)
    .order('measured_at', { ascending: false });

  if (options?.from) query = query.gte('measured_at', options.from);
  if (options?.to) query = query.lte('measured_at', options.to);
  if (options?.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/* ────────────────────────────────
   6) Diyabet Bilgileri & Hedefler
   ──────────────────────────────── */

export async function getMyDiabetesTargets(userId: string) {
  const { data, error } = await supabase.rpc('get_my_diabetes_targets', {
    p_user_id: userId,
  });

  if (error) throw error;
  return data;
}

export async function getGlycemicTargetsByType(diabetesType: string) {
  const { data, error } = await supabase.rpc('get_glycemic_targets_by_type', {
    p_diabetes_type: diabetesType,
  });

  if (error) throw error;
  return data;
}

export async function updateUserDiabetesInfo(userId: string, payload: Record<string, any>) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      diabetes_type: payload.diabetes_type ?? null,
      diagnosis_date: payload.diagnosis_date ?? null,
      insulin_regimen: payload.insulin_regimen ?? null,
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMyDiabetesInfo(userId: string) {
  const { data, error } = await supabase.rpc('get_my_diabetes_info', {
    p_user_id: userId,
  });

  if (error) throw error;
  return data;
}

export async function addDiabetesFieldsToProfiles() {
  const { data, error } = await supabase.rpc('add_diabetes_fields_to_profiles');
  if (error) throw error;
  return data;
}

/* ────────────────────────────────
   7) Streak & Progress Fonksiyonları
   ──────────────────────────────── */

export async function getCurrentStreak(userId: string) {
  const { data, error } = await supabase.rpc('get_current_streak', {
    p_user_id: userId,
  });

  if (error) throw error;
  return data;
}

export async function get7And30DayProgress(userId: string) {
  const { data, error } = await supabase.rpc('get_7_and_30_day_progress', {
    p_user_id: userId,
  });

  if (error) throw error;
  return data;
}

export async function getDailyProgressPercentages(userId: string, date: string) {
  const { data, error } = await supabase.rpc('get_daily_progress_percentages', {
    p_user_id: userId,
    p_date: date,
  });

  if (error) throw error;
  return data;
}

export async function getDailyGoalStatus(userId: string, date: string) {
  const { data, error } = await supabase.rpc('get_daily_goal_status', {
    p_user_id: userId,
    p_date: date,
  });

  if (error) throw error;
  return data;
}

export async function getDailyProgressOverview(userId: string, date: string) {
  const { data, error } = await supabase.rpc('get_daily_progress_overview', {
    p_user_id: userId,
    p_date: date,
  });

  if (error) throw error;
  return data;
}

/* ────────────────────────────────
   8) Günlük Plan & Kalori Hedefleri
   ──────────────────────────────── */

export async function generateDailyPlan(userId: string, date: string) {
  const { data, error } = await supabase.rpc('generate_daily_plan', {
    p_user_id: userId,
    p_date: date,
  });

  if (error) throw error;
  return data;
}

export async function addCalorieTargetsToDailyPlans() {
  const { data, error } = await supabase.rpc('add_calorie_targets_to_daily_plans');
  if (error) throw error;
  return data;
}

/* ────────────────────────────────
   9) BMI Tabanlı Egzersiz Önerileri
   ──────────────────────────────── */

export async function getTodayBmiExerciseSuggestions(userId: string) {
  const { data, error } = await supabase.rpc('get_today_bmi_exercise_suggestions', {
    p_user_id: userId,
  });

  if (error) throw error;
  return data;
}

export async function getBmiExerciseRecommendations(userId: string, bmi: number) {
  const { data, error } = await supabase.rpc('get_bmi_exercise_recommendations', {
    p_user_id: userId,
    p_bmi: bmi,
  });

  if (error) throw error;
  return data;
}

/* ────────────────────────────────
   10) Egzersiz Kütüphanesi
   ──────────────────────────────── */

export async function seedExerciseLibrary() {
  const { data, error } = await supabase.rpc('seed_exercise_library');
  if (error) throw error;
  return data;
}

export async function getGeneralExerciseLibrary() {
  const { data, error } = await supabase
    .from('exercise_library')
    .select('*')
    .order('difficulty', { ascending: true });

  if (error) throw error;
  return data;
}

/* ────────────────────────────────
   11) Tarifler / Favoriler / Tag Bazlı
   ──────────────────────────────── */

export async function getTopLikedRecipes(limit = 10) {
  const { data, error } = await supabase.rpc('get_top_liked_recipes', {
    p_limit: limit,
  });

  if (error) throw error;
  return data;
}

export async function getMyFavoriteRecipes(userId: string) {
  const { data, error } = await supabase.rpc('get_my_favorite_recipes', {
    p_user_id: userId,
  });

  if (error) throw error;
  return data;
}

export async function fetchRecipesByTag(tagId: number) {
  const { data, error } = await supabase.rpc('fetch_recipes_by_tag', {
    p_tag_id: tagId,
  });

  if (error) throw error;
  return data;
}

export async function getRecipesByTags(tagIds: number[]) {
  const { data, error } = await supabase.rpc('get_recipes_by_tags', {
    p_tag_ids: tagIds,
  });

  if (error) throw error;
  return data;
}

export async function fetchRecipesByTagNames(tagNames: string[]) {
  const { data, error } = await supabase.rpc('fetch_recipes_by_tag_names', {
    p_tag_names: tagNames,
  });

  if (error) throw error;
  return data;
}

export async function getRecipesByTagName(tagName: string) {
  const { data, error } = await supabase.rpc('get_recipes_by_tag_name', {
    p_tag_name: tagName,
  });

  if (error) throw error;
  return data;
}

export async function getRecipeTagsAndRelations() {
  const { data, error } = await supabase
    .from('recipe_tags')
    .select('id, name, recipe_tag_relations(recipe_id)');

  if (error) throw error;
  return data;
}

/* ────────────────────────────────
   12) Bugünün Beslenme Özeti
   ──────────────────────────────── */

export async function getTodayNutritionSummary(userId: string, date: string) {
  const { data, error } = await supabase.rpc('get_today_nutrition_summary', {
    p_user_id: userId,
    p_date: date,
  });

  if (error) throw error;
  return data;
}

export async function getTodayNutritionSummaryFunction(userId: string) {
  const { data, error } = await supabase.rpc('today_nutrition_summary_function', {
    p_user_id: userId,
  });

  if (error) throw error;
  return data;
}

/* ────────────────────────────────
   13) Beslenme ve Tarif Modeli
   ──────────────────────────────── */

export async function getNutritionAndRecipeModel(userId: string) {
  const { data, error } = await supabase.rpc('get_nutrition_and_recipe_model', {
    p_user_id: userId,
  });

  if (error) throw error;
  return data;
}
