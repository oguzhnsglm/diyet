import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AuthTextInput from '../../components/auth/AuthTextInput';
import AuthButton from '../../components/auth/AuthButton';

const GOAL_OPTIONS = [
  'Kilo verme',
  'Kilo alma',
  'Formu koruma',
  'Tip 1 şeker hastalığı takibi',
  'Tip 2 şeker hastalığı takibi',
  'Şekersiz şeker hastalığı takibi',
];

const STRINGS = {
  title: 'Kaydol',
  question: 'Bu uygulamayı kullanma amacın nedir?',
  complete: 'Kaydı tamamla',
  email: 'Email',
  password: 'Şifre',
  passwordAgain: 'Şifre tekrar',
};

export default function RegisterStepTwoScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { userBasicData } = route.params || {};

  const [selectedGoals, setSelectedGoals] = useState([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');
  const [secure, setSecure] = useState(true);
  const [secureAgain, setSecureAgain] = useState(true);

  const toggleGoal = (goal) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const hasValidGoals = selectedGoals.length > 0;
  const validPassword = password.length >= 6 && password === passwordAgain;
  const canSubmit = hasValidGoals && validPassword && email.trim().length > 0;

  const handleContinueToWizard = () => {
    if (!canSubmit || !userBasicData) return;

    const onboardingSetup = {
      basic: userBasicData,
      goals: selectedGoals,
      authDraft: {
        email: email.trim(),
        password,
      },
    };

    navigation.navigate('QuestionWizard', { onboardingSetup });
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
          <Text style={styles.question}>{STRINGS.question}</Text>

          <View style={styles.goalsContainer}>
            {GOAL_OPTIONS.map((goal) => {
              const isSelected = selectedGoals.includes(goal);
              return (
                <Pressable
                  key={goal}
                  onPress={() => toggleGoal(goal)}
                  style={[
                    styles.goalChip,
                    isSelected && styles.goalChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.goalText,
                      isSelected && styles.goalTextSelected,
                    ]}
                  >
                    {goal}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <AuthTextInput
            label={STRINGS.email}
            placeholder="ornek@posta.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />

          <AuthTextInput
            label={STRINGS.password}
            placeholder="En az 6 karakter"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secure}
            toggleSecureEntry={() => setSecure(!secure)}
          />

          <AuthTextInput
            label={STRINGS.passwordAgain}
            placeholder="Şifreyi tekrar gir"
            value={passwordAgain}
            onChangeText={setPasswordAgain}
            secureTextEntry={secureAgain}
            toggleSecureEntry={() => setSecureAgain(!secureAgain)}
          />

          <AuthButton
            label={STRINGS.complete}
            onPress={handleContinueToWizard}
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
    marginBottom: 12,
  },
  question: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 16,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  goalChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
    backgroundColor: '#020617',
  },
  goalChipSelected: {
    backgroundColor: '#38bdf8',
    borderColor: '#38bdf8',
  },
  goalText: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '600',
  },
  goalTextSelected: {
    color: '#0f172a',
  },
});
