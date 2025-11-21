import React, { useRef } from 'react';
import { Animated, Text, TouchableWithoutFeedback, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../styles';

const usePulseAnimation = () => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return { scale, onPressIn, onPressOut };
};

export const SummaryCard = ({ title, value, subtitle, danger }) => {
  return (
    <View style={[
      styles.card, 
      styles.glassCard,
      danger && { 
        backgroundColor: '#FFEBEE', 
        borderColor: '#EF9A9A',
        borderWidth: 1.5 
      }
    ]}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={[styles.cardValue, danger && styles.cardValueDanger]}>{value}</Text>
      {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
    </View>
  );
};

export const PrimaryButton = ({ label, onPress, variant = 'primary', style }) => {
  const { scale, onPressIn, onPressOut } = usePulseAnimation();
  const isOutline = variant === 'outline';

  return (
    <TouchableWithoutFeedback onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress}>
      <Animated.View
        style={[
          styles.button,
          isOutline && styles.buttonOutline,
          { transform: [{ scale }] },
          style,
        ]}
      >
        <Text style={[styles.buttonText, isOutline && styles.buttonTextOutline]}>{label}</Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export const MealTypeSelector = ({ value, onChange }) => {
  const options = [
    { key: 'kahvaltı', label: 'Kahvaltı' },
    { key: 'öğle', label: 'Öğle' },
    { key: 'akşam', label: 'Akşam' },
    { key: 'ara', label: 'Ara öğün' },
  ];

  return (
    <View style={styles.mealTypeRow}>
      {options.map((opt) => (
        <PrimaryButton
          key={opt.key}
          label={opt.label}
          variant={value === opt.key ? 'primary' : 'outline'}
          onPress={() => onChange(opt.key)}
          style={[
                    {
              paddingHorizontal: 12,
              paddingVertical: 10,
              marginTop: 0,
              marginBottom: 0,
              marginRight: 6,
            },
          ]}
        />
      ))}
    </View>
  );
};
