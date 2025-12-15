import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type Props = {
  gi: number;
  carbGrams: number;
  proteinGrams: number;
};

const MealRiskEstimator: React.FC<Props> = ({ gi, carbGrams, proteinGrams }) => {
  const { isDarkMode, colors } = useTheme();
  const isZeroCarb = carbGrams <= 0;
  const glycemicLoad = useMemo(() => (gi * Math.max(carbGrams, 0)) / 100, [gi, carbGrams]);

  const riseRisk = useMemo(() => {
    if (isZeroCarb) return 0;
    return Math.min(100, Math.round(glycemicLoad * 2.5));
  }, [glycemicLoad, isZeroCarb]);

  const dropRisk = useMemo(() => {
    if (isZeroCarb) return 10;
    if (gi < 50 && proteinGrams >= 15) return 40;
    if (gi < 50) return 20;
    if (proteinGrams >= 20) return 15;
    return 0;
  }, [gi, proteinGrams, isZeroCarb]);

  const riseLabel = useMemo(() => {
    if (riseRisk > 70) return 'Yüksek risk';
    if (riseRisk > 40) return 'Orta risk';
    return 'Düşük risk';
  }, [riseRisk]);

  return (
    <View style={[styles.card, {
      backgroundColor: isDarkMode ? '#2C2C2E' : '#f8fafc',
      borderColor: isDarkMode ? '#3A3A3C' : '#e2e8f0',
    }]}>
      <Text style={[styles.title, { color: colors.text }]}>Kan Şekeri Etki Tahmini</Text>
      <Text style={[styles.label, { color: colors.secondaryText }]}>
        Yükselme ihtimali: {isZeroCarb ? 'Karbonhidrat yok' : `${riseRisk}% (${riseLabel})`}
      </Text>
      <Text style={[styles.label, { color: colors.secondaryText }]}>Azalma ihtimali: {dropRisk}%</Text>
      {isZeroCarb && (
        <Text style={[styles.label, { color: colors.secondaryText }]}>Bu öğün kan şekerini yükseltmez, protein ağırlıklı tok tutar.</Text>
      )}
      <Text style={[styles.sub, { color: isDarkMode ? colors.secondaryText : '#64748b', opacity: 0.8 }]}>
        *Bu değerler tıbbi öneri değildir, GI & karbonhidrat matematiksel tahminidir.
      </Text>
    </View>
  );
};

export default MealRiskEstimator;

const styles = StyleSheet.create({
  card: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 8,
  },
  title: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  label: { fontSize: 13, marginBottom: 2 },
  sub: { fontSize: 10, marginTop: 6 },
});
