import React from 'react';
import { Pressable, Text, StyleSheet, View } from 'react-native';

export function SocialButton({ label, icon, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <View style={styles.iconPlaceholder}>{icon}</View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#1f2937',
    margin: 4,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  iconPlaceholder: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  label: {
    color: '#e5e7eb',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default SocialButton;
