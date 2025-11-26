type Meal = {
  date: string; // YYYY-MM-DD
  calories: number;
  sugarGrams: number;
  gi?: number; // yiyeceğin ortalama GI'ı
};

type SugarEntry = {
  date: string; // YYYY-MM-DD
  fasting?: number; // açlık
  postMeal?: number; // tokluk
};

type DaySummary = {
  status: 'healthy' | 'warning' | 'unhealthy';
  calories?: number;
  sugar?: number;
  avgGI?: number;
  fasting?: number;
  postMeal?: number;
};

export function buildDiabetesSummaries(
  meals: Meal[],
  sugarEntries: SugarEntry[],
  { calorieLimit = 2000, sugarLimit = 50 }: { calorieLimit?: number; sugarLimit?: number } = {}
): Record<string, DaySummary> {
  const map: Record<string, DaySummary> = {};

  meals.forEach(m => {
    if (!map[m.date]) {
      map[m.date] = { status: 'healthy', calories: 0, sugar: 0, avgGI: 0 };
    }
    const d = map[m.date];
    d.calories = (d.calories || 0) + m.calories;
    d.sugar = (d.sugar || 0) + m.sugarGrams;

    if (m.gi != null) {
      if (!d.avgGI || d.avgGI === 0) {
        d.avgGI = m.gi;
      } else {
        d.avgGI = (d.avgGI + m.gi) / 2;
      }
    }
  });

  sugarEntries.forEach(s => {
    if (!map[s.date]) {
      map[s.date] = { status: 'healthy' };
    }
    const d = map[s.date];
    d.fasting = s.fasting ?? d.fasting;
    d.postMeal = s.postMeal ?? d.postMeal;
  });

  for (const [, d] of Object.entries(map)) {
    const sugar = d.sugar ?? 0;
    const gi = d.avgGI ?? 0;
    const fasting = d.fasting ?? 0;
    const post = d.postMeal ?? 0;

    let status: DaySummary['status'] = 'healthy';

    const highSugarIntake = sugar > sugarLimit;
    const highGI = gi >= 70;
    const highFasting = fasting > 130;
    const highPost = post > 180;
    const veryHighPost = post > 250;

    if (veryHighPost || (highFasting && highPost)) {
      status = 'unhealthy';
    } else if (highSugarIntake || highGI || highPost) {
      status = 'warning';
    } else {
      status = 'healthy';
    }

    d.status = status;
  }

  return map;
}
