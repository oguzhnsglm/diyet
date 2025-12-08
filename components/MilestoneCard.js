import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Alev İkonu
const BigFlameIcon = () => (
  <Svg width="60" height="70" viewBox="0 0 60 70">
    <Path
      d="M30 5c-4 8-10 15-10 22.5 0 5.5 4.5 10 10 10s10-4.5 10-10c0-7.5-6-14.5-10-22.5zm0 35c-2.75 0-5-2.25-5-5 0-3.25 2.5-6.25 5-10 2.5 3.75 5 6.75 5 10 0 2.75-2.25 5-5 5z"
      fill="#F59E0B"
    />
    <Path
      d="M30 5c-4 8-10 15-10 22.5 0 5.5 4.5 10 10 10s10-4.5 10-10c0-7.5-6-14.5-10-22.5z"
      fill="#FBBF24"
      opacity="0.6"
    />
  </Svg>
);

const MilestoneCard = ({ days = 3, onCommit }) => {
  const weekDays = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
  
  return (
    <View style={styles.card}>
      <View style={styles.flameContainer}>
        <BigFlameIcon />
        <View style={styles.dayBadge}>
          <Text style={styles.dayNumber}>{days}</Text>
        </View>
      </View>

      <Text style={styles.title}>Gün Başarısı</Text>

      {/* Haftalık Çubuk Grafiği */}
      <View style={styles.weekBar}>
        {weekDays.map((day, index) => (
          <View key={day} style={styles.dayColumn}>
            <View 
              style={[
                styles.barFill,
                index < days ? styles.barActive : styles.barInactive
              ]} 
            />
            <Text style={styles.dayLabel}>{day}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.message}>
        Harika! Şimdi 7 günlük başarıya gidelim.
      </Text>

      <TouchableOpacity style={styles.commitButton} onPress={onCommit}>
        <Text style={styles.commitButtonText}>Kararlıyım</Text>
      </TouchableOpacity>
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
    alignItems: 'center',
  },
  flameContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  dayBadge: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -15 }, { translateY: -15 }],
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F59E0B',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 20,
  },
  weekBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
  },
  dayColumn: {
    alignItems: 'center',
    gap: 8,
  },
  barFill: {
    width: 32,
    height: 40,
    borderRadius: 8,
  },
  barActive: {
    backgroundColor: '#FBBF24',
  },
  barInactive: {
    backgroundColor: '#E5E7EB',
  },
  dayLabel: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '600',
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  commitButton: {
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 40,
    width: '100%',
  },
  commitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default MilestoneCard;
