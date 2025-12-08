import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

const NAV_ITEMS = [
  { key: 'Main', label: 'Diary', icon: '📔', target: 'Main' },
  { key: 'HealthyRecipes', label: 'Recipes', icon: '👩‍🍳', target: 'HealthyRecipes' },
  { key: 'DietPlan', label: 'Fasting', icon: '⏱️', target: 'DietPlan' },
  { key: 'Profile', label: 'Profile', icon: '👤', target: 'Profile' },
];

const screenWidth = Dimensions.get('window').width;

export default function BottomNavBar({ navigation, activeKey = 'Main' }) {
  const [layoutWidth, setLayoutWidth] = useState(screenWidth - 48);
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
              <Text style={[styles.icon, isActive ? styles.iconActive : null]}>{item.icon}</Text>
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
    paddingHorizontal: 12,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    overflow: 'hidden',
    width: '90%',
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
  },
  icon: {
    fontSize: 18,
    color: '#6b7280',
  },
  iconActive: {
    color: '#0ea5e9',
  },
  label: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
  },
  labelActive: {
    color: '#0ea5e9',
  },
});
