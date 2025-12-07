import AsyncStorage from '@react-native-async-storage/async-storage';
import { addGlucoseRecord, addActivityRecord, addSleepRecord } from './digitalTwin';

// Health Kit entegrasyon modülü
// Apple Health (iOS) ve Google Fit (Android) ile senkronizasyon

const HEALTH_SYNC_KEY = '@health_sync_enabled';
const LAST_SYNC_KEY = '@last_health_sync';

// Sağlık izinlerini kontrol et
export async function checkHealthPermissions() {
  try {
    // Platform kontrolü
    const platform = getPlatform();
    
    if (platform === 'ios') {
      // Apple Health Kit kontrolü
      return await checkAppleHealthPermissions();
    } else if (platform === 'android') {
      // Google Fit kontrolü
      return await checkGoogleFitPermissions();
    } else {
      // Web - desteklenmiyor
      return { granted: false, message: 'Web sürümünde sağlık entegrasyonu desteklenmiyor.' };
    }
  } catch (error) {
    console.error('Health permissions check error:', error);
    return { granted: false, error: error.message };
  }
}

// Sağlık izinlerini iste
export async function requestHealthPermissions() {
  try {
    const platform = getPlatform();
    
    if (platform === 'ios') {
      return await requestAppleHealthPermissions();
    } else if (platform === 'android') {
      return await requestGoogleFitPermissions();
    } else {
      return { granted: false, message: 'Bu platform desteklenmiyor.' };
    }
  } catch (error) {
    console.error('Health permissions request error:', error);
    return { granted: false, error: error.message };
  }
}

// Kan şekeri verilerini senkronize et
export async function syncGlucoseData(days = 7) {
  try {
    const platform = getPlatform();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    let glucoseData = [];
    
    if (platform === 'ios') {
      glucoseData = await fetchAppleHealthGlucose(startDate);
    } else if (platform === 'android') {
      glucoseData = await fetchGoogleFitGlucose(startDate);
    }
    
    // Verileri Dijital İkiz'e kaydet
    for (const reading of glucoseData) {
      await addGlucoseRecord({
        timestamp: reading.timestamp,
        value: reading.value,
        note: 'Health app\'ten senkronize edildi',
      });
    }
    
    await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    
    return {
      success: true,
      count: glucoseData.length,
      message: `${glucoseData.length} kan şekeri kaydı senkronize edildi.`,
    };
  } catch (error) {
    console.error('Glucose sync error:', error);
    return { success: false, error: error.message };
  }
}

// Aktivite verilerini senkronize et
export async function syncActivityData(days = 7) {
  try {
    const platform = getPlatform();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    let activityData = [];
    
    if (platform === 'ios') {
      activityData = await fetchAppleHealthActivity(startDate);
    } else if (platform === 'android') {
      activityData = await fetchGoogleFitActivity(startDate);
    }
    
    // Verileri kaydet
    for (const activity of activityData) {
      await addActivityRecord({
        timestamp: activity.timestamp,
        type: activity.type,
        duration: activity.duration,
        intensity: activity.intensity || 'orta',
      });
    }
    
    return {
      success: true,
      count: activityData.length,
      message: `${activityData.length} aktivite kaydı senkronize edildi.`,
    };
  } catch (error) {
    console.error('Activity sync error:', error);
    return { success: false, error: error.message };
  }
}

// Uyku verilerini senkronize et
export async function syncSleepData(days = 7) {
  try {
    const platform = getPlatform();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    let sleepData = [];
    
    if (platform === 'ios') {
      sleepData = await fetchAppleHealthSleep(startDate);
    } else if (platform === 'android') {
      sleepData = await fetchGoogleFitSleep(startDate);
    }
    
    // Verileri kaydet
    for (const sleep of sleepData) {
      await addSleepRecord({
        date: sleep.date,
        hours: sleep.hours,
        quality: sleep.quality || 'orta',
      });
    }
    
    return {
      success: true,
      count: sleepData.length,
      message: `${sleepData.length} uyku kaydı senkronize edildi.`,
    };
  } catch (error) {
    console.error('Sleep sync error:', error);
    return { success: false, error: error.message };
  }
}

