import React, { useEffect, useRef } from 'react';
import { SafeAreaView, View, Text, Animated, StyleSheet } from 'react-native';
import { colors } from '../styles';

// React Native sürümü: 2 sn sonra fadeOut başlayıp 1 sn'de kaybolur.
const SplashScreen = ({ onFinish }) => {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -10,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    }, 2000);

    const hideTimer = setTimeout(() => {
      onFinish && onFinish();
    }, 3000);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, [onFinish, opacity, translateY]);

  return (
    <SafeAreaView style={styles.wrapper}>
      <Animated.View style={[styles.card, { opacity, transform: [{ translateY }] }]}>
        <Text style={styles.title}>Hoş Geldin!</Text>
        <Text style={styles.subtitle}>Diyetisyen Uygulamasına hoş geldiniz.</Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4F6F9',
  },
  card: {
    width: '80%',
    paddingVertical: 40,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 30,
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: colors.primary,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#4A4A4A',
  },
});

export default SplashScreen;