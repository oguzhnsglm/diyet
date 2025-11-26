import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  gi: number;
  carbGrams: number;
  sugarGrams: number;
  protein: number;
};

const SmartMealWarnings: React.FC<Props> = ({ gi, carbGrams, sugarGrams, protein }) => {
  const warnings = useMemo(() => {
    const messages: string[] = [];

    if (gi >= 70) {
      messages.push('Bu besin yüksek GI içeriyor, hızlı şeker yükselişi yapabilir.');
    }
    if (sugarGrams > 12) {
      messages.push('Şeker miktarı yüksek, dikkatli tüket.');
    }
    if (carbGrams > 40) {
      messages.push('Karbonhidrat miktarı fazla, porsiyonu küçültebilirsin.');
    }
    if (protein >= 15 && gi >= 60) {
      messages.push('Protein içeriği iyi, GI etkisini biraz dengeleyebilir.');
    }
    if (messages.length === 0) {
      messages.push('Öğün dengeli görünüyor, afiyet olsun!');
    }

    return messages;
  }, [gi, carbGrams, sugarGrams, protein]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>⚠️ Öğün Öncesi Uyarılar</Text>
      {warnings.map((w, i) => (
        <Text key={i} style={styles.warning}>
          • {w}
        </Text>
      ))}
    </View>
  );
};

export default SmartMealWarnings;

const styles = StyleSheet.create({
  card: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#fff7ed',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  title: { fontSize: 14, fontWeight: '600', color: '#c2410c', marginBottom: 4 },
  warning: { fontSize: 12, color: '#7c2d12' },
});
