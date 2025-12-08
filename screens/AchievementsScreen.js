import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getTodayGoalProgress, getAllAchievements } from '../logic/smartGoals';
import { getTodayHealthSummary } from '../logic/healthSync';
import { getTwinData } from '../logic/digitalTwin';

const { width } = Dimensions.get('window');

export default function AchievementsScreen({ navigation }) {
  const [achievements, setAchievements] = useState({ allBadges: [], availableBadges: [], streak: 0 });
  const [goalProgress, setGoalProgress] = useState(null);
  const [stats, setStats] = useState({ totalDays: 0, totalSteps: 0, totalCalories: 0 });
  const [scaleAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    loadData();
    
    // Giriş animasyonu
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, []);

  async function loadData() {
    try {
      const [achievementData, progress, healthSummary, twinData] = await Promise.all([
        getAllAchievements(),
        getTodayGoalProgress(),
        getTodayHealthSummary(),
        getTwinData(),
      ]);

      setAchievements(achievementData);
      setGoalProgress(progress);

      // İstatistikler
      const totalDays = twinData.glucoseHistory.length > 0 ? 
        Math.ceil((Date.now() - new Date(twinData.glucoseHistory[0].timestamp).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      setStats({
        totalDays,
        totalSteps: healthSummary.totalSteps || 0,
        totalCalories: healthSummary.totalCalories || 0,
      });
    } catch (error) {
      console.error('Load achievements error:', error);
    }
  }

  function getBadgeColor(badgeId) {
    if (badgeId.includes('streak')) return '#ef4444';
    if (badgeId.includes('walker')) return '#10b981';
    if (badgeId.includes('glucose')) return '#3b82f6';
    if (badgeId.includes('heart')) return '#ec4899';
    if (badgeId.includes('calorie')) return '#f59e0b';
    return '#8b5cf6';
  }

  function isBadgeUnlocked(badgeId) {
    return achievements.allBadges.some(b => b.id === badgeId);
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1e3a8a', '#3b82f6', '#60a5fa']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🏆 Başarılarım</Text>
        <Text style={styles.headerSubtitle}>Yolculuğundaki kazanımların</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Özet Kartlar */}
        <View style={styles.statsGrid}>
          <Animated.View style={[styles.statCard, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.statValue}>{achievements.allBadges.length}</Text>
            <Text style={styles.statLabel}>Rozet Kazandın</Text>
            <Text style={styles.statIcon}>🏆</Text>
          </Animated.View>

          <Animated.View style={[styles.statCard, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.statValue}>{achievements.streak}</Text>
            <Text style={styles.statLabel}>Günlük Seri</Text>
            <Text style={styles.statIcon}>🔥</Text>
          </Animated.View>

          <Animated.View style={[styles.statCard, { transform: [{ scale: scaleAnim }] }]}>
            <Text style={styles.statValue}>{stats.totalDays}</Text>
            <Text style={styles.statLabel}>Gün Geçti</Text>
            <Text style={styles.statIcon}>📅</Text>
          </Animated.View>
        </View>

        {/* Bugünkü İlerleme Özeti */}
        {goalProgress && (
          <View style={styles.progressSummary}>
            <Text style={styles.sectionTitle}>📊 Bugünkü İlerleme</Text>
            <View style={styles.progressCircleContainer}>
              <View style={styles.progressCircle}>
                <Text style={styles.progressPercentage}>{goalProgress.overallScore}%</Text>
                <Text style={styles.progressLabel}>Hedef</Text>
              </View>
              <View style={styles.progressDetails}>
                <Text style={styles.progressText}>
                  ✓ {goalProgress.totalAchieved} / {goalProgress.totalGoals} hedef tamamlandı
                </Text>
                <Text style={styles.progressSubtext}>
                  {goalProgress.overallScore >= 75 ? '🎉 Harika gidiyorsun!' : 
                   goalProgress.overallScore >= 50 ? '💪 İyi iş çıkarıyorsun!' : 
                   '🎯 Devam et, başarabilirsin!'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Rozetler */}
        <View style={styles.badgesSection}>
          <Text style={styles.sectionTitle}>🏅 Rozetler ({achievements.allBadges.length}/{achievements.availableBadges.length})</Text>
          
          <View style={styles.badgesGrid}>
            {achievements.availableBadges.map((badge) => {
              const unlocked = isBadgeUnlocked(badge.id);
              const color = getBadgeColor(badge.id);

              return (
                <TouchableOpacity
                  key={badge.id}
                  style={[
                    styles.badgeCard,
                    { borderColor: unlocked ? color : '#e5e7eb' },
                    !unlocked && styles.badgeCardLocked,
                  ]}
                  activeOpacity={0.8}
                >
                  <View style={[styles.badgeIconContainer, { backgroundColor: unlocked ? color : '#f3f4f6' }]}>
                    <Text style={[styles.badgeIconText, !unlocked && styles.badgeIconLocked]}>
                      {badge.name.split(' ')[0]}
                    </Text>
                  </View>
                  <Text style={[styles.badgeName, !unlocked && styles.badgeNameLocked]} numberOfLines={2}>
                    {badge.name}
                  </Text>
                  <Text style={[styles.badgeDescription, !unlocked && styles.badgeDescriptionLocked]} numberOfLines={2}>
                    {badge.description}
                  </Text>
                  {unlocked && (
                    <View style={styles.badgeUnlockedBadge}>
                      <Text style={styles.badgeUnlockedText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Motivasyon Mesajı */}
        <View style={styles.motivationCard}>
          <Text style={styles.motivationIcon}>💬</Text>
          <Text style={styles.motivationTitle}>Motivasyon</Text>
          <Text style={styles.motivationText}>
            {achievements.allBadges.length === 0 
              ? "İlk rozetini kazanmak için hedeflerini tamamla! Her adım bir başarı 🎯"
              : achievements.streak >= 7
              ? "Muhteşem bir seri! Böyle devam et, sen harikasın! 🌟"
              : achievements.allBadges.length >= 5
              ? "Harika ilerliyorsun! Daha fazla rozet seni bekliyor! 🚀"
              : "Güzel başlangıç! Devam et, büyük şeyler seni bekliyor! 💪"}
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    marginBottom: 10,
  },
  backText: {
    color: '#fff',
    fontSize: 30,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginTop: 5,
  },
  progressSummary: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 15,
  },
  progressCircleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  progressLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
  },
  progressDetails: {
    flex: 1,
  },
  progressText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 5,
  },
  progressSubtext: {
    fontSize: 13,
    color: '#6b7280',
  },
  badgesSection: {
    marginBottom: 20,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badgeCard: {
    width: (width - 64) / 3, // 3 sütun
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  badgeCardLocked: {
    opacity: 0.5,
  },
  badgeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeIconText: {
    fontSize: 24,
  },
  badgeIconLocked: {
    opacity: 0.3,
  },
  badgeName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeNameLocked: {
    color: '#9ca3af',
  },
  badgeDescription: {
    fontSize: 9,
    color: '#6b7280',
    textAlign: 'center',
  },
  badgeDescriptionLocked: {
    color: '#d1d5db',
  },
  badgeUnlockedBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeUnlockedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  motivationCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 18,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  motivationIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  motivationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 10,
  },
  motivationText: {
    fontSize: 14,
    color: '#78350f',
    textAlign: 'center',
    lineHeight: 20,
  },
});
