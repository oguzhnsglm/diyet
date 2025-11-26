import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

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
  const glycemicLoad = useMemo(() => (gi * carbGrams) / 100, [gi, carbGrams]);
  const giInfo = useMemo(() => classifyGI(gi), [gi]);
  const glInfo = useMemo(() => classifyGL(glycemicLoad), [glycemicLoad]);

  const summary = useMemo(() => {
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
        />
        <IndicatorCard
          title={`GY: ${glycemicLoad.toFixed(1)}`}
          info={glInfo}
          percent={clampPercent((glycemicLoad / 30) * 100)}
          helper={`Karbonhidrat: ${carbGrams} g`}
        />
      </View>

      <View style={[styles.summaryCard, { borderLeftColor: summary.color }]}>
        <Text style={[styles.summaryTitle, { color: summary.color }]}>{summary.title}</Text>
        <Text style={styles.summaryText}>{summary.note}</Text>
      </View>
    </View>
  );
};

type IndicatorCardProps = {
  title: string;
  info: Indicator;
  percent: number;
  helper?: string;
};

const IndicatorCard: React.FC<IndicatorCardProps> = ({ title, info, percent, helper }) => (
  <View style={[styles.badge, { borderColor: info.color }]}> 
    <Text style={[styles.badgeTitle, { color: info.color }]}>{title}</Text>
    <Text style={styles.badgeSub}>{info.label}</Text>
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${percent}%`, backgroundColor: info.color }]} />
    </View>
    <Text style={styles.badgeDesc}>{info.description}</Text>
    {helper && <Text style={styles.helperText}>{helper}</Text>}
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
    backgroundColor: '#f9fafb',
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  badgeSub: {
    fontSize: 11,
    color: '#475569',
    marginBottom: 6,
  },
  badgeDesc: {
    fontSize: 11,
    color: '#475569',
    marginTop: 6,
  },
  helperText: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 4,
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: '#e2e8f0',
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
    backgroundColor: '#fff',
    borderLeftWidth: 4,
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 12,
    color: '#475569',
  },
});