// Kalp atışı verilerini senkronize et
export async function syncHeartRateData(days = 7) {
  try {
    const platform = getPlatform();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    let heartRateData = [];
    
    if (platform === 'ios') {
      heartRateData = await fetchAppleHealthHeartRate(startDate);
    } else if (platform === 'android') {
      heartRateData = await fetchGoogleFitHeartRate(startDate);
    }
    
    // Verileri AsyncStorage'a kaydet
    const storageKey = '@heart_rate_history';
    const existingData = await AsyncStorage.getItem(storageKey);
    const existing = existingData ? JSON.parse(existingData) : [];
    
    const merged = [...existing, ...heartRateData];
    // Son 1000 kayıt tut
    const trimmed = merged.slice(-1000);
    await AsyncStorage.setItem(storageKey, JSON.stringify(trimmed));
    
    return {
      success: true,
      count: heartRateData.length,
      message: `${heartRateData.length} kalp atışı kaydı senkronize edildi.`,
    };
  } catch (error) {
    console.error('Heart rate sync error:', error);
    return { success: false, error: error.message };
  }
}

// Adım sayısı verilerini senkronize et
export async function syncStepsData(days = 7) {
  try {
    const platform = getPlatform();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    let stepsData = [];
    
    if (platform === 'ios') {
      stepsData = await fetchAppleHealthSteps(startDate);
    } else if (platform === 'android') {
      stepsData = await fetchGoogleFitSteps(startDate);
    }
    
    // Verileri kaydet
    const storageKey = '@steps_history';
    const existingData = await AsyncStorage.getItem(storageKey);
    const existing = existingData ? JSON.parse(existingData) : [];
    
    const merged = [...existing, ...stepsData];
    const trimmed = merged.slice(-365); // Son 1 yıl
    await AsyncStorage.setItem(storageKey, JSON.stringify(trimmed));
    
    return {
      success: true,
      count: stepsData.length,
      message: `${stepsData.length} adım kaydı senkronize edildi.`,
    };
  } catch (error) {
    console.error('Steps sync error:', error);
    return { success: false, error: error.message };
  }
}

// Kalori yakımı verilerini senkronize et
export async function syncCaloriesBurnedData(days = 7) {
  try {
    const platform = getPlatform();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    let caloriesData = [];
    
    if (platform === 'ios') {
      caloriesData = await fetchAppleHealthCaloriesBurned(startDate);
    } else if (platform === 'android') {
      caloriesData = await fetchGoogleFitCaloriesBurned(startDate);
    }
    
    const storageKey = '@calories_burned_history';
    const existingData = await AsyncStorage.getItem(storageKey);
    const existing = existingData ? JSON.parse(existingData) : [];
    
    const merged = [...existing, ...caloriesData];
    const trimmed = merged.slice(-365);
    await AsyncStorage.setItem(storageKey, JSON.stringify(trimmed));
    
    return {
      success: true,
      count: caloriesData.length,
      message: `${caloriesData.length} kalori yakım kaydı senkronize edildi.`,
    };
  } catch (error) {
    console.error('Calories burned sync error:', error);
    return { success: false, error: error.message };
  }
}

// Kilo verilerini senkronize et
export async function syncWeightData(days = 90) {
  try {
    const platform = getPlatform();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    let weightData = [];
    
    if (platform === 'ios') {
      weightData = await fetchAppleHealthWeight(startDate);
    } else if (platform === 'android') {
      weightData = await fetchGoogleFitWeight(startDate);
    }
    
    const storageKey = '@weight_history';
    const existingData = await AsyncStorage.getItem(storageKey);
    const existing = existingData ? JSON.parse(existingData) : [];
    
    const merged = [...existing, ...weightData];
    const trimmed = merged.slice(-365);
    await AsyncStorage.setItem(storageKey, JSON.stringify(trimmed));
    
    return {
      success: true,
      count: weightData.length,
      message: `${weightData.length} kilo kaydı senkronize edildi.`,
    };
  } catch (error) {
    console.error('Weight sync error:', error);
    return { success: false, error: error.message };
  }
}

