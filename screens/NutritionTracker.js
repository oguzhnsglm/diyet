import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';

const DAILY_LIMITS = {
  calories: 2000,
  sugar: 50,
  protein: 120,
  fat: 70,
};

const CARD_COLORS = [
  '#22c55e', // Kalori
  '#eab308', // Şeker
  '#3b82f6', // Protein
  '#a855f7', // Yağ
];

const NutritionTracker = ({
  calories = 0,
  sugar = 0,
  protein = 0,
  fat = 0,
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 600;
  const cardData = [
    {
      label: 'Kalori',
      value: `${calories} kcal`,
      sub: `Limit: ${DAILY_LIMITS.calories}`,
      color: calories > DAILY_LIMITS.calories ? '#ef4444' : CARD_COLORS[0],
    },
    {
      label: 'Şeker',
      value: `${sugar} gr`,
      sub: `Kalan: ${DAILY_LIMITS.sugar - sugar} gr`,
      color: CARD_COLORS[1],
    },
    {
      label: 'Protein',
      value: `${protein} gr`,
      sub: `Kalan: ${DAILY_LIMITS.protein - protein} gr`,
      color: CARD_COLORS[2],
    },
    {
      label: 'Yağ',
      value: `${fat} gr`,
      sub: `Kalan: ${DAILY_LIMITS.fat - fat} gr`,
      color: CARD_COLORS[3],
    },
  ];

  return (
    <View style={{ backgroundColor: '#f5f5f5', padding: isMobile ? 8 : 16 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>
        Günlük Besin Takibi
      </Text>
      <View style={[styles.grid, isMobile && styles.gridMobile]}>
        {cardData.map((card, idx) => (
          <View key={card.label} style={[styles.card, { borderLeftColor: card.color }]}> 
            <View style={[styles.cardAccent, { backgroundColor: card.color }]} />
            <Text style={styles.label}>{card.label}</Text>
            <Text style={styles.value}>{card.value}</Text>
            <Text style={styles.sub}>{card.sub}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'nowrap', // kartlar tek satırda ve taşarsa scroll
    justifyContent: 'space-between',
    gap: 18,
    marginBottom: 8,
  },
  gridMobile: {
    flexDirection: 'row', // mobilde de yan yana
    flexWrap: 'nowrap',
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 0,
    minWidth: 320, // genişlik artırıldı
    maxWidth: 1,
    flex: 1,
    marginRight: 0,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    position: 'relative',
    justifyContent: 'center',
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 8,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 4,
    marginLeft: 12,
    fontWeight: '600',
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    marginLeft: 12,
    color: '#111827',
  },
  sub: {
    fontSize: 12,
    color: '#888',
    marginLeft: 12,
  },
});

export default NutritionTracker;
