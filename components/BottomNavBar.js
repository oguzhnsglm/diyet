import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

// Health Icon Component
const NavIcon = ({ name, size = 22, color = '#000' }) => {
  const iconPaths = {
    diary: "M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z",
    recipes: "M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z",
    fasting: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z",
    profile: "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
  };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={iconPaths[name]} fill={color} />
    </Svg>
  );
};

const NAV_ITEMS = [
  { key: 'Main', label: 'Diary', icon: 'diary', target: 'Main' },
  { key: 'HealthyRecipes', label: 'Recipes', icon: 'recipes', target: 'HealthyRecipes' },
  { key: 'DietPlan', label: 'Fasting', icon: 'fasting', target: 'DietPlan' },
  { key: 'Profile', label: 'Profile', icon: 'profile', target: 'Profile' },
];

const screenWidth = Dimensions.get('window').width;

export default function BottomNavBar({ navigation, activeKey = 'Main' }) {
  const [layoutWidth, setLayoutWidth] = useState(screenWidth - 20);
  const indicator = useRef(new Animated.Value(0)).current;

  const itemWidth = useMemo(() => layoutWidth / NAV_ITEMS.length, [layoutWidth]);
  const activeIndex = useMemo(
    () => Math.max(0, NAV_ITEMS.findIndex((item) => item.key === activeKey)),
    [activeKey]
  );

  useEffect(() => {
    Animated.spring(indicator, {
      toValue: activeIndex * itemWidth,
      useNativeDriver: false,
      bounciness: 8,
      speed: 14,
    }).start();
  }, [activeIndex, indicator, itemWidth]);

  return (
    <View
      style={styles.wrapper}
      onLayout={(e) => setLayoutWidth(e.nativeEvent.layout.width)}
      pointerEvents="box-none"
    >
      <View style={styles.bar}>
        <Animated.View
          style={[
            styles.indicator,
            {
              width: itemWidth - 16,
              transform: [{ translateX: indicator }],
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
                if (item.target && navigation?.navigate) {
                  navigation.navigate(item.target);
                }
              }}
            >
              <NavIcon 
                name={item.icon} 
                size={22} 
                color={isActive ? '#0ea5e9' : '#6b7280'} 
              />
              <Text style={[styles.label, isActive ? styles.labelActive : null]}>{item.label}</Text>
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
    alignItems: 'center',
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
    width: '96%',
    maxWidth: 420,
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