// Kan basıncı verilerini senkronize et
export async function syncBloodPressureData(days = 30) {
  try {
    const platform = getPlatform();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    let bpData = [];
    
    if (platform === 'ios') {
      bpData = await fetchAppleHealthBloodPressure(startDate);
    } else if (platform === 'android') {
      bpData = await fetchGoogleFitBloodPressure(startDate);
    }
    
    const storageKey = '@blood_pressure_history';
    const existingData = await AsyncStorage.getItem(storageKey);
    const existing = existingData ? JSON.parse(existingData) : [];
    
    const merged = [...existing, ...bpData];
    const trimmed = merged.slice(-500);
    await AsyncStorage.setItem(storageKey, JSON.stringify(trimmed));
    
    return {
      success: true,
      count: bpData.length,
      message: `${bpData.length} kan basıncı kaydı senkronize edildi.`,
    };
  } catch (error) {
    console.error('Blood pressure sync error:', error);
    return { success: false, error: error.message };
  }
}

// Tüm verileri otomatik senkronize et
export async function syncAllHealthData(days = 7) {
  const results = {
    glucose: { success: false, count: 0 },
    activity: { success: false, count: 0 },
    sleep: { success: false, count: 0 },
    heartRate: { success: false, count: 0 },
    steps: { success: false, count: 0 },
    caloriesBurned: { success: false, count: 0 },
    weight: { success: false, count: 0 },
    bloodPressure: { success: false, count: 0 },
  };
  
  try {
    // Paralel olarak tüm verileri senkronize et
    const [glucoseResult, activityResult, sleepResult, heartRateResult, stepsResult, caloriesResult, weightResult, bpResult] = await Promise.allSettled([
      syncGlucoseData(days),
      syncActivityData(days),
      syncSleepData(days),
      syncHeartRateData(days),
      syncStepsData(days),
      syncCaloriesBurnedData(days),
      syncWeightData(days),
      syncBloodPressureData(days),
    ]);
    
    if (glucoseResult.status === 'fulfilled') results.glucose = glucoseResult.value;
    if (activityResult.status === 'fulfilled') results.activity = activityResult.value;
    if (sleepResult.status === 'fulfilled') results.sleep = sleepResult.value;
    if (heartRateResult.status === 'fulfilled') results.heartRate = heartRateResult.value;
    if (stepsResult.status === 'fulfilled') results.steps = stepsResult.value;
    if (caloriesResult.status === 'fulfilled') results.caloriesBurned = caloriesResult.value;
    if (weightResult.status === 'fulfilled') results.weight = weightResult.value;
    if (bpResult.status === 'fulfilled') results.bloodPressure = bpResult.value;
    
    const totalCount = 
      (results.glucose.count || 0) + 
      (results.activity.count || 0) + 
      (results.sleep.count || 0) +
      (results.heartRate.count || 0) +
      (results.steps.count || 0) +
      (results.caloriesBurned.count || 0) +
      (results.weight.count || 0) +
      (results.bloodPressure.count || 0);
    
    await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
    
    return {
      success: true,
      results,
      totalCount,
      message: `Toplam ${totalCount} kayıt senkronize edildi.`,
    };
  } catch (error) {
    console.error('Full sync error:', error);
    return { success: false, error: error.message, results };
  }
}

// Son senkronizasyon zamanını getir
export async function getLastSyncTime() {
  try {
    const timestamp = await AsyncStorage.getItem(LAST_SYNC_KEY);
    return timestamp ? parseInt(timestamp) : null;
  } catch (error) {
    return null;
  }
}

