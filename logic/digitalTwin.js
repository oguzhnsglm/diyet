import AsyncStorage from '@react-native-async-storage/async-storage';

// Dijital İkiz için veri yapıları (JavaScript)
// MealRecord: { id, timestamp, foodName, carbs, calories, portion, photoUri?, glucoseImpactScore? }
// ActivityRecord: { id, timestamp, type, duration, intensity }
// GlucoseRecord: { id, timestamp, value, note?, beforeMeal?, afterMeal?, relatedMealId?, relatedActivityId? }
// SleepRecord: { id, date, hours, quality }
// StressRecord: { id, timestamp, level, trigger?, note? }
// MedicationRecord: { id, timestamp, type, dosage }

// Dijital İkiz başlangıç verisi
const initialTwinData = {
  meals: [],
  activities: [],
  glucose: [],
  sleep: [],
  stress: [],
  medications: [],
};

// Storage anahtarları
const STORAGE_KEYS = {
  TWIN_DATA: '@digital_twin_data',
  USER_PATTERNS: '@user_patterns',
  PREDICTIONS_CACHE: '@predictions_cache',
};

// Dijital İkiz başlatma
export async function initializeDigitalTwin() {
  try {
    const existingData = await AsyncStorage.getItem(STORAGE_KEYS.TWIN_DATA);
    if (!existingData) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.TWIN_DATA,
        JSON.stringify(initialTwinData)
      );
    }
  } catch (error) {
    console.error('Dijital İkiz başlatılamadı:', error);
  }
}

// Tüm veriyi getir
export async function getTwinData() {
  try {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.TWIN_DATA);
    return data ? JSON.parse(data) : initialTwinData;
  } catch (error) {
    console.error('Dijital İkiz verisi alınamadı:', error);
    return initialTwinData;
  }
}

// Veriyi güncelle
async function saveTwinData(data) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TWIN_DATA, JSON.stringify(data));
  } catch (error) {
    console.error('Dijital İkiz verisi kaydedilemedi:', error);
  }
}

