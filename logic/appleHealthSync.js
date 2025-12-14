import AppleHealthKit from 'react-native-health';
import { Platform } from 'react-native';

// Apple Health izinleri
const permissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.StepCount,
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.Permissions.Water,
      AppleHealthKit.Constants.Permissions.BloodGlucose,
      AppleHealthKit.Constants.Permissions.BodyMass,
      AppleHealthKit.Constants.Permissions.Height,
      AppleHealthKit.Constants.Permissions.BodyMassIndex,
    ],
    write: [
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.StepCount,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.Water,
      AppleHealthKit.Constants.Permissions.BloodGlucose,
      AppleHealthKit.Constants.Permissions.BodyMass,
    ],
  },
};

/**
 * Apple Health'i başlat ve izinleri iste
 */
export const initAppleHealth = () => {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== 'ios') {
      reject('Apple Health is only available on iOS');
      return;
    }

    AppleHealthKit.initHealthKit(permissions, (error) => {
      if (error) {
        console.log('[ERROR] Cannot initialize Apple Health:', error);
        reject(error);
      } else {
        console.log('Apple Health initialized successfully');
        resolve(true);
      }
    });
  });
};

/**
 * Günlük adım sayısını getir
 */
export const getTodaySteps = () => {
  return new Promise((resolve, reject) => {
    const options = {
      date: new Date().toISOString(),
      includeManuallyAdded: true,
    };

    AppleHealthKit.getStepCount(options, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results.value || 0);
      }
    });
  });
};

/**
 * Kalp atış hızını getir
 */
export const getHeartRate = () => {
  return new Promise((resolve, reject) => {
    const options = {
      unit: 'bpm',
      startDate: new Date(Date.now() - 3600000).toISOString(), // Son 1 saat
      endDate: new Date().toISOString(),
      ascending: false,
      limit: 1,
    };

    AppleHealthKit.getHeartRateSamples(options, (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results && results.length > 0) {
          resolve(Math.round(results[0].value));
        } else {
          resolve(null);
        }
      }
    });
  });
};

/**
 * Günlük yakılan kalorileri getir
 */
export const getActiveCalories = () => {
  return new Promise((resolve, reject) => {
    const options = {
      date: new Date().toISOString(),
    };

    AppleHealthKit.getActiveEnergyBurned(options, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(Math.round(results.value || 0));
      }
    });
  });
};

/**
 * Uyku verilerini getir
 */
export const getSleepData = () => {
  return new Promise((resolve, reject) => {
    const options = {
      startDate: new Date(Date.now() - 86400000).toISOString(), // Son 24 saat
      endDate: new Date().toISOString(),
    };

    AppleHealthKit.getSleepSamples(options, (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results && results.length > 0) {
          // Toplam uyku süresini hesapla
          let totalMinutes = 0;
          results.forEach(sample => {
            const start = new Date(sample.startDate);
            const end = new Date(sample.endDate);
            totalMinutes += (end - start) / (1000 * 60);
          });

          const hours = Math.floor(totalMinutes / 60);
          const minutes = Math.round(totalMinutes % 60);
          resolve({ hours, minutes, formatted: `${hours}sa ${minutes}dk` });
        } else {
          resolve({ hours: 0, minutes: 0, formatted: '0sa 0dk' });
        }
      }
    });
  });
};

/**
 * Kan şekeri verilerini getir
 */
export const getBloodGlucose = () => {
  return new Promise((resolve, reject) => {
    const options = {
      unit: 'mmolPerL', // veya 'mgPerdL'
      startDate: new Date(Date.now() - 86400000).toISOString(), // Son 24 saat
      endDate: new Date().toISOString(),
      ascending: false,
      limit: 10,
    };

    AppleHealthKit.getBloodGlucoseSamples(options, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results || []);
      }
    });
  });
};

/**
 * Kan şekeri kaydet
 */
export const saveBloodGlucose = (value, unit = 'mgPerdL') => {
  return new Promise((resolve, reject) => {
    const options = {
      value: value,
      unit: unit,
      date: new Date().toISOString(),
    };

    AppleHealthKit.saveBloodGlucoseSample(options, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

/**
 * Su tüketimi kaydet
 */
export const saveWaterIntake = (milliliters) => {
  return new Promise((resolve, reject) => {
    const options = {
      value: milliliters,
      date: new Date().toISOString(),
    };

    AppleHealthKit.saveWater(options, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

/**
 * Günlük su tüketimini getir
 */
export const getWaterIntake = () => {
  return new Promise((resolve, reject) => {
    const options = {
      startDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
      endDate: new Date().toISOString(),
    };

    AppleHealthKit.getWaterSamples(options, (err, results) => {
      if (err) {
        reject(err);
      } else {
        if (results && results.length > 0) {
          const totalML = results.reduce((sum, sample) => sum + sample.value, 0);
          const glasses = Math.round(totalML / 250); // 1 bardak = 250ml
          resolve({ milliliters: totalML, glasses });
        } else {
          resolve({ milliliters: 0, glasses: 0 });
        }
      }
    });
  });
};

/**
 * Tüm sağlık verilerini senkronize et
 */
export const syncAllHealthData = async () => {
  try {
    const [steps, heartRate, calories, sleep, water, glucose] = await Promise.all([
      getTodaySteps().catch(() => 0),
      getHeartRate().catch(() => null),
      getActiveCalories().catch(() => 0),
      getSleepData().catch(() => ({ hours: 0, minutes: 0, formatted: '0sa 0dk' })),
      getWaterIntake().catch(() => ({ milliliters: 0, glasses: 0 })),
      getBloodGlucose().catch(() => []),
    ]);

    return {
      steps,
      heartRate: heartRate || 72, // Varsayılan değer
      calories,
      sleep,
      water,
      glucose,
      lastSync: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error syncing health data:', error);
    throw error;
  }
};

export default {
  initAppleHealth,
  getTodaySteps,
  getHeartRate,
  getActiveCalories,
  getSleepData,
  getBloodGlucose,
  saveBloodGlucose,
  saveWaterIntake,
  getWaterIntake,
  syncAllHealthData,
};
