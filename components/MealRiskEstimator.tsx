import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  gi: number;
  carbGrams: number;
  proteinGrams: number;
};

const MealRiskEstimator: React.FC<Props> = ({ gi, carbGrams, proteinGrams }) => {
  const glycemicLoad = useMemo(() => (gi * carbGrams) / 100, [gi, carbGrams]);

  const riseRisk = useMemo(() => Math.min(100, Math.round(glycemicLoad * 2.5)), [glycemicLoad]);

  const dropRisk = useMemo(() => {
    if (gi < 50 && proteinGrams >= 15) return 40;
    if (gi < 50) return 20;
    if (proteinGrams >= 20) return 15;
    return 0;
  }, [gi, proteinGrams]);

  const riseLabel = useMemo(() => {
    if (riseRisk > 70) return 'Yüksek risk';
    if (riseRisk > 40) return 'Orta risk';
    return 'Düşük risk';
  }, [riseRisk]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Kan Şekeri Etki Tahmini</Text>
      <Text style={styles.label}>Yükselme ihtimali: {riseRisk}% ({riseLabel})</Text>
      <Text style={styles.label}>Azalma ihtimali: {dropRisk}%</Text>
      <Text style={styles.sub}>
        *Bu değerler tıbbi öneri değildir, GI & karbonhidrat matematiksel tahminidir.
      </Text>
    </View>
  );
};

export default MealRiskEstimator;

const styles = StyleSheet.create({
  card: {
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 8,
  },
  title: { fontSize: 15, fontWeight: '600', color: '#0f172a', marginBottom: 6 },
  label: { fontSize: 13, color: '#334155', marginBottom: 2 },
  sub: { fontSize: 10, color: '#64748b', marginTop: 6 },
});
