import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import PepperMascot from '../../components/auth/PepperMascot';
import AuthButton from '../../components/auth/AuthButton';
import { buildActiveQuestions } from '../../logic/onboardingQuestions';

const ANSWER_OPTIONS = [
  { key: 'yes', label: 'Evet' },
  { key: 'no', label: 'Hayır' },
  { key: 'unsure', label: 'Emin değilim' },
];

export default function QuestionWizardScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { onboardingSetup } = route.params || {};

  const questions = useMemo(
    () => buildActiveQuestions(onboardingSetup?.goals || []),
    [onboardingSetup]
  );

  const total = questions.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [pendingAnswer, setPendingAnswer] = useState(null);

  const currentQuestion = questions[currentIndex];

  const handleSelectAnswer = (key) => {
    setPendingAnswer(key);
  };

  const handleContinue = () => {
    if (!currentQuestion || !pendingAnswer) return;

    const nextAnswers = {
      ...answers,
      [currentQuestion.id]: {
        question: currentQuestion.text,
        category: currentQuestion.category,
        answer: pendingAnswer,
      },
    };
    setAnswers(nextAnswers);
    setPendingAnswer(null);

    const nextIndex = currentIndex + 1;
    if (nextIndex < total) {
      setCurrentIndex(nextIndex);
    } else {
      const onboardingAnswers = nextAnswers;

      navigation.navigate('CreateAccount', {
        onboardingFinal: {
          basic: onboardingSetup?.basic,
          goals: onboardingSetup?.goals,
          authDraft: onboardingSetup?.authDraft,
          answers: onboardingAnswers,
        },
      });
    }
  };

  const progress = total > 0 ? (currentIndex + 1) / total : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { flex: progress }]} />
          <View style={{ flex: 1 - progress }} />
        </View>

        <View style={styles.topRow}>
          <PepperMascot />
          <View style={styles.speechBubbleWrapper}>
            <View style={styles.speechBubble}>
              <Text style={styles.speechText}>
                {currentQuestion?.text || 'Sorular hazırlanıyor...'}
              </Text>
            </View>
            {total > 0 && (
              <Text style={styles.progressText}>
                {currentIndex + 1} / {total} soru
              </Text>
            )}
          </View>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.optionsContainer}
          keyboardShouldPersistTaps="handled"
        >
          {ANSWER_OPTIONS.map((option) => {
            const isSelected = pendingAnswer === option.key;
            return (
              <Pressable
                key={option.key}
                onPress={() => handleSelectAnswer(option.key)}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected,
                ]}
              >
                <Text
                  style={[
                    styles.optionLabel,
                    isSelected && styles.optionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.bottomBar}>
          <View style={{ flex: 1 }} />
          <View style={{ width: 160 }}>
            <AuthButton
              label={currentIndex + 1 === total ? 'Bitir' : 'Devam et'}
              onPress={handleContinue}
              disabled={!pendingAnswer || !currentQuestion}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020617',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  progressBarBackground: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 999,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1f2937',
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    backgroundColor: '#38bdf8',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  speechBubbleWrapper: {
    flex: 1,
    marginLeft: 12,
  },
  speechBubble: {
    backgroundColor: '#0b1723',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1f2937',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  speechText: {
    color: '#e5f2ff',
    fontSize: 14,
  },
  progressText: {
    marginTop: 6,
    color: '#64748b',
    fontSize: 12,
  },
  scroll: {
    flex: 1,
  },
  optionsContainer: {
    paddingTop: 4,
    paddingBottom: 16,
  },
  optionCard: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1f2937',
    backgroundColor: '#020617',
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  optionCardSelected: {
    backgroundColor: '#1d4ed8',
    borderColor: '#1d4ed8',
  },
  optionLabel: {
    color: '#e5e7eb',
    fontSize: 15,
    fontWeight: '600',
  },
  optionLabelSelected: {
    color: '#e5f2ff',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
});
