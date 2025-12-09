import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

export default function PepperMascot() {
  const bounce = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const bounceAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, {
          toValue: -6,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounce, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    const pulseAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.05,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    bounceAnim.start();
    pulseAnim.start();

    return () => {
      bounceAnim.stop();
      pulseAnim.stop();
    };
  }, [bounce, scale]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY: bounce },
            { scale },
          ],
        },
      ]}
    >
      <View style={styles.body}>
        <View style={styles.eyeRow}>
          <View style={styles.eye}>
            <View style={styles.pupil} />
          </View>
          <View style={styles.eye}>
            <View style={styles.pupil} />
          </View>
        </View>
        <View style={styles.mouthRow}>
          <View style={styles.mouth} />
        </View>
      </View>
      <View style={styles.shadow} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  body: {
    width: 72,
    height: 88,
    borderRadius: 40,
    backgroundColor: '#22c55e',
    borderWidth: 3,
    borderColor: '#16a34a',
    paddingTop: 16,
    paddingHorizontal: 10,
  },
  eyeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  eye: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pupil: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0f172a',
  },
  mouthRow: {
    alignItems: 'center',
    marginTop: 6,
  },
  mouth: {
    width: 28,
    height: 12,
    borderRadius: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    backgroundColor: '#0f172a',
  },
  shadow: {
    marginTop: 4,
    width: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0f172a33',
  },
});
