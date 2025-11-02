import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function WordCard({ word, subText, subTextStyle }) {
  return (
    <LinearGradient
      colors={['#f6e9ff', '#e5d0ff']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <Text style={styles.text}>{word}</Text>
        {subText ? <Text style={[styles.subText, subTextStyle]}>{subText}</Text> : null}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingVertical: 36,
    paddingHorizontal: 36,
    borderRadius: 32,
    shadowColor: '#6d3dd6',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 24,
    paddingVertical: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(147, 102, 255, 0.35)',
  },
  text: {
    fontSize: 50,
    fontWeight: '800',
    color: '#3D2A6E',
    letterSpacing: 2,
  },
  subText: {
    marginTop: 12,
    fontSize: 28,
    fontWeight: '700',
    color: '#3D2A6E',
  },
});

