import React, { useMemo } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';

const EmergencyScreen = ({ route }) => {
  const fasting = route.params?.fasting ?? null;
  const postMeal = route.params?.postMeal ?? null;

  const status = useMemo(() => {
    if (fasting !== null && fasting < 70) return 'hypo';
    if ((fasting !== null && fasting > 180) || (postMeal !== null && postMeal > 250)) {
      return 'hyper';
    }
    return 'normal';
  }, [fasting, postMeal]);

  const renderHypo = () => (
    <View style={styles.cardRed}>
      <Text style={styles.titleRed}>🔴 Hipoglisemi (Düşük Şeker)</Text>
      <Text style={styles.text}>Kan şekeri çok düşük olabilir. Şu adımları uygulayabilirsin:</Text>
      <Text style={styles.bullet}>• 15 gram hızlı şeker al (meyve suyu, jelibon, bal)</Text>
      <Text style={styles.bullet}>• 15 dakika bekle</Text>
      <Text style={styles.bullet}>• Kan şekerini tekrar ölç</Text>
      <Text style={styles.bullet}>• Eğer hala düşükse aynı adımı tekrarla</Text>
    </View>
  );

  const renderHyper = () => (
    <View style={styles.cardYellow}>
      <Text style={styles.titleYellow}>🟡 Hiperglisemi (Yüksek Şeker)</Text>
      <Text style={styles.text}>Kan şekerin yüksek olabilir. Bunları yapabilirsin:</Text>
      <Text style={styles.bullet}>• 1–2 bardak su iç</Text>
      <Text style={styles.bullet}>• Hafif bir yürüyüş yapabilirsin (doktorun izin verdiyse)</Text>
      <Text style={styles.bullet}>• Şekerli gıdalardan uzak dur</Text>
      <Text style={styles.bullet}>• Ani egzersiz yapma (şekeri daha artırabilir)</Text>
    </View>
  );

  const renderNormal = () => (
    <View style={styles.cardGreen}>
      <Text style={styles.titleGreen}>🟢 Şeker düzeyin dengeli görünüyor</Text>
      <Text style={styles.text}>Yine de kendini kötü hissediyorsan su iç, dinlen ve bir şeyler atıştır.</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      {status === 'hypo' && renderHypo()}
      {status === 'hyper' && renderHyper()}
      {status === 'normal' && renderNormal()}

      <Text style={styles.note}>
        Bu bilgiler tıbbi tanı yerine geçmez. Şiddetli durumda sağlık birimine başvur.
      </Text>
    </ScrollView>
  );
};

export default EmergencyScreen;

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f1f5f9', flex: 1 },
  text: { fontSize: 14, color: '#334155', marginBottom: 8 },
  bullet: { marginBottom: 4, fontSize: 13, color: '#475569' },
  note: { marginTop: 20, fontSize: 11, color: '#64748b', textAlign: 'center' },
  cardRed: {
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  titleRed: { fontSize: 18, fontWeight: '700', color: '#b91c1c', marginBottom: 8 },
  cardYellow: {
    backgroundColor: '#fef9c3',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  titleYellow: { fontSize: 18, fontWeight: '700', color: '#a16207', marginBottom: 8 },
  cardGreen: {
    backgroundColor: '#dcfce7',
    padding: 16,
    borderRadius: 14,
    marginBottom: 16,
  },
  titleGreen: { fontSize: 18, fontWeight: '700', color: '#166534', marginBottom: 8 },
});
