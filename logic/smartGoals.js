import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTodayHealthSummary, getHealthData } from './healthSync';
import { getTwinData } from './digitalTwin';

// Akıllı Hedef Sistemi - Kullanıcının gerçek verilerine göre dinamik hedefler

const GOALS_KEY = '@smart_goals';
const ACHIEVEMENTS_KEY = '@achievements';

// Rozet tanımları
const BADGES = {
  STREAK_3: { id: 'streak_3', name: '🔥 3 Günlük Seri', description: '3 gün üst üste hedeflere ulaştın' },
  STREAK_7: { id: 'streak_7', name: '⭐ 1 Haftalık Seri', description: '7 gün üst üste hedeflere ulaştın' },
  STREAK_30: { id: 'streak_30', name: '👑 1 Aylık Seri', description: '30 gün üst üste hedeflere ulaştın' },
  WALKER_5K: { id: 'walker_5k', name: '👟 5K Yürüyücü', description: '5,000 adım attın' },
  WALKER_10K: { id: 'walker_10k', name: '🏃 10K Koşucu', description: '10,000 adım attın' },
  WALKER_15K: { id: 'walker_15k', name: '🚀 15K Atleti', description: '15,000 adım attın' },
  GLUCOSE_STABLE: { id: 'glucose_stable', name: '🎯 Şeker Dengesi', description: '7 gün kan şekeri hedef aralıkta' },
  EARLY_BIRD: { id: 'early_bird', name: '🌅 Erken Kuş', description: 'Sabah 7\'den önce 1000 adım attın' },
  NIGHT_OWL: { id: 'night_owl', name: '🦉 Gece Baykuşu', description: 'Gece 10\'dan sonra aktiviteyi tamamladın' },
  HEART_HEALTHY: { id: 'heart_healthy', name: '❤️ Kalp Sağlığı', description: '7 gün kalp atışı ideal aralıkta' },
  CALORIE_BURNER: { id: 'calorie_burner', name: '🔥 Kalori Yakıcı', description: '500+ kalori yaktın' },
  PERFECT_WEEK: { id: 'perfect_week', name: '💯 Mükemmel Hafta', description: 'Tüm hedeflere 7 gün üst üste ulaştın' },
};

// Kullanıcı kişiliği tipleri
const PERSONALITY_TYPES = {
  MORNING_WARRIOR: { name: '🌅 Sabah Savaşçısı', description: 'Sabahları en aktifsin!' },
  EVENING_ATHLETE: { name: '🌆 Akşam Atleti', description: 'Akşamları zirvedesin!' },
  STEADY_PACER: { name: '🎯 Sabit Tempo', description: 'Gün boyunca dengeli aktivite' },
  WEEKEND_WARRIOR: { name: '🎉 Hafta Sonu Kahramanı', description: 'Hafta sonları patlamaya hazır!' },
  NIGHT_RANGER: { name: '🌙 Gece Gezgini', description: 'Gece aktivitesi seni tanımlıyor' },
};

// Günlük hedefleri hesapla (kişiselleştirilmiş)
export async function calculateDailyGoals() {
  try {
    const [healthSummary, healthData, twinData] = await Promise.all([
      getTodayHealthSummary(),
      getHealthData(),
      getTwinData(),
    ]);

    // Son 30 günün ortalamasına göre hedef belirle
    const last30Days = getLast30DaysData(healthData);
    
    const avgSteps = calculateAverage(last30Days.steps.map(s => s.count));
    const avgCalories = calculateAverage(last30Days.caloriesBurned.map(c => c.calories));
    const avgHeartRate = calculateAverage(last30Days.heartRate.map(hr => hr.value));

    // Hedefleri kullanıcının gerçek verilerine göre %10-20 artır
    const goals = {
      steps: Math.max(8000, Math.round((avgSteps || 5000) * 1.15)), // %15 artış
      calories: Math.max(300, Math.round((avgCalories || 200) * 1.2)), // %20 artış
      heartRateMax: Math.min(100, Math.round((avgHeartRate || 75) + 10)), // +10 bpm max
      heartRateMin: Math.max(55, Math.round((avgHeartRate || 70) - 15)), // -15 bpm min
      glucoseMin: 70,
      glucoseMax: 140,
      sleepHours: 7,
      waterGlasses: 8,
    };

    // Hedefleri kaydet
    await AsyncStorage.setItem(GOALS_KEY, JSON.stringify({
      date: new Date().toDateString(),
      goals,
      progress: {
        steps: healthSummary.totalSteps || 0,
        calories: healthSummary.totalCalories || 0,
        avgHeartRate: healthSummary.avgHeartRate || 0,
      },
    }));

    return goals;
  } catch (error) {
    console.error('Calculate daily goals error:', error);
    // Varsayılan hedefler
    return {
      steps: 8000,
      calories: 300,
      heartRateMax: 100,
      heartRateMin: 60,
      glucoseMin: 70,
      glucoseMax: 140,
      sleepHours: 7,
      waterGlasses: 8,
    };
  }
}

