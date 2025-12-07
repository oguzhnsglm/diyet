import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

export default function RegisterScreen() {
  const navigation = useNavigation();

  return (
    <LinearGradient colors={['#f6f0ff', '#eae3ff']} style={styles.gradient}>
      {/* Medical Disclaimer Banner */}
      <View style={styles.disclaimerBanner}>
        <Text style={styles.disclaimerIcon}>⚠️</Text>
        <Text style={styles.disclaimerText}>
          Bu uygulama profesyonel tıbbi tavsiye değildir. Doktorunuza danışın.
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Sağlık Asistanına Hoş Geldin!</Text>
          <Text style={styles.subtitle}>
            Kan şekerini takip et, sağlıklı yaşa
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ad Soyad</Text>
            <TextInput
              style={styles.input}
              placeholder="Adınız Soyadınız"
              placeholderTextColor="#9a86c7"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-posta</Text>
            <TextInput
              style={styles.input}
              placeholder="ornek@posta.com"
              placeholderTextColor="#9a86c7"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Şifre</Text>
            <TextInput
              style={styles.input}
              placeholder="Güçlü bir şifre"
              placeholderTextColor="#9a86c7"
              secureTextEntry
            />
          </View>

          <Pressable style={styles.primaryButton}>
            <Text style={styles.primaryButtonLabel}>Kayıt Ol</Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Hesabın var mı? Giriş yap</Text>
          </Pressable>
        </View>

        <Pressable onPress={() => navigation.navigate('Home')} style={styles.backLinkWrapper}>
          <Text style={styles.backLink}>Ana sayfaya dön</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  disclaimerBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FEE2E2',
    borderBottomWidth: 2,
    borderBottomColor: '#DC2626',
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  disclaimerIcon: {
    fontSize: 20,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#991B1B',
    lineHeight: 18,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 28,
    gap: 18,
    shadowColor: '#6a44df',
    shadowOpacity: 0.2,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2f184f',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4a3274',
    textAlign: 'center',
    lineHeight: 22,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5d3dbd',
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(133, 112, 224, 0.35)',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    color: '#361c5c',
    fontSize: 16,
  },
  primaryButton: {
    marginTop: 12,
    borderRadius: 18,
    paddingVertical: 14,
    backgroundColor: '#6c63ff',
    alignItems: 'center',
  },
  primaryButtonLabel: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 17,
  },
  link: {
    color: '#5c3cd6',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 10,
  },
  backLinkWrapper: {
    marginTop: 24,
  },
  backLink: {
    color: '#5c3cd6',
    fontWeight: '600',
  },
});

