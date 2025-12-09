import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AuthButton from '../../components/auth/AuthButton';
import SocialButton from '../../components/auth/SocialButton';

const STRINGS = {
  title: 'Giriş yap',
  subtitle: 'Diyet ve şeker takibini akıllı asistanınla yönet.',
  login: 'Giriş yap',
  register: 'Kaydol',
  or: 'veya',
  continueWith: 'Şununla devam et',
};

export default function AuthHomeScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        bounces={false}
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>β</Text>
          </View>
          <Text style={styles.logoSubtitle}>Gliko Asistan</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>{STRINGS.title}</Text>
          <Text style={styles.subtitle}>{STRINGS.subtitle}</Text>

          <View style={styles.buttonGroup}>
            <AuthButton
              label={STRINGS.login}
              onPress={() => navigation.navigate('LoginScreen')}
            />
            <AuthButton
              label={STRINGS.register}
              variant="secondary"
              onPress={() => navigation.navigate('RegisterStepOne')}
            />
          </View>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.orText}>{STRINGS.or}</Text>
            <View style={styles.divider} />
          </View>

          <Text style={styles.continueText}>{STRINGS.continueWith}</Text>

          <View style={styles.socialGrid}>
            <SocialButton label="iCloud" icon={<Text style={styles.iconText}>☁️</Text>} />
            <SocialButton label="Google" icon={<Text style={styles.iconText}>G</Text>} />
            <SocialButton label="Discord" icon={<Text style={styles.iconText}>D</Text>} />
            <SocialButton label="Facebook" icon={<Text style={styles.iconText}>f</Text>} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#0ea5e9',
    shadowOpacity: 0.3,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  logoText: {
    color: '#38bdf8',
    fontSize: 36,
    fontWeight: '800',
  },
  logoSubtitle: {
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#020617',
    borderRadius: 32,
    paddingVertical: 28,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: '#1e293b',
    shadowColor: '#0f172a',
    shadowOpacity: 0.8,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 30 },
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#e5f2ff',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  buttonGroup: {
    marginBottom: 16,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#111827',
  },
  orText: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  continueText: {
    color: '#6b7280',
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  socialGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 4,
  },
  iconText: {
    color: '#e5e7eb',
    fontSize: 13,
    fontWeight: '700',
  },
});
