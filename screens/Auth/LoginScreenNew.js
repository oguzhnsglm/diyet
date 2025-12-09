import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AuthTextInput from '../../components/auth/AuthTextInput';
import AuthButton from '../../components/auth/AuthButton';

const STRINGS = {
  title: 'Giriş yap',
  emailPlaceholder: 'Email veya kullanıcı adı',
  passwordPlaceholder: 'Şifre',
  forgotPassword: 'Şifremi unuttum',
  login: 'Giriş yap',
  noAccount: 'Hesabın yok mu? ',
  register: 'Kaydol',
};

export default function LoginScreenNew() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);

  const canSubmit = email.trim().length > 0 && password.length >= 6;

  const handleLogin = () => {
    if (!canSubmit) return;
    // TODO: backend login entegrasyonu
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>{STRINGS.title}</Text>

          <AuthTextInput
            label="Email"
            placeholder={STRINGS.emailPlaceholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <AuthTextInput
            label="Şifre"
            placeholder={STRINGS.passwordPlaceholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secure}
            toggleSecureEntry={() => setSecure(!secure)}
          />

          <View style={styles.forgotRow}>
            <Pressable>
              <Text style={styles.forgotText}>{STRINGS.forgotPassword}</Text>
            </Pressable>
          </View>

          <AuthButton
            label={STRINGS.login}
            onPress={handleLogin}
            disabled={!canSubmit}
          />

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>{STRINGS.noAccount}</Text>
            <Pressable onPress={() => navigation.navigate('RegisterStepOne')}>
              <Text style={styles.bottomLink}>{STRINGS.register}</Text>
            </Pressable>
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
    fontSize: 26,
    fontWeight: '800',
    color: '#e5f2ff',
    textAlign: 'center',
    marginBottom: 24,
  },
  forgotRow: {
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  forgotText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },
  bottomText: {
    color: '#9ca3af',
    fontSize: 13,
  },
  bottomLink: {
    color: '#38bdf8',
    fontSize: 13,
    fontWeight: '600',
  },
});
