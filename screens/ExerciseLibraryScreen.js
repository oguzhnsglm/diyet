import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, Text, View, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../styles';
import { addQuickAction, getQuickActions, removeQuickAction } from '../logic/quickActions';
import { getTodayHealthSummary } from '../logic/healthSync';

const QUICK_CATEGORY = 'exercise';

const exerciseSections = [
  {
    title: 'Hafif Tempo',
    subtitle: 'Evde yapılabilecek, düşük yoğunlukta aktiviteler',
    accent: '#22c55e',
    items: [
      {
        id: 'walk_light',
        name: 'Hafif tempolu yürüyüş',
        duration: '20-30 dk',
        calories: '≈ 90-140 kcal',
        tip: 'Dışarıda veya evde sabit yürüyüşle uygulanabilir.',
      },
      {
        id: 'stretch_mobility',
        name: 'Esneme ve mobility rutini',
        duration: '15 dk',
        calories: '≈ 40-60 kcal',
        tip: 'Tüm vücudu kapsayan kontrollü hareketler stresi azaltır.',
      },
      {
        id: 'yoga_basic',
        name: 'Yoga / Pilates temel seri',
        duration: '25 dk',
        calories: '≈ 100-130 kcal',
        tip: 'Nefes egzersizleriyle kombine edildiğinde duruşu destekler.',
      },
    ],
  },
  {
    title: 'Orta Tempo',
    subtitle: 'Kalp ritmini yükselten fakat sürdürülebilir çalışmalar',
    accent: '#f97316',
    items: [
      {
        id: 'walk_power',
        name: 'Tempolu yürüyüş',
        duration: '35-40 dk',
        calories: '≈ 180-240 kcal',
        tip: 'Hafif yokuşlar veya merdiven ekleyerek verimi artır.',
      },
      {
        id: 'bodyweight_circuit',
        name: 'Vücut ağırlığı devresi',
        duration: '20 dk',
        calories: '≈ 150-210 kcal',
        tip: 'Squat, lunge, plank ve mountain climber kombinasyonu.',
      },
      {
        id: 'rope_intervals',
        name: 'İp atlama (aralıklarla)',
        duration: '10-12 dk',
        calories: '≈ 120-160 kcal',
        tip: '1 dk aktif / 30 sn dinlen modunda 8-10 tur uygulayabilirsin.',
      },
    ],
  },
  {
    title: 'Yüksek Tempo',
    subtitle: 'Kısa sürede yüksek kalori yaktıran egzersizler',
    accent: '#3b82f6',
    items: [
      {
        id: 'run_hiit',
        name: 'Koşu veya HIIT yürüyüş-koşu',
        duration: '25 dk',
        calories: '≈ 280-380 kcal',
        tip: '2 dk koş + 1 dk yürüyüş şeklinde tur tekrarları oluştur.',
      },
      {
        id: 'stairs',
        name: 'Merdiven antrenmanı',
        duration: '15 dk',
        calories: '≈ 200-260 kcal',
        tip: 'Her tur sonunda 1 dk dinlenerek 6-8 tur tamamla.',
      },
      {
        id: 'cycling',
        name: 'Bisiklet / Spinning',
        duration: '30 dk',
        calories: '≈ 250-350 kcal',
        tip: 'Kadansını 1 dk yüksek / 1 dk orta olacak şekilde değiştir.',
      },
    ],
  },
];

const LIMITS = {
  calories: 2000,
  sugar: 50,
};