// Senkronizasyon ayarını kontrol et
export async function isHealthSyncEnabled() {
  try {
    const enabled = await AsyncStorage.getItem(HEALTH_SYNC_KEY);
    return enabled === 'true';
  } catch (error) {
    return false;
  }
}

// Senkronizasyon ayarını değiştir
export async function setHealthSyncEnabled(enabled) {
  try {
    await AsyncStorage.setItem(HEALTH_SYNC_KEY, enabled.toString());
    return true;
  } catch (error) {
    console.error('Set sync enabled error:', error);
    return false;
  }
}

// Platform belirleme
function getPlatform() {
  // React Native için Platform modülü kullanılır
  // Web için 'web' döner
  if (typeof navigator !== 'undefined') {
    const userAgent = navigator.userAgent || navigator.vendor;
    if (/android/i.test(userAgent)) {
      return 'android';
    }
    if (/iPad|iPhone|iPod/.test(userAgent)) {
      return 'ios';
    }
  }
  return 'web';
}

// Apple Health Kit fonksiyonları (placeholder - gerçek implementasyon için react-native-health gerekli)
async function checkAppleHealthPermissions() {
  // Gerçek uygulamada: react-native-health veya expo-health kullanılır
  return {
    granted: false,
    message: 'Apple Health entegrasyonu için mobil uygulama gerekli.',
  };
}

async function requestAppleHealthPermissions() {
  // Placeholder - gerçek implementasyon gerekli
  return {
    granted: false,
    message: 'iOS uygulamasında aktif edilecek.',
  };
}

async function fetchAppleHealthGlucose(startDate) {
  // Placeholder - gerçek implementasyon gerekli
  return [];
}

async function fetchAppleHealthActivity(startDate) {
  // Placeholder
  return [];
}

async function fetchAppleHealthSleep(startDate) {
  // Placeholder
  return [];
}

async function fetchAppleHealthHeartRate(startDate) {
  // Placeholder - gerçek implementasyon: HKQuantityTypeIdentifierHeartRate
  return [];
}

async function fetchAppleHealthSteps(startDate) {
  // Placeholder - gerçek implementasyon: HKQuantityTypeIdentifierStepCount
  return [];
}

async function fetchAppleHealthCaloriesBurned(startDate) {
  // Placeholder - gerçek implementasyon: HKQuantityTypeIdentifierActiveEnergyBurned
  return [];
}

async function fetchAppleHealthWeight(startDate) {
  // Placeholder - gerçek implementasyon: HKQuantityTypeIdentifierBodyMass
  return [];
}

async function fetchAppleHealthBloodPressure(startDate) {
  // Placeholder - gerçek implementasyon: HKQuantityTypeIdentifierBloodPressureSystolic/Diastolic
  return [];
}

// Google Fit fonksiyonları (placeholder - gerçek implementasyon için @react-native-community/google-fit gerekli)
async function checkGoogleFitPermissions() {
  return {
    granted: false,
    message: 'Google Fit entegrasyonu için mobil uygulama gerekli.',
  };
}

async function requestGoogleFitPermissions() {
  return {
    granted: false,
    message: 'Android uygulamasında aktif edilecek.',
  };
}

async function fetchGoogleFitGlucose(startDate) {
  return [];
}

async function fetchGoogleFitActivity(startDate) {
  return [];
}

async function fetchGoogleFitSleep(startDate) {
  return [];
}

async function fetchGoogleFitHeartRate(startDate) {
  // Placeholder - gerçek implementasyon: Fitness.HEART_RATE_BPM
  return [];
}

async function fetchGoogleFitSteps(startDate) {
  // Placeholder - gerçek implementasyon: Fitness.STEP_COUNT_DELTA
  return [];
}

async function fetchGoogleFitCaloriesBurned(startDate) {
  // Placeholder - gerçek implementasyon: Fitness.CALORIES_EXPENDED
  return [];
}

