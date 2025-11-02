import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

const heroIllustration =
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80';

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <LinearGradient colors={['#f6f0ff', '#efe6ff', '#f7f5ff']} style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text style={styles.badge}>Cocuk Dostu Telaffuz</Text>
          <Text style={styles.title}>Kelime macerasina hazir misin?</Text>
          <Text style={styles.subtitle}>
            Eglenceli konusma pratigi, renkli geri bildirimler ve adim adim ilerleme.
          </Text>
          <View style={styles.buttonRow}>
            <GradientButton
              label="Konusma Pratigine Basla"
              onPress={() => navigation.navigate('Levels')}
              size="large"
            />
            <GradientButton
              label="Giris Yap"
              colors={['rgba(255,255,255,0.9)', 'rgba(232,224,255,0.9)']}
              textColor="#5633a5"
              onPress={() => navigation.navigate('Login')}
            />
          </View>
        </View>
        <View style={styles.illustrationWrapper}>
          <LinearGradient
            colors={['rgba(130,106,255,0.25)', 'rgba(182,147,255,0.15)']}
            style={styles.illustrationBorder}
          >
            <Image source={{ uri: heroIllustration }} style={styles.heroImage} />
          </LinearGradient>
        </View>
      </View>

      <View style={styles.ctaRow}>
        <GradientButton
          label="Hemen Kayit Ol"
          onPress={() => navigation.navigate('Register')}
          size="large"
        />
      </View>
    </LinearGradient>
  );
}

function GradientButton({ label, onPress, colors = ['#7059ff', '#ae7bff'], textColor = '#fff', size = 'medium' }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.buttonShell, pressed && styles.buttonPressed]}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.button, size === 'large' ? styles.buttonLarge : styles.buttonMedium]}
      >
        <Text style={[styles.buttonLabel, { color: textColor }]}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  hero: {
    flex: 1,
    flexDirection: 'row',
    gap: 32,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroText: {
    flex: 1,
    gap: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(112, 89, 255, 0.15)',
    color: '#5c3cd6',
    fontWeight: '700',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#2f184f',
    letterSpacing: 0.8,
  },
  subtitle: {
    fontSize: 18,
    color: '#4d3778',
    lineHeight: 26,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  illustrationWrapper: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#6a44df',
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  illustrationBorder: {
    width: '100%',
    height: '100%',
    borderRadius: 110,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  buttonShell: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 18,
    shadowColor: '#5c3cd6',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  buttonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 28,
  },
  buttonMedium: {},
  buttonLabel: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.4,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.92,
  },
  ctaRow: {
    marginTop: 36,
    alignItems: 'center',
  },
});