// Yemek kaydı ekle
export async function addMealRecord(meal) {
  const data = await getTwinData();
  const newMeal = {
    ...meal,
    id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  data.meals.push(newMeal);
  await saveTwinData(data);
}

// Aktivite kaydı ekle
export async function addActivityRecord(activity) {
  const data = await getTwinData();
  const newActivity = {
    ...activity,
    id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  data.activities.push(newActivity);
  await saveTwinData(data);
}

// Kan şekeri kaydı ekle
export async function addGlucoseRecord(glucose) {
  const data = await getTwinData();
  const newGlucose = {
    ...glucose,
    id: `glucose_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  data.glucose.push(newGlucose);
  await saveTwinData(data);
}

// Uyku kaydı ekle
export async function addSleepRecord(sleep) {
  const data = await getTwinData();
  const newSleep = {
    ...sleep,
    id: `sleep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  data.sleep.push(newSleep);
  await saveTwinData(data);
}

// Stres kaydı ekle
export async function addStressRecord(stress) {
  const data = await getTwinData();
  const newStress = {
    ...stress,
    id: `stress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  data.stress.push(newStress);
  await saveTwinData(data);
}

// Yemek sonrası kan şekeri tahmini
export async function predictBloodSugarAfterMeal(
  mealCarbs: number,
  currentGlucose: number
) {
  const data = await getTwinData();
  
  // Geçmiş benzer yemek kayıtlarını bul
  const similarMeals = data.meals.filter(
    (meal) => Math.abs(meal.carbs - mealCarbs) < 20
  );

  if (similarMeals.length === 0) {
    // Yeterli veri yok, genel tahmin
    const estimatedIncrease = mealCarbs * 3; // Basit model: her gram karb ~3 mg/dL artış
    return {
      prediction: Math.round(currentGlucose + estimatedIncrease),
      confidence: 'Düşük (yeterli geçmiş veri yok)',
      advice: 'Bu yemeği ilk kez kaydediyorsun, 2 saat sonra ölçüm yapmayı unutma.',
    };
  }

  // Benzer yemeklerden sonraki şeker değişimlerini analiz et
  let totalIncrease = 0;
  let count = 0;

  for (const meal of similarMeals) {
    const relatedGlucose = data.glucose.filter(
      (g) => g.relatedMealId === meal.id && g.timestamp > meal.timestamp
    );
    if (relatedGlucose.length > 0) {
      const beforeMealGlucose = data.glucose.find(
        (g) => g.timestamp <= meal.timestamp && Math.abs(g.timestamp - meal.timestamp) < 600000
      );
      if (beforeMealGlucose) {
        const increase = relatedGlucose[0].value - beforeMealGlucose.value;
        totalIncrease += increase;
        count++;
      }
    }
  }

  if (count === 0) {
    const estimatedIncrease = mealCarbs * 3;
    return {
      prediction: Math.round(currentGlucose + estimatedIncrease),
      confidence: 'Orta',
      advice: 'Benzer yemekler kayıtlı ama ölçüm eksik, daha fazla veri toplayalım.',
    };
  }

  const avgIncrease = totalIncrease / count;
  const prediction = Math.round(currentGlucose + avgIncrease);

  let advice = '';
  if (prediction > 180) {
    advice = 'Tahmine göre şeker yükselebilir, porsiyonu azaltmayı veya yürüyüş yapmayı düşün.';
  } else if (prediction > 140) {
    advice = 'Orta seviye bir artış bekleniyor, 2 saat sonra kontrol et.';
  } else {
    advice = 'Bu yemek senin için iyi görünüyor, geçmişte dengeli tepki vermişsin.';
  }

  return {
    prediction,
    confidence: count >= 3 ? 'Yüksek' : 'Orta',
    advice,
  };
}

// Aktivite sonrası kan şekeri tahmini
export async function predictBloodSugarAfterActivity(
  activityType: string,
  duration: number,
  intensity: 'düşük' | 'orta' | 'yüksek',
  currentGlucose: number
) {
  const data = await getTwinData();

  // Benzer aktiviteleri bul
  const similarActivities = data.activities.filter(
    (act) => act.type === activityType && act.intensity === intensity
  );

  if (similarActivities.length === 0) {
    // Genel tahmin
    let estimatedDecrease = 0;
    if (intensity === 'düşük') estimatedDecrease = duration * 0.5;
    else if (intensity === 'orta') estimatedDecrease = duration * 1;
    else estimatedDecrease = duration * 1.5;

    return {
      prediction: Math.round(currentGlucose - estimatedDecrease),
      confidence: 'Düşük',
      advice: 'Bu aktiviteyi ilk kez kaydediyorsun, sonrasında ölçüm yapmayı unutma.',
    };
  }

  // Benzer aktivitelerden sonraki şeker değişimlerini analiz et
  let totalChange = 0;
  let count = 0;

  for (const activity of similarActivities) {
    const afterGlucose = data.glucose.find(
      (g) => g.relatedActivityId === activity.id && g.timestamp > activity.timestamp
    );
    const beforeGlucose = data.glucose.find(
      (g) => g.timestamp <= activity.timestamp && Math.abs(g.timestamp - activity.timestamp) < 600000
    );

    if (afterGlucose && beforeGlucose) {
      const change = afterGlucose.value - beforeGlucose.value;
      totalChange += change;
      count++;
    }
  }

  if (count === 0) {
    let estimatedDecrease = duration * (intensity === 'düşük' ? 0.5 : intensity === 'orta' ? 1 : 1.5);
    return {
      prediction: Math.round(currentGlucose - estimatedDecrease),
      confidence: 'Orta',
      advice: 'Benzer aktiviteler var ama ölçüm eksik.',
    };
  }

  const avgChange = totalChange / count;
  const prediction = Math.round(currentGlucose + avgChange);

  let advice = '';
  if (prediction < 70) {
    advice = '⚠️ Hipoglisemi riski! Yanında hızlı şeker bulundur, aktivite öncesi atıştır.';
  } else if (prediction < 90) {
    advice = 'Şeker biraz düşebilir, aktivite sonrası kontrol et ve gerekirse hafif atıştır.';
  } else {
    advice = 'Bu aktivite senin için güvenli görünüyor, devam et!';
  }

  return {
    prediction,
    confidence: count >= 3 ? 'Yüksek' : 'Orta',
    advice,
  };
}

// Kişiselleştirilmiş içgörüler
export async function getPersonalizedInsights() {
  const data = await getTwinData();
  const insights: string[] = [];

  // Son 30 günün verisini analiz et
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recentGlucose = data.glucose.filter((g) => g.timestamp > thirtyDaysAgo);
  const recentMeals = data.meals.filter((m) => m.timestamp > thirtyDaysAgo);
  const recentSleep = data.sleep.filter((s) => new Date(s.date).getTime() > thirtyDaysAgo);
  const recentStress = data.stress.filter((s) => s.timestamp > thirtyDaysAgo);

  // 1. Ölçüm düzenliliği
  if (recentGlucose.length >= 30) {
    insights.push(`✅ Harika! Son 30 günde ${recentGlucose.length} ölçüm yaptın, düzenli takip ediyorsun.`);
  } else if (recentGlucose.length < 10) {
    insights.push(`📊 Son 30 günde sadece ${recentGlucose.length} ölçüm var, daha düzenli ölçüm yapmayı dene.`);
  }

  // 2. Ortalama kan şekeri
  if (recentGlucose.length > 0) {
    const avgGlucose = recentGlucose.reduce((sum, g) => sum + g.value, 0) / recentGlucose.length;
    if (avgGlucose > 140) {
      insights.push(`⚠️ Ortalama kan şekerin ${Math.round(avgGlucose)} mg/dL, hedef aralığına inmek için doktorunla görüş.`);
    } else if (avgGlucose >= 100 && avgGlucose <= 130) {
      insights.push(`🎯 Ortalama kan şekerin ${Math.round(avgGlucose)} mg/dL, mükemmel kontrol!`);
    }
  }

  // 3. Uyku kalitesi etkisi
  if (recentSleep.length >= 7) {
    const goodSleepDays = recentSleep.filter((s) => s.quality === 'iyi' || s.quality === 'mükemmel');
    const goodSleepGlucose: number[] = [];
    const badSleepGlucose: number[] = [];

    recentSleep.forEach((sleep) => {
      const sleepDate = new Date(sleep.date);
      const nextDayGlucose = recentGlucose.filter((g) => {
        const gDate = new Date(g.timestamp);
        return gDate.toDateString() === sleepDate.toDateString();
      });

      if (nextDayGlucose.length > 0) {
        const avg = nextDayGlucose.reduce((sum, g) => sum + g.value, 0) / nextDayGlucose.length;
        if (sleep.quality === 'iyi' || sleep.quality === 'mükemmel') {
          goodSleepGlucose.push(avg);
        } else {
          badSleepGlucose.push(avg);
        }
      }
    });

    if (goodSleepGlucose.length > 0 && badSleepGlucose.length > 0) {
      const goodAvg = goodSleepGlucose.reduce((a, b) => a + b, 0) / goodSleepGlucose.length;
      const badAvg = badSleepGlucose.reduce((a, b) => a + b, 0) / badSleepGlucose.length;
      const diff = Math.abs(goodAvg - badAvg);

      if (diff > 15) {
        insights.push(
          `💤 İyi uyuduğun günlerde şekerin ortalama ${Math.round(diff)} mg/dL daha stabil! Uyku çok önemli.`
        );
      }
    }
  }

  // 4. Stres etkisi
  if (recentStress.length >= 5) {
    const highStressDays = recentStress.filter((s) => s.level >= 7);
    if (highStressDays.length > 0) {
      insights.push(`🧘 Son dönemde ${highStressDays.length} yüksek stres kaydın var. Stres kan şekerini etkiliyor, nefes egzersizi dene.`);
    }
  }

  // 5. En iyi performans günü
  if (recentGlucose.length >= 7) {
    const dailyAverages: { [date: string]: number[] } = {};
    recentGlucose.forEach((g) => {
      const date = new Date(g.timestamp).toDateString();
      if (!dailyAverages[date]) dailyAverages[date] = [];
      dailyAverages[date].push(g.value);
    });

    let bestDay = '';
    let lowestVariance = Infinity;

    Object.entries(dailyAverages).forEach(([date, values]) => {
      if (values.length >= 3) {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
        if (variance < lowestVariance) {
          lowestVariance = variance;
          bestDay = date;
        }
      }
    });

    if (bestDay) {
      insights.push(`🌟 En stabil günün: ${new Date(bestDay).toLocaleDateString('tr-TR')} - O gün ne yaptığını hatırla!`);
    }
  }

  if (insights.length === 0) {
    insights.push('📈 Daha fazla veri topladıkça sana özel içgörüler göreceğiz. Devam et!');
  }

  return insights;
}

// Yemek arşivi - benzer yemekleri getir
export async function getSimilarMealsFromHistory(foodName) {
  const data = await getTwinData();
  
  const similarMeals = data.meals.filter((meal) =>
    meal.foodName.toLowerCase().includes(foodName.toLowerCase()) ||
    foodName.toLowerCase().includes(meal.foodName.toLowerCase())
  );

  // Her yemek için ortalama glikoz etkisini hesapla
  const mealsWithImpact = await Promise.all(
    similarMeals.map(async (meal) => {
      const relatedGlucose = data.glucose.filter(
        (g) => g.relatedMealId === meal.id && g.timestamp > meal.timestamp
      );

      if (relatedGlucose.length > 0) {
        const beforeGlucose = data.glucose.find(
          (g) => g.timestamp <= meal.timestamp && Math.abs(g.timestamp - meal.timestamp) < 600000
        );
        if (beforeGlucose) {
          const impact = relatedGlucose[0].value - beforeGlucose.value;
          return { ...meal, avgGlucoseImpact: impact };
        }
      }

      return { ...meal, avgGlucoseImpact: undefined };
    })
  );

  return mealsWithImpact.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
}
