import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';

const BackIcon = ({ size = 24, color = '#000' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill={color} />
  </Svg>
);

const BackButton = ({ navigation, style }) => {
  const { colors } = useTheme();

  const handlePress = () => {
    if (navigation && navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[styles.button, style]}
      android_ripple={{ color: colors.border, radius: 20 }}
    >
      <BackIcon size={24} color={colors.text} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BackButton;