// Bugünkü hedef ilerlemesini getir
export async function getTodayGoalProgress() {
  try {
    const [goalsData, healthSummary, twinData] = await Promise.all([
      AsyncStorage.getItem(GOALS_KEY),
      getTodayHealthSummary(),
      getTwinData(),
    ]);

    const goals = goalsData ? JSON.parse(goalsData).goals : await calculateDailyGoals();

    // Kan şekeri verileri
    const todayGlucose = twinData.glucoseHistory.filter(g => {
      const date = new Date(g.timestamp);
      return date.toDateString() === new Date().toDateString();
    });

    const glucoseInRange = todayGlucose.filter(g => 
      g.value >= goals.glucoseMin && g.value <= goals.glucoseMax
    ).length;

    const progress = {
      steps: {
        current: healthSummary.totalSteps || 0,
        target: goals.steps,
        percentage: Math.min(100, Math.round(((healthSummary.totalSteps || 0) / goals.steps) * 100)),
        achieved: (healthSummary.totalSteps || 0) >= goals.steps,
      },
      calories: {
        current: healthSummary.totalCalories || 0,
        target: goals.calories,
        percentage: Math.min(100, Math.round(((healthSummary.totalCalories || 0) / goals.calories) * 100)),
        achieved: (healthSummary.totalCalories || 0) >= goals.calories,
      },
      heartRate: {
        current: healthSummary.avgHeartRate || 0,
        targetMin: goals.heartRateMin,
        targetMax: goals.heartRateMax,
        inRange: healthSummary.avgHeartRate ? 
          (healthSummary.avgHeartRate >= goals.heartRateMin && healthSummary.avgHeartRate <= goals.heartRateMax) : false,
        achieved: healthSummary.avgHeartRate ? 
          (healthSummary.avgHeartRate >= goals.heartRateMin && healthSummary.avgHeartRate <= goals.heartRateMax) : false,
      },
      glucose: {
        inRangeCount: glucoseInRange,
        totalCount: todayGlucose.length,
        percentage: todayGlucose.length > 0 ? Math.round((glucoseInRange / todayGlucose.length) * 100) : 0,
        achieved: todayGlucose.length > 0 ? (glucoseInRange / todayGlucose.length) >= 0.7 : false, // %70 hedef aralıkta
      },
    };

    // Genel başarı skoru
    const achievedCount = [
      progress.steps.achieved,
      progress.calories.achieved,
      progress.heartRate.achieved,
      progress.glucose.achieved,
    ].filter(Boolean).length;

    const overallScore = Math.round((achievedCount / 4) * 100);

    return {
      ...progress,
      overallScore,
      totalAchieved: achievedCount,
      totalGoals: 4,
    };
  } catch (error) {
    console.error('Get today goal progress error:', error);
    return null;
  }
}

// Rozet kontrolü ve kazanma
export async function checkAndAwardBadges() {
  try {
    const [achievementsData, progress, healthData] = await Promise.all([
      AsyncStorage.getItem(ACHIEVEMENTS_KEY),
      getTodayGoalProgress(),
      getHealthData(),
    ]);

    const achievements = achievementsData ? JSON.parse(achievementsData) : {
      badges: [],
      streak: 0,
      lastAchievement: null,
    };

    const newBadges = [];

    // Adım rozetleri
    if (progress.steps.current >= 15000 && !achievements.badges.includes('walker_15k')) {
      newBadges.push(BADGES.WALKER_15K);
    } else if (progress.steps.current >= 10000 && !achievements.badges.includes('walker_10k')) {
      newBadges.push(BADGES.WALKER_10K);
    } else if (progress.steps.current >= 5000 && !achievements.badges.includes('walker_5k')) {
      newBadges.push(BADGES.WALKER_5K);
    }

    // Kalori yakma rozeti
    if (progress.calories.current >= 500 && !achievements.badges.includes('calorie_burner')) {
      newBadges.push(BADGES.CALORIE_BURNER);
    }

    // Seri rozetleri (günlük başarı)
    if (progress.overallScore >= 75) {
      achievements.streak += 1;
      
      if (achievements.streak >= 30 && !achievements.badges.includes('streak_30')) {
        newBadges.push(BADGES.STREAK_30);
      } else if (achievements.streak >= 7 && !achievements.badges.includes('streak_7')) {
        newBadges.push(BADGES.STREAK_7);
      } else if (achievements.streak >= 3 && !achievements.badges.includes('streak_3')) {
        newBadges.push(BADGES.STREAK_3);
      }
    } else {
      achievements.streak = 0; // Seri kırıldı
    }

    // Yeni rozetleri ekle
    newBadges.forEach(badge => {
      if (!achievements.badges.includes(badge.id)) {
        achievements.badges.push(badge.id);
      }
    });

    // Kaydet
    achievements.lastAchievement = Date.now();
    await AsyncStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));

    return {
      newBadges,
      totalBadges: achievements.badges.length,
      streak: achievements.streak,
      allBadges: achievements.badges.map(id => Object.values(BADGES).find(b => b.id === id)),
    };
  } catch (error) {
    console.error('Check and award badges error:', error);
    return { newBadges: [], totalBadges: 0, streak: 0, allBadges: [] };
  }
}

