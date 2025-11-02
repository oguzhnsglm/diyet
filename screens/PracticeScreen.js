import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
  PermissionsAndroid,
  Pressable,
} from 'react-native';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import WordCard from '../components/WordCard';
import RecordButton from '../components/RecordButton';
import evalPronunciation from '../logic/evalPronunciation';
import { usePractice } from '../context/PracticeContext';

const FINALIZE_DELAY = 500;
let VoiceModule = null;

export default function PracticeScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { levelId = 1 } = route.params ?? {};
  const { levels, setWordStatus } = usePractice();
  
  const level = levels.find(l => l.id === levelId) ?? levels[0];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [lastResult, setLastResult] = useState(null);

  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const latestTextRef = useRef('');

  const currentWord = level.words[currentIndex] ?? level.words[0];

  const clearSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const finalizeRecognition = useCallback(
    (text) => {
      clearSilenceTimer();
      const clean = text?.trim();
      if (!clean || lastResult?.heard === clean) {
        return;
      }
      setIsRecording(false);
      const { score, isSuccessful } = evalPronunciation(currentWord, clean);
      const result = { word: currentWord, heard: clean, score, isSuccessful };
      setLastResult(result);
    },
    [clearSilenceTimer, currentWord, lastResult],
  );

  const scheduleFinalize = useCallback(
    (text) => {
      const clean = text?.trim();
      clearSilenceTimer();
      if (!clean) {
        return;
      }
      silenceTimerRef.current = setTimeout(() => {
        finalizeRecognition(clean);
      }, FINALIZE_DELAY);
    },
    [clearSilenceTimer, finalizeRecognition],
  );

  useEffect(() => {
    if (Platform.OS !== 'web') {
      try {
        VoiceModule = require('@react-native-voice/voice').default;
      } catch (error) {
        VoiceModule = null;
      }
    }

    if (Platform.OS !== 'web' && VoiceModule) {
      VoiceModule.onSpeechResults = (event) => {
        const transcript = event.value?.[0] ?? '';
        latestTextRef.current = transcript;
        setRecognizedText(transcript);
        scheduleFinalize(transcript);
      };

      VoiceModule.onSpeechPartialResults = (event) => {
        const transcript = event.value?.[0] ?? '';
        latestTextRef.current = transcript;
        setRecognizedText(transcript);
        scheduleFinalize(transcript);
      };

      VoiceModule.onSpeechError = () => {
        Alert.alert('Dinleme Hatası', 'Lütfen tekrar deneyin.');
        setIsRecording(false);
      };

      VoiceModule.onSpeechEnd = () => {
        setIsRecording(false);
        scheduleFinalize(latestTextRef.current || recognizedText);
      };
    }

    return () => {
      if (Platform.OS !== 'web' && VoiceModule) {
        VoiceModule.destroy().catch(() => {});
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch {}
      }
      clearSilenceTimer();
    };
  }, [clearSilenceTimer, recognizedText, scheduleFinalize]);

  const liveEval = useMemo(() => {
    if (!recognizedText) {
      return null;
    }
    const { score, isSuccessful } = evalPronunciation(currentWord, recognizedText);
    return { score, isSuccessful };
  }, [recognizedText, currentWord]);

  useFocusEffect(
    useCallback(() => {
      // Kelime index'ini güncelle
      if (typeof route.params?.wordIndex === 'number') {
        setCurrentIndex(route.params.wordIndex);
      }
      
      // State'leri temizle
      setRecognizedText('');
      latestTextRef.current = '';
      setLastResult(null);
      setIsRecording(false);
      clearSilenceTimer();
      
      // VoiceModule event listener'larını yeniden kur (mobil için)
      if (Platform.OS !== 'web' && VoiceModule) {
        VoiceModule.onSpeechResults = (event) => {
          const transcript = event.value?.[0] ?? '';
          latestTextRef.current = transcript;
          setRecognizedText(transcript);
          scheduleFinalize(transcript);
        };

        VoiceModule.onSpeechPartialResults = (event) => {
          const transcript = event.value?.[0] ?? '';
          latestTextRef.current = transcript;
          setRecognizedText(transcript);
          scheduleFinalize(transcript);
        };

        VoiceModule.onSpeechError = () => {
          Alert.alert('Dinleme Hatası', 'Lütfen tekrar deneyin.');
          setIsRecording(false);
        };

        VoiceModule.onSpeechEnd = () => {
          setIsRecording(false);
          scheduleFinalize(latestTextRef.current || recognizedText);
        };
      }
      
      return () => {
        // Cleanup: Ekrandan çıkarken kayıtları durdur
        clearSilenceTimer();
        if (Platform.OS !== 'web' && VoiceModule) {
          VoiceModule.destroy().catch(() => {});
        }
      };
    }, [route.params?.wordIndex, scheduleFinalize, clearSilenceTimer]),
  );

  const startRecording = async () => {
    try {
      setRecognizedText('');
      latestTextRef.current = '';
      clearSilenceTimer();
      setLastResult(null);

      if (Platform.OS === 'web') {
        const SpeechRecognition =
          window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
          Alert.alert('Desteklenmiyor', 'Tarayıcı konuşma tanımayı desteklemiyor.');
          return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'tr-TR';
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognitionRef.current = recognition;

        recognition.onresult = (event) => {
          const lastIndex = event.results?.length ? event.results.length - 1 : 0;
          const result = event.results?.[lastIndex];
          const transcript = result?.[0]?.transcript ?? '';
          latestTextRef.current = transcript;
          setRecognizedText(transcript);
          scheduleFinalize(transcript);
        };

        recognition.onerror = () => {
          Alert.alert('Dinleme Hatası', 'Lütfen tekrar deneyin.');
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
          scheduleFinalize(latestTextRef.current || recognizedText);
        };

        recognition.start();
        setIsRecording(true);
      } else if (VoiceModule) {
        if (Platform.OS === 'android') {
          try {
            await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
          } catch {}
        }
        await VoiceModule.start('tr-TR');
        setIsRecording(true);
      } else {
        Alert.alert(
          'Gerekli modül bulunamadı',
          'Lütfen development build ile çalıştırın. (npx expo prebuild && npx expo run:android)',
        );
      }
    } catch (error) {
      setIsRecording(false);
      Alert.alert('Kayıt Başlatılamadı', 'Tekrar denemek için lütfen butona bas.');
    }
  };

  const stopRecording = async () => {
    if (!isRecording) {
      return;
    }
    try {
      if (Platform.OS === 'web') {
        recognitionRef.current?.stop();
      } else if (VoiceModule) {
        await VoiceModule.stop();
      }
    } catch {}
    setIsRecording(false);
    scheduleFinalize(latestTextRef.current || recognizedText);
  };

  const handleRecordPress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const resetForRetry = async () => {
    clearSilenceTimer();
    setRecognizedText('');
    latestTextRef.current = '';
    setLastResult(null);
    // Kısa bir gecikme sonra kaydı başlat
    setTimeout(() => {
      startRecording();
    }, 100);
  };

  const goToNextWord = () => {
    // Mevcut kelimenin sonucunu context'e kaydet
    if (lastResult) {
      setWordStatus(levelId, currentIndex, lastResult.isSuccessful ? 'success' : 'fail');
    }
    
    const nextIndex = currentIndex + 1;
    
    // Tüm kelimeler bitti mi kontrol et
    if (nextIndex >= level.words.length) {
      // Bölüm tamamlandı, sonuç ekranına git
      navigation.navigate('Result', {
        levelId: levelId,
        levelTitle: level.title,
      });
      return;
    }
    
    setCurrentIndex(nextIndex);
    resetForRetry();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Konuşma Pratiği</Text>
      <Text style={styles.progress}>
        Kelime {currentIndex + 1} / {level.words.length}
      </Text>
      <WordCard
        word={currentWord}
        subText={recognizedText}
        subTextStyle={[
          styles.heardText,
          recognizedText
            ? liveEval?.isSuccessful
              ? styles.correct
              : styles.incorrect
            : null,
        ]}
      />
      <Text style={styles.instruction}>Şimdi bu kelimeyi söyle</Text>

      {!recognizedText && (
        <>
          <RecordButton isRecording={isRecording} onPress={handleRecordPress} disabled={false} />
          <Text style={styles.hint}>Kaydı bitirmek için butona tekrar dokun.</Text>
        </>
      )}

      {recognizedText && (
        <View style={styles.inlineResult}>
          <Text
            style={[
              styles.resultMsg,
              liveEval?.isSuccessful ? styles.correct : styles.incorrect,
            ]}
          >
            {liveEval?.isSuccessful ? 'Harika söyledin! 🎉' : 'Neredeyse oldu, tekrar deneyelim 💪'}
          </Text>
          <View style={styles.inlineButtons}>
            <InlineButton label="Tekrarla" variant="secondary" onPress={resetForRetry} />
            <InlineButton label="Sonraki Kelime" variant="primary" onPress={goToNextWord} />
          </View>
        </View>
      )}
    </View>
  );
}

