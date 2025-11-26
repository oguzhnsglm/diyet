import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../styles';

const DAILY_CALORIE_LIMIT = 2000;

export const getExerciseSuggestions = (totalCalories = 0, limit = DAILY_CALORIE_LIMIT) => {
  const extra = Math.max(0, totalCalories - limit);
  if (extra === 0) {
    return {
      extra,
      suggestions: [
        {
          text: 'Bugün kalori limitini aşmadın, yine de 20 dakikalık hafif yürüyüş her zaman iyi gelir 💚',
          kcal: null,
        },
      ],
    };
  }

  if (extra <= 100) {
    return {
      extra,
      suggestions: [
        { text: 'Hafif tempolu yürüyüş (15 dk)', kcal: '≈ 50–70 kcal' },
        { text: 'Ev içinde esneme/germe hareketleri (10 dk)', kcal: '≈ 20–30 kcal' },
      ],
    };
  }

  if (extra <= 250) {
    return {
      extra,
      suggestions: [
        { text: 'Tempolu yürüyüş (30 dk)', kcal: '≈ 120–180 kcal' },
        { text: 'Hafif koşu veya merdiven inip çıkma (15 dk)', kcal: '≈ 80–120 kcal' },
      ],
    };
  }

  if (extra <= 400) {
    return {
      extra,
      suggestions: [
        { text: 'Tempolu yürüyüş (40 dk)', kcal: '≈ 160–240 kcal' },
        { text: 'Vücut ağırlığı egzersizleri (20 dk)', kcal: '≈ 120–180 kcal' },
      ],
    };
  }

  return {
    extra,
    suggestions: [
      { text: 'Yürüyüş + hafif koşu karışık (60 dk)', kcal: '≈ 300–450 kcal' },
      {
        text: 'Gün içinde hareketi artır (merdiven, kısa mesafeleri yürümek)',
        kcal: 'Gün boyu yayılmış ek 100–150 kcal',
      },
    ],
  };
};

const ExerciseSuggestions = ({ totalCalories = 0, limit = DAILY_CALORIE_LIMIT }) => {
  const { extra, suggestions } = useMemo(
    () => getExerciseSuggestions(totalCalories, limit),
    [totalCalories, limit]
  );

  return (
    <View style={styles.section}>
      {extra > 0 && (
        <View style={styles.alertBox}>
          <Text style={styles.alertText}>
            <Text style={styles.alertBold}>Kalori uyarısı:</Text>
            {` Bugün günlük ${limit} kcal limitini yaklaşık `}
            <Text style={styles.alertBold}>{`${extra.toFixed(0)} kcal`}</Text>
            {' aştın. Bunu dengelemek için aşağıdaki egzersizleri deneyebilirsin. 💪'}
          </Text>
        </View>
      )}

      <Text style={styles.title}>Egzersiz Önerileri</Text>
      <Text style={styles.subtitle}>Günlük kalori durumuna göre sana uygun aktivite önerileri:</Text>

      <View style={styles.card}>
        {suggestions.map((item, idx) => (
          <View key={`${item.text}-${idx}`} style={styles.itemRow}>
            <Text style={styles.bullet}>•</Text>
            <View style={styles.itemTextWrapper}>
              <Text style={styles.itemText}>{item.text}</Text>
              {item.kcal && (
                <Text style={styles.itemKcal}>
                  Yaklaşık yakılan enerji: <Text style={styles.itemKcalBold}>{item.kcal}</Text>
                </Text>
              )}
            </View>
          </View>
        ))}

        <Text style={styles.note}>
          ⚠️ Değerler yaklaşık ortalamadır; yaş, kilo ve tempo gibi faktörlere göre değişebilir.
          Herhangi bir sağlık sorunun varsa mutlaka uzmanına danış.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  alertBox: {
    backgroundColor: '#fee2e2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  alertText: {
    fontSize: 13,
    color: '#7f1d1d',
    lineHeight: 18,
  },
  alertBold: {
    fontWeight: '700',
    color: '#7f1d1d',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#e0f2fe',
    borderRadius: 14,
    padding: 14,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 18,
    color: '#1d4ed8',
    marginRight: 6,
    lineHeight: 20,
  },
  itemTextWrapper: {
    flex: 1,
  },
  itemText: {
    fontSize: 14,
    color: '#1e3a8a',
    lineHeight: 20,
  },
  itemKcal: {
    fontSize: 12,
    color: '#1e40af',
    marginTop: 2,
  },
  itemKcalBold: {
    fontWeight: '700',
    color: '#1e40af',
  },
  note: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 10,
    lineHeight: 16,
  },
});

export default ExerciseSuggestions;
