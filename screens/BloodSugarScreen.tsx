import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { getBloodSugarEntries, upsertBloodSugarEntry } from '../logic/bloodSugarStorage';
import { useFocusEffect } from '@react-navigation/native';

type Entry = {
  date: string; // YYYY-MM-DD
  fasting: number; // açlık şekeri (mg/dL)
  postMeal: number; // tokluk şekeri (mg/dL)
};

const todayISO = () => format(new Date(), 'yyyy-MM-dd');

const BloodSugarScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [fasting, setFasting] = useState('');
  const [postMeal, setPostMeal] = useState('');
  const [date, setDate] = useState(todayISO());
  const [isSaving, setIsSaving] = useState(false);

  const loadEntries = useCallback(async () => {
    const stored = await getBloodSugarEntries();
    setEntries(stored);
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [loadEntries])
  );

  const handleSave = () => {
    const f = Number(fasting);
    const p = Number(postMeal);
    if (Number.isNaN(f) || Number.isNaN(p)) return;
    setIsSaving(true);

    const persist = async () => {
      try {
        const updated = await upsertBloodSugarEntry({ date, fasting: f, postMeal: p });
        setEntries(updated);
        setFasting('');
        setPostMeal('');
      } finally {
        setIsSaving(false);
      }
    };

    persist();
  };

  const last7 = [...entries].sort((a, b) => a.date.localeCompare(b.date)).slice(-7);
  const maxValue = last7.length > 0 ? Math.max(...last7.map(e => Math.max(e.fasting, e.postMeal))) : 200;

  const latestEntry = useMemo(() => {
    if (entries.length === 0) return null;
    return [...entries].sort((a, b) => b.date.localeCompare(a.date))[0];
  }, [entries]);

  const emergencyStatus = useMemo(() => {
    if (!latestEntry) return 'normal';
    if (latestEntry.fasting < 70) return 'hypo';
    if (latestEntry.postMeal > 250 || latestEntry.fasting > 180) return 'hyper';
    return 'normal';
  }, [latestEntry]);

  const showEmergencyCta = latestEntry && emergencyStatus !== 'normal';

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.title}>🩸 Kan Şekeri Takibi</Text>
      <Text style={styles.subtitle}>Açlık ve tokluk kan şekeri değerlerini kaydedip değişimi izleyebilirsin.</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Bugünün Değerleri</Text>

        <Text style={styles.label}>Tarih (YYYY-AA-GG)</Text>
        <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2025-11-26" />

        <Text style={styles.label}>Açlık şekeri (mg/dL)</Text>
        <TextInput
          style={styles.input}
          value={fasting}
          onChangeText={setFasting}
          keyboardType="numeric"
          placeholder="Örn: 95"
        />

        <Text style={styles.label}>Tokluk şekeri (mg/dL)</Text>
        <TextInput
          style={styles.input}
          value={postMeal}
          onChangeText={setPostMeal}
          keyboardType="numeric"
          placeholder="Örn: 140"
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
          <Text style={styles.saveButtonText}>{isSaving ? 'Kaydediliyor...' : 'Kaydet'}</Text>
        </TouchableOpacity>

        <Text style={styles.infoText}>
          * Değerlerin diyabet tedavisi için değil, farkındalık ve kayıt amacıyla kullanılmalıdır. Sağlık durumun için
          mutlaka doktoruna danış.
        </Text>
      </View>

      {showEmergencyCta && (
        <TouchableOpacity
          style={[styles.emergencyButton, emergencyStatus === 'hypo' ? styles.emergencyHypo : styles.emergencyHyper]}
          onPress={() =>
            navigation.navigate('Emergency', {
              fasting: latestEntry?.fasting,
              postMeal: latestEntry?.postMeal,
            })
          }
        >
          <Text style={styles.emergencyButtonText}>
            {emergencyStatus === 'hypo'
              ? 'Düşük şeker için acil önerileri aç'
              : 'Yüksek şeker için acil önerileri aç'}
          </Text>
        </TouchableOpacity>
      )}

      <Text style={styles.sectionTitle}>Son 7 Gün Özeti</Text>
      {last7.length === 0 ? (
        <Text style={styles.infoText}>Henüz kayıt yok.</Text>
      ) : (
        <View style={styles.chartCard}>
          {last7.map(e => {
            const fastingHeight = (e.fasting / maxValue) * 80;
            const postHeight = (e.postMeal / maxValue) * 80;
            const label = format(new Date(e.date), 'dd MMM', { locale: tr });

            return (
              <View key={e.date} style={styles.chartColumn}>
                <Text style={styles.chartDate}>{label}</Text>
                <View style={styles.barsWrapper}>
                  <View style={[styles.bar, { height: fastingHeight, backgroundColor: '#0ea5e9' }]} />
                  <View style={[styles.bar, { height: postHeight, backgroundColor: '#f97316' }]} />
                </View>
                <Text style={styles.chartLabelSmall}>A:{e.fasting}</Text>
                <Text style={styles.chartLabelSmall}>T:{e.postMeal}</Text>
              </View>
            );
          })}
        </View>
      )}

      <Text style={styles.sectionTitle}>Tüm Kayıtlar</Text>
      {entries.length === 0 ? (
        <Text style={styles.infoText}>Henüz kayıt yok.</Text>
      ) : (
        entries
          .slice()
          .sort((a, b) => b.date.localeCompare(a.date))
          .map(e => (
            <View key={e.date} style={styles.entryRow}>
              <Text style={styles.entryDate}>{e.date}</Text>
              <Text style={styles.entryText}>Açlık: {e.fasting} mg/dL</Text>
              <Text style={styles.entryText}>Tokluk: {e.postMeal} mg/dL</Text>
            </View>
          ))
      )}
    </ScrollView>
  );
};

export default BloodSugarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginTop: 12,
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 6,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
  },
  saveButton: {
    marginTop: 10,
    backgroundColor: '#16a34a',
    borderRadius: 999,
    paddingVertical: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  infoText: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 8,
  },
  emergencyButton: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  emergencyHypo: {
    backgroundColor: '#fee2e2',
  },
  emergencyHyper: {
    backgroundColor: '#fef3c7',
  },
  emergencyButtonText: {
    color: '#0f172a',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 13,
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  chartColumn: {
    alignItems: 'center',
    width: 42,
  },
  chartDate: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 4,
  },
  barsWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    gap: 2,
  },
  bar: {
    width: 10,
    borderRadius: 4,
  },
  chartLabelSmall: {
    fontSize: 9,
    color: '#4b5563',
  },
  entryRow: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 8,
    marginBottom: 6,
  },
  entryDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  entryText: {
    fontSize: 11,
    color: '#4b5563',
  },
});
