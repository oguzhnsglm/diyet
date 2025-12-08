import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

// Elmas İkonu
const DiamondIcon = ({ value }) => (
  <View style={styles.iconBadge}>
    <Svg width="18" height="18" viewBox="0 0 24 24">
      <Path
        d="M12 2L2 9l10 13L22 9z"
        fill="#3B82F6"
      />
    </Svg>
    <Text style={styles.badgeText}>{value}</Text>
  </View>
);

// Alev İkonu Küçük
const SmallFlameIcon = ({ value }) => (
  <View style={styles.iconBadge}>
    <Svg width="16" height="18" viewBox="0 0 24 24">
      <Path
        d="M12 2c-1.6 3.2-4 6-4 9 0 2.2 1.8 4 4 4s4-1.8 4-4c0-3-2.4-5.8-4-9z"
        fill="#EF4444"
      />
    </Svg>
    <Text style={styles.badgeText}>{value}</Text>
  </View>
);

// Progress Ring
const ProgressRing = ({ eaten, remaining, burned, size = 180 }) => {
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = eaten + remaining;
  const progress = (eaten / total) * 100;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <View style={[styles.ringContainer, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#10B981"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.ringContent}>
        <Text style={styles.eatenText}>{eaten}</Text>
        <Text style={styles.eatenLabel}>Yenilen</Text>
        <Text style={styles.remainingText}>{remaining}</Text>
        <Text style={styles.remainingLabel}>Kalan</Text>
        <Text style={styles.burnedText}>{burned} Yakılan</Text>
      </View>
    </View>
  );
};

const TodaySummaryCard = ({ 
  eaten = 1020, 
  remaining = 868, 
  burned = 142,
  carbs = { current: 97, target: 207 },
  protein = { current: 46, target: 115 },
  fat = { current: 50, target: 61 },
  diamonds = 2000,
  streak = 135,
  week = 175
}) => {
  const MacroBar = ({ label, current, target, color }) => {
    const progress = (current / target) * 100;
    return (
      <View style={styles.macroItem}>
        <View style={styles.macroHeader}>
          <Text style={styles.macroLabel}>{label}</Text>
          <Text style={styles.macroValue}>{current} / {target} g</Text>
        </View>
        <View style={styles.macroBarBg}>
          <View 
            style={[
              styles.macroBarFill, 
              { width: `${Math.min(progress, 100)}%`, backgroundColor: color }
            ]} 
          />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Bugün</Text>
          <Text style={styles.week}>Hafta {week}</Text>
        </View>
        <View style={styles.badges}>
          <DiamondIcon value={diamonds} />
          <SmallFlameIcon value={streak} />
        </View>
      </View>

      {/* Progress Ring */}
      <View style={styles.ringSection}>
        <ProgressRing eaten={eaten} remaining={remaining} burned={burned} />
      </View>

      {/* Macro Bars */}
      <View style={styles.macroSection}>
        <MacroBar label="Karbonhidrat" current={carbs.current} target={carbs.target} color="#FBBF24" />
        <MacroBar label="Protein" current={protein.current} target={protein.target} color="#3B82F6" />
        <MacroBar label="Yağ" current={fat.current} target={fat.target} color="#EF4444" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 26,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
  },
  week: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  badges: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  ringSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ringContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringContent: {
    position: 'absolute',
    alignItems: 'center',
  },
  eatenText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
  },
  eatenLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  remainingText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#10B981',
  },
  remainingLabel: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  burnedText: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
  },
  macroSection: {
    gap: 16,
  },
  macroItem: {
    gap: 8,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  macroValue: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  macroBarBg: {
    height: 12,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 999,
  },
});

export default TodaySummaryCard;
