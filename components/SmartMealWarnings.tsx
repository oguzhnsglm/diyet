import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type Props = {
  gi: number;
  carbGrams: number;
  sugarGrams: number;
  protein: number;
};

const SmartMealWarnings: React.FC<Props> = ({ gi, carbGrams, sugarGrams, protein }) => {
  const { isDarkMode, colors } = useTheme();
  
  const warnings = useMemo(() => {
    const messages: string[] = [];

    if (carbGrams <= 0) {
      messages.push('Karbonhidrat içermediği için glisemik yük oluşturmaz.');
      if (protein >= 20) {
        messages.push('Protein içeriği yüksek, uzun süre tokluk verebilir.');
      }
      return messages;
    }

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
    <View style={[styles.card, { 
      backgroundColor: isDarkMode ? '#2C2C2E' : '#fff7ed',
      borderColor: isDarkMode ? '#3A3A3C' : '#fed7aa',
    }]}>
      <Text style={[styles.title, { color: isDarkMode ? '#FF9F0A' : '#c2410c' }]}>⚠️ Öğün Öncesi Uyarılar</Text>
      {warnings.map((w, i) => (
        <Text key={i} style={[styles.warning, { color: isDarkMode ? colors.secondaryText : '#7c2d12' }]}>
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
    borderRadius: 10,
    borderWidth: 1,
  },
  title: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  warning: { fontSize: 12 },
});
