import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const DiabetesInfoScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <LinearGradient colors={['#E0F2FE', '#F8FAFC']} style={styles.header}>
        <Text style={styles.headerTitle}>Diyabet Bilgi Merkezi</Text>
        <Text style={styles.headerSubtitle}>
          Kan şekeri, GI–GY, A1C ve acil durumlarla ilgili her şeyi burada öğren.
        </Text>
      </LinearGradient>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔻 Hipoglisemi (Düşük Şeker)</Text>
        <Text style={styles.cardText}>
          Kan şekerinin 70 mg/dL altına düşmesi durumudur. Terleme, titreme, açlık hissi, baş dönmesi ve çarpıntı olabilir. Hızlı karbonhidrat alımı gerekir.
        </Text>

        <Text style={styles.cardSubTitle}>Ne Yapmalısın?</Text>
        <Text style={styles.cardList}>
          • 15 g hızlı karbonhidrat al (meyve suyu, şeker).{"\n"}
          • 15 dakika sonra tekrar ölç.{"\n"}
          • Düzelmezse işlemi tekrarla.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔺 Hiperglisemi (Yüksek Şeker)</Text>
        <Text style={styles.cardText}>
          Kan şekerinin 180 mg/dL üzerine çıkmasıdır. 250 mg/dL üzerinde ise risk artar. Susama, sık idrara çıkma, halsizlik ve baş ağrısı olabilir.
        </Text>

        <Text style={styles.cardSubTitle}>Ne Yapmalısın?</Text>
        <Text style={styles.cardList}>
          • Bol su iç.{"\n"}
          • Hafif yürüyüş yap.{"\n"}
          • Basit şeker tüketme.{"\n"}
          • Uzun süre yüksek kalırsa doktorunla iletişime geç.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🍞 GI (Glisemik İndeks) Nedir?</Text>
        <Text style={styles.cardText}>
          GI, bir yiyeceğin kan şekerini ne kadar hızlı yükselttiğini gösterir.{"\n"}{"\n"}
          • Düşük GI (0–55): Kan şekerini yavaş yükseltir.{"\n"}
          • Orta GI (56–69): Orta seviyede yükseltir.{"\n"}
          • Yüksek GI (70+): Kan şekerini hızlı yükseltir.
        </Text>

        <Text style={styles.cardSubTitle}>Örnekler</Text>
        <Text style={styles.cardList}>
          • Düşük GI: Tam buğday, bakliyat, yoğurt{"\n"}
          • Orta GI: Muz, çavdar ekmeği{"\n"}
          • Yüksek GI: Beyaz ekmek, pirinç, patates
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🍚 GY (Glisemik Yük) Nedir?</Text>
        <Text style={styles.cardText}>
          GY, bir yiyeceğin hem miktarına hem de GI değerine göre kan şekerine etkisini gösterir.{"\n"}{"\n"}
          GY = (GI × karbonhidrat gramı) / 100{"\n"}{"\n"}
          • ≤10 düşük yük{"\n"}
          • 11–19 orta yük{"\n"}
          • 20+ yüksek yük
        </Text>

        <Text style={styles.cardSubTitle}>Neden Önemli?</Text>
        <Text style={styles.cardList}>
          • Yüksek GY yiyecekler daha fazla glikoz salımı yapar.{"\n"}
          • Düşük GY yiyecekler daha uzun tokluk sağlar.{"\n"}
          • Diyabet yönetiminde GY en önemli göstergedir.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🧪 A1C (HbA1C) Nedir?</Text>
        <Text style={styles.cardText}>
          Son 2–3 aylık ortalama kan şekeri seviyeni gösteren laboratuvar testidir.{"\n"}{"\n"}
          • Normal: %4 – %5.6{"\n"}
          • Prediyabet: %5.7 – %6.4{"\n"}
          • Diyabet: %6.5 ve üzeri
        </Text>

        <Text style={styles.cardSubTitle}>A1C Neden Önemli?</Text>
        <Text style={styles.cardList}>
          • Diyabet tanısında kullanılır.{"\n"}
          • Uzun dönem komplikasyon riskini gösterir.{"\n"}
          • Ev ölçümleri A1C hakkında kaba fikir verir ama yerini tutmaz.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📊 GDE (Glikoz Dalgalanma Endeksi)</Text>
        <Text style={styles.cardText}>
          Kan şekerinin gün içindeki dalgalanma miktarını gösterir. Ne kadar düşükse o kadar stabil.
        </Text>

        <Text style={styles.cardSubTitle}>Referans Aralıkları</Text>
        <Text style={styles.cardList}>
          • 0–30 → Stabil{"\n"}
          • 31–60 → Orta dalgalanma{"\n"}
          • 61+ → Yüksek dalgalanma
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🥗 Diyabet İçin Beslenme Tüyoları</Text>
        <Text style={styles.cardList}>
          • Tabağının yarısı sebze olsun.{"\n"}
          • Tam tahılları tercih et.{"\n"}
          • Beyaz ekmek, pirinç, patatesi sınırlı tüket.{"\n"}
          • Paketli ürünleri minimumda tut.{"\n"}
          • Meyveyi porsiyonla ve tek başına değil, proteinle birlikte tüket.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🏃 Egzersiz & Kan Şekeri</Text>
        <Text style={styles.cardList}>
          • Yemekten sonra 10–15 dk yürüyüş şeker kontrolünü iyileştirir.{"\n"}
          • Düzenli kardiyo A1C seviyesini düşürür.{"\n"}
          • Ağır egzersiz öncesi şekerini mutlaka kontrol et.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🚨 Acil Durum Bilgisi</Text>
        <Text style={styles.cardText}>
          Şiddetli hipoglisemi veya hiperglisemi yaşıyorsan vakit kaybetmeden bir sağlık profesyoneline başvur.
        </Text>
      </View>

      <Text style={styles.footerText}>
        Bu bilgiler tıbbi tanı yerine geçmez. En doğru yönlendirme için doktorunuza danışın.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { padding: 20, paddingTop: 40 },
  headerTitle: { fontSize: 28, fontWeight: '700', color: '#0F172A', textAlign: 'center' },
  headerSubtitle: { fontSize: 14, color: '#334155', textAlign: 'center', marginTop: 6 },
  card: {
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 0,
    padding: 16,
    borderRadius: 14,
    elevation: 2,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6, color: '#1E293B' },
  cardSubTitle: { fontSize: 15, fontWeight: '600', marginTop: 10, marginBottom: 4, color: '#0F172A' },
  cardText: { fontSize: 14, color: '#475569' },
  cardList: { fontSize: 14, color: '#334155', lineHeight: 22 },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#64748B',
    padding: 20,
    paddingBottom: 40,
  },
});

export default DiabetesInfoScreen;
