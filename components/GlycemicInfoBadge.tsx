import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

type Props = {
  gi: number; // glisemik indeks (0-100)
  carbGrams: number; // karbonhidrat miktarı (gram)
};

type Level = 'low' | 'medium' | 'high';

type Indicator = {
  label: string;
  level: Level;
  color: string;
  description: string;
};

const clampPercent = (value: number) => Math.min(100, Math.max(0, value));

const classifyGI = (value: number): Indicator => {
  if (value >= 70) {
    return {
      label: 'Yüksek GI',
      level: 'high',
      color: '#ef4444',
      description: 'Kan şekerini hızlı yükseltir. Lif veya proteinle dengele.',
    };
  }
  if (value >= 56) {
    return {
      label: 'Orta GI',
      level: 'medium',
      color: '#f97316',
      description: 'Orta hızda yükseltir. Porsiyon kontrolü önerilir.',
    };
  }
  return {
    label: 'Düşük GI',
    level: 'low',
    color: '#22c55e',
    description: 'Yavaş emilir, kan şekeri daha dengeli seyreder.',
  };
};

const classifyGL = (value: number): Indicator => {
  if (value >= 20) {
    return {
      label: 'Yüksek yük',
      level: 'high',
      color: '#0f172a',
      description: 'Porsiyon küçültme veya eşlikçi lifli gıdalar faydalı olur.',
    };
  }
  if (value >= 11) {
    return {
      label: 'Orta yük',
      level: 'medium',
      color: '#0ea5e9',
      description: 'Günlük toplam karbonhidrata göre dengelemek iyi olur.',
    };
  }
  return {
    label: 'Düşük yük',
    level: 'low',
    color: '#14b8a6',
    description: 'Glikemik yük düşük, porsiyon genelde güvenlidir.',
  };
};

const GlycemicInfoBadge: React.FC<Props> = ({ gi, carbGrams }) => {
  const { isDarkMode, colors } = useTheme();
  const isZeroCarb = carbGrams <= 0;
  const glycemicLoad = useMemo(() => (gi * carbGrams) / 100, [gi, carbGrams]);
  const giInfo = useMemo(() => classifyGI(gi), [gi]);
  const glInfo = useMemo(() => {
    if (isZeroCarb) {
      return {
        label: 'Karbonhidratsız',
        level: 'low' as Level,
        color: '#0f766e',
        description: 'Karbonhidrat olmadığı için glisemik yük oluşmaz.',
      };
    }
    return classifyGL(glycemicLoad);
  }, [glycemicLoad, isZeroCarb]);

  const summary = useMemo(() => {
    if (isZeroCarb) {
      return {
        title: 'Karbonhidrat içermez',
        note: 'Protein/yağ ağırlıklı; kan şekerinde sıçrama beklenmez.',
        color: '#0f766e',
      };
    }
    if (giInfo.level === 'high' || glInfo.level === 'high') {
      return {
        title: 'Hızlı yükseltebilir',
        note: 'Yanına protein/lif ekleyip porsiyonu küçük tut.',
        color: '#dc2626',
      };
    }
    if (giInfo.level === 'medium' || glInfo.level === 'medium') {
      return {
        title: 'Kontrollü tüket',
        note: 'Gün içi toplam karbonhidrata göre porsiyon ayarla.',
        color: '#f59e0b',
      };
    }
    return {
      title: 'Nazik etkili',
      note: 'Kan şekerinde ani sıçrama beklenmez.',
      color: '#16a34a',
    };
  }, [giInfo.level, glInfo.level]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <IndicatorCard
          title={`GI: ${gi}`}
          info={giInfo}
          percent={clampPercent((gi / 100) * 100)}
          isDarkMode={isDarkMode}
          colors={colors}
        />
        <IndicatorCard
          title={isZeroCarb ? 'GY: 0 (yok)' : `GY: ${glycemicLoad.toFixed(1)}`}
          info={glInfo}
          percent={clampPercent((glycemicLoad / 30) * 100)}
          helper={isZeroCarb ? 'Karbonhidrat yok → glisemik yük oluşmaz.' : `Karbonhidrat: ${carbGrams} g`}
          isDarkMode={isDarkMode}
          colors={colors}
        />
      </View>

      <View style={[styles.summaryCard, { 
        borderLeftColor: summary.color,
        backgroundColor: colors.cardBackground,
      }]}>
        <Text style={[styles.summaryTitle, { color: summary.color }]}>{summary.title}</Text>
        <Text style={[styles.summaryText, { color: colors.secondaryText }]}>{summary.note}</Text>
      </View>
    </View>
  );
};

type IndicatorCardProps = {
  title: string;
  info: Indicator;
  percent: number;
  helper?: string;
  isDarkMode: boolean;
  colors: any;
};

const IndicatorCard: React.FC<IndicatorCardProps> = ({ title, info, percent, helper, isDarkMode, colors }) => (
  <View style={[styles.badge, { 
    borderColor: info.color,
    backgroundColor: isDarkMode ? '#1C1C1E' : '#f9fafb',
  }]}> 
    <Text style={[styles.badgeTitle, { color: info.color }]}>{title}</Text>
    <Text style={[styles.badgeSub, { color: colors.secondaryText }]}>{info.label}</Text>
    <View style={[styles.progressTrack, { backgroundColor: isDarkMode ? '#2C2C2E' : '#e2e8f0' }]}>
      <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: info.color }]} />
    </View>
    <Text style={[styles.badgeDesc, { color: colors.secondaryText }]}>{info.description}</Text>
    {helper && <Text style={[styles.helperText, { color: colors.secondaryText, opacity: 0.7 }]}>{helper}</Text>}
  </View>
);

export default GlycemicInfoBadge;

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  badge: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  badgeSub: {
    fontSize: 11,
    marginBottom: 6,
  },
  badgeDesc: {
    fontSize: 11,
    marginTop: 6,
  },
  helperText: {
    fontSize: 10,
    marginTop: 4,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },
  summaryCard: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 12,
  },
});