// Kullanıcı kişilik analizi
export async function analyzePersonality() {
  try {
    const healthData = await getHealthData();
    
    const morningSteps = healthData.steps.filter(s => {
      const hour = new Date(s.timestamp).getHours();
      return hour >= 6 && hour < 12;
    });
    
    const eveningSteps = healthData.steps.filter(s => {
      const hour = new Date(s.timestamp).getHours();
      return hour >= 18 && hour < 24;
    });
    
    const nightSteps = healthData.steps.filter(s => {
      const hour = new Date(s.timestamp).getHours();
      return hour >= 0 && hour < 6;
    });

    const morningTotal = morningSteps.reduce((sum, s) => sum + s.count, 0);
    const eveningTotal = eveningSteps.reduce((sum, s) => sum + s.count, 0);
    const nightTotal = nightSteps.reduce((sum, s) => sum + s.count, 0);

    // En yüksek aktivite zamanına göre kişilik
    if (morningTotal > eveningTotal && morningTotal > nightTotal) {
      return PERSONALITY_TYPES.MORNING_WARRIOR;
    } else if (eveningTotal > morningTotal && eveningTotal > nightTotal) {
      return PERSONALITY_TYPES.EVENING_ATHLETE;
    } else if (nightTotal > morningTotal) {
      return PERSONALITY_TYPES.NIGHT_RANGER;
    } else {
      return PERSONALITY_TYPES.STEADY_PACER;
    }
  } catch (error) {
    console.error('Analyze personality error:', error);
    return PERSONALITY_TYPES.STEADY_PACER;
  }
}

// Akıllı bildirim oluştur
export async function generateSmartNotification() {
  try {
    const [progress, healthSummary] = await Promise.all([
      getTodayGoalProgress(),
      getTodayHealthSummary(),
    ]);

    const notifications = [];

    // Adım uyarısı
    if (progress.steps.percentage < 50) {
      const remaining = progress.steps.target - progress.steps.current;
      notifications.push({
        type: 'warning',
        icon: '👟',
        title: 'Adım Hedefi',
        message: `Bugün daha ${remaining} adım atmalısın! 10 dakikalık yürüyüş ~1000 adım`,
      });
    } else if (progress.steps.percentage >= 100) {
      notifications.push({
        type: 'success',
        icon: '🎉',
        title: 'Adım Hedefi Tamamlandı!',
        message: `${progress.steps.current} adım attın! Harika gidiyorsun!`,
      });
    }

    // Kalp atışı uyarısı
    if (healthSummary.avgHeartRate && healthSummary.avgHeartRate > 90) {
      notifications.push({
        type: 'alert',
        icon: '💓',
        title: 'Kalp Atışı Yüksek',
        message: `Kalp atışın ${healthSummary.avgHeartRate} bpm. Stresli misin? Derin nefes al ve dinlen.`,
      });
    }

    // Kalori dengesi
    if (progress.calories.achieved) {
      notifications.push({
        type: 'success',
        icon: '🔥',
        title: 'Kalori Hedefi Tamamlandı!',
        message: `${progress.calories.current} kalori yaktın! Süpersin!`,
      });
    }

    return notifications;
  } catch (error) {
    console.error('Generate smart notification error:', error);
    return [];
  }
}

// Yardımcı fonksiyonlar
function getLast30DaysData(healthData) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return {
    steps: healthData.steps.filter(s => new Date(s.date) >= thirtyDaysAgo),
    caloriesBurned: healthData.caloriesBurned.filter(c => new Date(c.date) >= thirtyDaysAgo),
    heartRate: healthData.heartRate.filter(hr => new Date(hr.timestamp) >= thirtyDaysAgo),
  };
}

function calculateAverage(arr) {
  if (arr.length === 0) return 0;
  return arr.reduce((sum, val) => sum + val, 0) / arr.length;
}

// Tüm başarıları getir
export async function getAllAchievements() {
  try {
    const achievementsData = await AsyncStorage.getItem(ACHIEVEMENTS_KEY);
    const achievements = achievementsData ? JSON.parse(achievementsData) : {
      badges: [],
      streak: 0,
      lastAchievement: null,
    };

    return {
      ...achievements,
      allBadges: achievements.badges.map(id => Object.values(BADGES).find(b => b.id === id)).filter(Boolean),
      availableBadges: Object.values(BADGES),
    };
  } catch (error) {
    console.error('Get all achievements error:', error);
    return { badges: [], streak: 0, allBadges: [], availableBadges: Object.values(BADGES) };
  }
}