function InlineButton({ label, onPress, variant = 'primary' }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.inlineBtn,
        variant === 'primary' ? styles.primary : styles.secondary,
        pressed && styles.pressed,
      ]}
    >
      <Text style={styles.inlineLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6FAFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  header: {
    fontSize: 34,
    fontWeight: '800',
    color: '#3D315B',
    letterSpacing: 0.5,
  },
  progress: {
    fontSize: 18,
    fontWeight: '600',
    color: '#7059FF',
    marginTop: -12,
  },
  instruction: {
    fontSize: 22,
    color: '#3D315B',
    textAlign: 'center',
  },
  hint: {
    fontSize: 16,
    color: '#3D315B',
    opacity: 0.7,
    textAlign: 'center',
  },
  heardText: {},
  correct: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  incorrect: {
    color: '#C62828',
    fontWeight: '700',
  },
  inlineResult: {
    alignItems: 'center',
    gap: 12,
  },
  resultMsg: {
    fontSize: 20,
    textAlign: 'center',
  },
  inlineButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  inlineBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 2,
  },
  primary: {
    backgroundColor: '#A3CEF1',
    borderColor: '#6096BA',
  },
  secondary: {
    backgroundColor: '#E8E4F2',
    borderColor: '#C2BBF0',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  inlineLabel: {
    fontSize: 18,
    color: '#3D315B',
    fontWeight: '600',
  },
});