async function fetchGoogleFitWeight(startDate) {
  // Placeholder - gerçek implementasyon: Fitness.WEIGHT
  return [];
}

async function fetchGoogleFitBloodPressure(startDate) {
  // Placeholder - gerçek implementasyon: Fitness.BLOOD_PRESSURE
  return [];
}

// Sağlık verilerini getir (tüm modüller için)
export async function getHealthData() {
  try {
    const [heartRate, steps, calories, weight, bp] = await Promise.all([
      AsyncStorage.getItem('@heart_rate_history'),
      AsyncStorage.getItem('@steps_history'),
      AsyncStorage.getItem('@calories_burned_history'),
      AsyncStorage.getItem('@weight_history'),
      AsyncStorage.getItem('@blood_pressure_history'),
    ]);
    
    return {
      heartRate: heartRate ? JSON.parse(heartRate) : [],
      steps: steps ? JSON.parse(steps) : [],
      caloriesBurned: calories ? JSON.parse(calories) : [],
      weight: weight ? JSON.parse(weight) : [],
      bloodPressure: bp ? JSON.parse(bp) : [],
    };
  } catch (error) {
    console.error('Get health data error:', error);
    return {
      heartRate: [],
      steps: [],
      caloriesBurned: [],
      weight: [],
      bloodPressure: [],
    };
  }
}

// Bugünün sağlık özetini getir
export async function getTodayHealthSummary() {
  try {
    const healthData = await getHealthData();
    const today = new Date().toDateString();
    
    // Bugünün verilerini filtrele
    const todayHeartRate = healthData.heartRate.filter(hr => 
      new Date(hr.timestamp).toDateString() === today
    );
    const todaySteps = healthData.steps.filter(s => 
      new Date(s.date).toDateString() === today
    );
    const todayCalories = healthData.caloriesBurned.filter(c => 
      new Date(c.date).toDateString() === today
    );
    
    // Ortalamalar ve toplamlar
    const avgHeartRate = todayHeartRate.length > 0 
      ? Math.round(todayHeartRate.reduce((sum, hr) => sum + hr.value, 0) / todayHeartRate.length)
      : null;
    
    const totalSteps = todaySteps.reduce((sum, s) => sum + s.count, 0);
    const totalCalories = todayCalories.reduce((sum, c) => sum + c.calories, 0);
    
    // En son kilo
    const latestWeight = healthData.weight.length > 0 
      ? healthData.weight[healthData.weight.length - 1].value 
      : null;
    
    // En son kan basıncı
    const latestBP = healthData.bloodPressure.length > 0
      ? healthData.bloodPressure[healthData.bloodPressure.length - 1]
      : null;
    
    return {
      avgHeartRate,
      totalSteps,
      totalCalories: Math.round(totalCalories),
      latestWeight,
      latestBP,
      hasData: todayHeartRate.length > 0 || todaySteps.length > 0 || todayCalories.length > 0,
    };
  } catch (error) {
    console.error('Get today summary error:', error);
    return {
      avgHeartRate: null,
      totalSteps: 0,
      totalCalories: 0,
      latestWeight: null,
      latestBP: null,
      hasData: false,
    };
  }
}

// Manuel veri gönderme (Dijital İkiz'den Health App'e)
export async function exportToHealthApp(data) {
  try {
    const platform = getPlatform();
    
    if (platform === 'ios') {
      return await exportToAppleHealth(data);
    } else if (platform === 'android') {
      return await exportToGoogleFit(data);
    }
    
    return { success: false, message: 'Platform desteklenmiyor.' };
  } catch (error) {
    console.error('Export to health app error:', error);
    return { success: false, error: error.message };
  }
}

async function exportToAppleHealth(data) {
  // Placeholder
  return { success: false, message: 'iOS uygulamasında aktif edilecek.' };
}

async function exportToGoogleFit(data) {
  // Placeholder
  return { success: false, message: 'Android uygulamasında aktif edilecek.' };
}
