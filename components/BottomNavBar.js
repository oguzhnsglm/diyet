import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

// Health Icon Component
const NavIcon = ({ name, size = 22, color = '#000' }) => {
  const iconPaths = {
    home: "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z",
    bloodsugar: "M12 21.35c-3.87-3.15-7-5.9-7-9.1C5 9.45 7.01 7.5 9.5 7.5c1.38 0 2.64.63 3.5 1.62.86-.99 2.12-1.62 3.5-1.62 2.49 0 4.5 1.95 4.5 4.75 0 3.2-3.13 5.95-7 9.1L12 21.35z",
    profile: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
    settings: "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={iconPaths[name]} fill={color} />
    </Svg>
  );
};

const screenWidth = Dimensions.get('window').width;

export default function BottomNavBar({ navigation, activeKey = 'Main' }) {
  const { isDarkMode, colors } = useTheme();
  const { t } = useLanguage();
  const [layoutWidth, setLayoutWidth] = useState(screenWidth - 20);
  const indicator = useRef(new Animated.Value(0)).current;

  const NAV_ITEMS = useMemo(() => [
    { key: 'Main', label: t('navBar.home'), icon: 'home', target: 'Main' },
    { key: 'BloodSugar', label: t('common.bloodSugar'), icon: 'bloodsugar', target: 'BloodSugar' },
    { key: 'Profile', label: t('common.profile'), icon: 'profile', target: 'Profile' },
    { key: 'Settings', label: t('common.settings'), icon: 'settings', target: 'Settings' },
  ], [t]);

  const itemWidth = useMemo(() => layoutWidth / NAV_ITEMS.length, [layoutWidth, NAV_ITEMS]);
  const activeIndex = useMemo(
    () => Math.max(0, NAV_ITEMS.findIndex((item) => item.key === activeKey)),
    [activeKey, NAV_ITEMS]
  );

  useEffect(() => {
    Animated.spring(indicator, {
      toValue: activeIndex * itemWidth,
      useNativeDriver: true,
      bounciness: 8,
      speed: 14,
    }).start();
  }, [activeIndex, itemWidth]);

  return (
    <View
      style={styles.wrapper}
      onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)}
      pointerEvents="box-none"
    >
      <View style={[styles.bar, { backgroundColor: isDarkMode ? '#1C1C1E' : '#ffffff' }]}>
        <Animated.View
          style={[
            styles.indicator,
            {
              width: itemWidth - 16,
              transform: [{ translateX: indicator }],
              backgroundColor: isDarkMode ? '#2C2C2E' : '#e5f7ef',
            },
          ]}
        />

        {NAV_ITEMS.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <Pressable
              key={item.key}
              style={[styles.item, { width: itemWidth }]}
              onPress={() => {
                if (item.target && navigation) {
                  // Ana Sayfa'ya basınca stack'in en üstüne dön
                  if (item.key === 'Main' && navigation.getState) {
                    const state = navigation.getState();
                    if (state.routes.length > 1) {
                      // Stack'te birden fazla ekran varsa en üste dön
                      navigation.popToTop();
                    }
                  } else if (navigation.navigate) {
                    navigation.navigate(item.target);
                  }
                }
              }}
            >
              <NavIcon 
                name={item.icon} 
                size={22} 
                color={isActive ? '#0ea5e9' : (isDarkMode ? '#8E8E93' : '#6b7280')} 
              />
              <Text style={[
                styles.label, 
                isActive ? styles.labelActive : null,
                { color: isActive ? '#0ea5e9' : (isDarkMode ? '#8E8E93' : '#6b7280') }
              ]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    alignItems: 'flex-start',
    justifyContent: 'center',
    zIndex: 50,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 6,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 450,
  },
  indicator: {
    position: 'absolute',
    left: 8,
    top: 6,
    bottom: 6,
    backgroundColor: '#e5f7ef',
    borderRadius: 16,
    zIndex: 0,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    zIndex: 1,
    paddingHorizontal: 2,
  },
  label: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '600',
  },
  labelActive: {
    color: '#0ea5e9',
  },
});
