import React, { useEffect, useMemo, useRef } from 'react';
import { Pressable, Text, StyleSheet, View, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function RecordButton({ isRecording, onPress, disabled }) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const loopRef = useRef(null);

  useEffect(() => {
    if (isRecording) {
      loopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1,
            duration: 650,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 0,
            duration: 650,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      loopRef.current.start();
    } else {
      if (loopRef.current) {
        loopRef.current.stop();
        loopRef.current = null;
      }
      pulse.setValue(0);
    }

    return () => {
      if (loopRef.current) {
        loopRef.current.stop();
        loopRef.current = null;
      }
    };
  }, [isRecording, pulse]);

  const animatedScaleStyle = useMemo(
    () => ({
      transform: [{ scale: pressScale }],
    }),
    [pressScale],
  );

  const pulseStyle = useMemo(
    () => ({
      transform: [
        {
          scale: pulse.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.08],
          }),
        },
      ],
      opacity: pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.25, 0.6],
      }),
    }),
    [pulse],
  );

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.94,
      useNativeDriver: true,
      speed: 16,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 16,
      bounciness: 6,
    }).start();
  };

  return (
    <Animated.View style={[styles.wrapper, animatedScaleStyle]}>
      <Animated.View style={[styles.pulseRing, pulseStyle]} pointerEvents="none" />
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={({ pressed }) => [
          styles.pressable,
          pressed && !disabled ? styles.pressed : null,
          disabled ? styles.disabled : null,
        ]}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={isRecording ? 'Kaydi durdur' : 'Kaydi baslat'}
      >
        <LinearGradient
          colors={isRecording ? ['#ff6f91', '#f72585'] : ['#7367f0', '#b388ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.innerCircle}>
            <Text style={styles.icon}>{isRecording ? 'STOP' : 'MIC'}</Text>
          </View>
          <Text style={styles.label}>{isRecording ? 'Yeniden Dene' : 'Dinlemeyi Baslat'}</Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressable: {
    borderRadius: 40,
    overflow: 'hidden',
    minWidth: 230,
    shadowColor: '#5a33d6',
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  gradient: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 36,
    gap: 16,
  },
  pulseRing: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: '#c7a6ff',
    zIndex: -1,
  },
  pressed: {
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.45,
  },
  innerCircle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#5a33d6',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  icon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#42186e',
  },
  label: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.6,
  },
});

