import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AuthTextInput from '../../components/auth/AuthTextInput';
import AuthButton from '../../components/auth/AuthButton';
import { supabase } from '../../lib/supabase';

export default function CreateAccountScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { onboardingFinal } = route.params || {};

  const [email, setEmail] = useState(onboardingFinal?.authDraft?.email || '');
  const [password, setPassword] = useState(onboardingFinal?.authDraft?.password || '');
  const [passwordAgain, setPasswordAgain] = useState(onboardingFinal?.authDraft?.password || '');
  const [secure, setSecure] = useState(true);
  const [secureAgain, setSecureAgain] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const emailValid = email.includes('@');
  const passwordValid = password.length >= 6 && password === passwordAgain;
  const canSubmit = emailValid && passwordValid && !submitting;

  const handleFinish = async () => {
    if (!canSubmit) return;

    const onboardingPayload = {
      basic: onboardingFinal?.basic,
      goals: onboardingFinal?.goals,
      answers: onboardingFinal?.answers,
      auth: {
        email: email.trim(),
        password,
      },
    };

    try {
      setSubmitting(true);

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: onboardingPayload.auth.email,
        password: onboardingPayload.auth.password,
        options: {
          data: {
            name: onboardingPayload.basic?.name,
            goals: onboardingPayload.goals,
          },
        },
      });

      if (signUpError) {
        console.warn('Supabase signUp error', signUpError);
        setSubmitting(false);
        return;
      }

      const userId = signUpData?.user?.id;

      if (userId) {
        try {
          await supabase.from('profiles').upsert({
            id: userId,
            name: onboardingPayload.basic?.name ?? null,
          });
        } catch (profileError) {
          console.warn('Supabase profile upsert error', profileError);
        }
      }

      navigation.replace('Main');
    } catch (e) {
      console.warn('CreateAccount error', e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.title}>Hesabını Oluştur</Text>

          <AuthTextInput
            label="Email"
            placeholder="ornek@posta.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <AuthTextInput
            label="Şifre"
            placeholder="En az 6 karakter"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secure}
            toggleSecureEntry={() => setSecure(!secure)}
          />

          <AuthTextInput
            label="Şifre tekrar"
            placeholder="Şifreyi tekrar gir"
            value={passwordAgain}
            onChangeText={setPasswordAgain}
            secureTextEntry={secureAgain}
            toggleSecureEntry={() => setSecureAgain(!secureAgain)}
          />

          <AuthButton
            label="Kaydı Tamamla"
            onPress={handleFinish}
            disabled={!canSubmit}
          />
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
});
