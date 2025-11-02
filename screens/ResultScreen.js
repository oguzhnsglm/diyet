import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { usePractice } from '../context/PracticeContext';

export default function ResultScreen({ navigation, route }) {
  const { levelId = 1, levelTitle = '' } = route.params ?? {};
  const { levels } = usePractice();
  
  const level = levels.find(l => l.id === levelId) ?? levels[0];

  // Başarı istatistiklerini hesapla
  const stats = useMemo(() => {
    const totalWords = level.words.length;
    const correctCount = level.progress.filter(status => status === 'success').length;
    const incorrectCount = level.progress.filter(status => status === 'fail').length;
    const successRate = totalWords > 0 ? Math.round((correctCount / totalWords) * 100) : 0;
    
    return {
      correctCount,
      incorrectCount,
      successRate,
      totalWords,
    };
  }, [level]);

  const handleGoToLevels = () => {
    navigation.navigate('Levels');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>🎉 Bölüm Tamamlandı!</Text>
      
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Başarı Oranı</Text>
        <Text style={styles.successRate}>{stats.successRate}%</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.correctCount}</Text>
            <Text style={[styles.statLabel, styles.correct]}>Doğru</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.incorrectCount}</Text>
            <Text style={[styles.statLabel, styles.incorrect]}>Yanlış</Text>
          </View>
        </View>
      </View>

      <View style={styles.wordsListCard}>
        <Text style={styles.wordsListTitle}>Kelime Listesi</Text>
        {level.words.map((word, index) => {
          const status = level.progress[index];
          const isSuccessful = status === 'success';
          const isFailed = status === 'fail';
          
          if (!status || status === 'pending') return null;
          
          return (
            <View
              key={index}
              style={[
                styles.wordItem,
                isSuccessful ? styles.wordItemSuccess : styles.wordItemFail,
              ]}
            >
              <View style={styles.wordItemLeft}>
                <Text style={styles.wordItemIcon}>
                  {isSuccessful ? '✓' : '✗'}
                </Text>
                <Text style={styles.wordItemWord}>{word}</Text>
              </View>
              <Text style={styles.wordItemHeard}>
                {isSuccessful ? 'Başarılı' : 'Başarısız'}
              </Text>
            </View>
          );
        })}
      </View>

      <Pressable
        onPress={handleGoToLevels}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.buttonLabel}>Bölümler Sayfasına Git</Text>
      </Pressable>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F6FAFF',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
    gap: 32,
  },
  header: {
    fontSize: 36,
    fontWeight: '800',
    color: '#3D315B',
    textAlign: 'center',
  },
  statsCard: {
    backgroundColor: '#FFF',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E0D4F7',
    alignItems: 'center',
    gap: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  statsTitle: {
    fontSize: 18,
    color: '#3D315B',
    opacity: 0.7,
    fontWeight: '600',
  },
  successRate: {
    fontSize: 64,
    fontWeight: '800',
    color: '#7059FF',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 32,
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3D315B',
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  correct: {
    color: '#2E7D32',
  },
  incorrect: {
    color: '#C62828',
  },
  wordsListCard: {
    backgroundColor: '#FFF',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#E0D4F7',
    width: '100%',
    maxWidth: 400,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  wordsListTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3D315B',
    marginBottom: 8,
  },
  wordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  wordItemSuccess: {
    backgroundColor: '#E8F5E9',
    borderColor: '#81C784',
  },
  wordItemFail: {
    backgroundColor: '#FFEBEE',
    borderColor: '#E57373',
  },
  wordItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  wordItemIcon: {
    fontSize: 20,
    fontWeight: '700',
  },
  wordItemWord: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3D315B',
  },
  wordItemHeard: {
    fontSize: 16,
    color: '#3D315B',
    opacity: 0.7,
    fontStyle: 'italic',
  },
  button: {
    width: '100%',
    maxWidth: 400,
    paddingVertical: 18,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: '#7059FF',
    borderColor: '#5A44CC',
    alignItems: 'center',
    shadowColor: '#7059FF',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  buttonLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
});