const ExerciseLibraryScreen = ({ route }) => {
  const [quickExercises, setQuickExercises] = useState([]);
  const [highlightedId, setHighlightedId] = useState(null);
  const [healthSummary, setHealthSummary] = useState(null);

  const stats = route?.params?.stats || { calories: 0, sugar: 0 };
  const extraCalories = Math.max(0, stats.calories - LIMITS.calories);
  const extraSugar = Math.max(0, stats.sugar - LIMITS.sugar);

  useEffect(() => {
    const loadHealthData = async () => {
      const summary = await getTodayHealthSummary();
      setHealthSummary(summary);
    };
    loadHealthData();
  }, []);

  const exerciseAdvice = useMemo(() => {
    const notes = [];

    if (extraCalories > 0) {
      if (extraCalories < 100) {
        notes.push(
          `Bugün kalori hedefinden yaklaşık ${extraCalories.toFixed(
            0
          )} kcal fazla aldın. Hafif Tempo bölümündeki 15–20 dakikalık yürüyüş bu farkı dengelemeye yardımcı olabilir.`
        );
      } else if (extraCalories < 250) {
        notes.push(
          `Günlük hedefin üzerinde yaklaşık ${extraCalories.toFixed(
            0
          )} kcal var. Orta Tempo bölümünden 25–30 dk tempolu yürüyüş veya bisiklet iyi bir seçenek.`
        );
      } else {
        notes.push(
          `Kalori fazlan yaklaşık ${extraCalories.toFixed(
            0
          )} kcal. Bugün 40–45 dk yürüyüş + gün içine yayılmış hafif hareketler (merdiven, kısa yürüyüşler) planlaman faydalı olabilir.`
        );
      }
    }

    if (extraSugar > 0) {
      notes.push(
        `Şeker tüketimin günlük limitin üzerinde (~${extraSugar.toFixed(
          0
        )} g fazla). 10–15 dk yürüyüş ve bol su tüketimi, kan şekerindeki yükselişi dengelemeye yardımcı olabilir.`
      );
      notes.push(
        'Bir sonraki öğünde basit şeker yerine sebze, protein ve tam tahıllı karbonhidrat tercih etmeye çalış.'
      );
    }

    if (notes.length === 0) {
      notes.push(
        'Bugün kalori ve şeker hedeflerin genel olarak dengeli görünüyor. Yine de 15–20 dakikalık hafif tempolu bir yürüyüş, kan şekeri ve ruh hâli için her zaman iyi bir fikir. 💚'
      );
    }

    return notes;
  }, [extraCalories, extraSugar]);

  useEffect(() => {
    const load = async () => {
      const stored = await getQuickActions(QUICK_CATEGORY);
      setQuickExercises(stored);
      if (stored.length && !highlightedId) {
        setHighlightedId(stored[0].id);
      }
    };
    load();
  }, []);

  const handleToggleFavorite = async (exercise, sectionTitle, isFavorite) => {
    if (isFavorite) {
      const updated = await removeQuickAction(QUICK_CATEGORY, exercise.id);
      setQuickExercises(updated);
      if (highlightedId === exercise.id) {
        setHighlightedId(updated.length ? updated[0]?.id : null);
      }
      return;
    }

    const payload = {
      id: exercise.id,
      name: exercise.name,
      duration: exercise.duration,
      calories: exercise.calories,
      tip: exercise.tip,
      section: sectionTitle,
    };
    const updated = await addQuickAction(QUICK_CATEGORY, payload);
    setQuickExercises(updated);
    setHighlightedId(payload.id);
  };

  const highlightedExercise = useMemo(
    () => quickExercises.find((ex) => ex.id === highlightedId),
    [quickExercises, highlightedId]
  );

  return (
    <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Exercise</Text>

        {/* Health Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statBoxIcon}>🔥</Text>
            <Text style={styles.statBoxValue}>
              {healthSummary?.totalCalories || 0}
            </Text>
            <Text style={styles.statBoxLabel}>Burned</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statBoxIcon}>👣</Text>
            <Text style={styles.statBoxValue}>
              {healthSummary?.totalSteps || 0}
            </Text>
            <Text style={styles.statBoxLabel}>Steps</Text>
          </View>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statBoxIcon}>💓</Text>
            <Text style={styles.statBoxValue}>
              {healthSummary?.avgHeartRate || '--'}
            </Text>
            <Text style={styles.statBoxLabel}>Avg HR</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statBoxIcon}>🍽️</Text>
            <Text style={styles.statBoxValue}>
              {stats.calories || 0}
            </Text>
            <Text style={styles.statBoxLabel}>Eaten</Text>
          </View>
        </View>

        {/* Quick Actions */}
        {sortedExercises.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>⭐ Favorites</Text>
            {sortedExercises.slice(0, 3).map(ex => (
              <View key={ex.id} style={styles.exerciseCard}>
                <View>
                  <Text style={styles.exerciseName}>{ex.name}</Text>
                  <Text style={styles.exerciseInfo}>{ex.duration} · {ex.calories}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {/* All Exercises */}
        {exerciseSections.map((section) => (
          <View key={section.title}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item) => (
              <Pressable
                key={item.id}
                style={styles.exerciseCard}
                onPress={() => {
                  if (quickExerciseIds.includes(item.id)) {
                    removeQuickAction(QUICK_CATEGORY, item.id);
                  } else {
                    addQuickAction(QUICK_CATEGORY, item);
                  }
                  loadQuickActions();
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.exerciseName}>{item.name}</Text>
                  <Text style={styles.exerciseInfo}>{item.duration} · {item.calories}</Text>
                </View>
                <Text style={styles.starIcon}>
                  {quickExerciseIds.includes(item.id) ? '⭐' : '☆'}
                </Text>
              </Pressable>
            ))}
          </View>
        ))}
        </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  content: {
    padding: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 32,
    letterSpacing: -0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  statBoxIcon: {
    fontSize: 36,
    marginBottom: 14,
  },
  statBoxValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  statBoxLabel: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 24,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#1E293B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  exerciseInfo: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  starIcon: {
    fontSize: 26,
  },
  statusCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.cardShadow,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  statusBox: {
    flex: 1,
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 10,
  },
  statusLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  statusSub: {
    fontSize: 11,
    color: '#4b5563',
    marginTop: 2,
  },
  statusAdvice: {
    marginTop: 6,
  },
  statusAdviceText: {
    fontSize: 12,
    color: colors.text,
    marginBottom: 2,
    lineHeight: 18,
  },
  healthInfoBar: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  healthInfoText: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '500',
  },
  hero: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    shadowColor: colors.cardShadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.cardShadow,
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
    gap: 12,
  },
  sectionAccent: {
    width: 6,
    borderRadius: 3,
    height: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  exerciseRow: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  exerciseDuration: {
    fontSize: 13,
    color: colors.textMuted,
  },
  exerciseCalories: {
    fontSize: 13,
    color: '#1e3a8a',
    marginTop: 2,
    fontWeight: '600',
  },
  exerciseTip: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 18,
  },
  quickSection: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  quickChip: {
    backgroundColor: '#E0F2FE',
    padding: 12,
    borderRadius: 14,
    marginRight: 10,
    width: 160,
  },
  quickChipActive: {
    borderWidth: 1,
    borderColor: '#3b82f6',
    backgroundColor: '#dbeafe',
  },
  quickChipTitle: {
    fontWeight: '600',
    color: '#0f172a',
  },
  quickChipSub: {
    fontSize: 12,
    color: '#1d4ed8',
    marginTop: 4,
  },
  quickChipCal: {
    fontSize: 12,
    color: '#1e3a8a',
    marginTop: 2,
  },
  quickDetail: {
    marginTop: 10,
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    padding: 12,
  },
  quickDetailLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#065f46',
  },
  quickDetailText: {
    fontSize: 12,
    color: '#065f46',
    marginTop: 4,
  },
  favoriteToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#cbd5f5',
    backgroundColor: '#edf2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteToggleActive: {
    borderColor: '#facc15',
    backgroundColor: '#fef9c3',
  },
  favoriteStar: {
    fontSize: 18,
    color: '#94a3b8',
  },
  favoriteStarActive: {
    color: '#facc15',
  },
  noteBox: {
    backgroundColor: colors.infoBg,
    borderWidth: 1,
    borderColor: colors.infoBorder,
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  noteText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 18,
  },
});

export default ExerciseLibraryScreen;
