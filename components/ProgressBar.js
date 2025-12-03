import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ProgressBar = ({ label, value = 0, max = 1, color = '#22c55e', unit = '' }) => {
  const progress = Math.min(1, max ? value / max : 0);

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{`${value}${unit} / ${max}${unit}`}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 12,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
});

export default ProgressBar;
