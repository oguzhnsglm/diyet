import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getTwinData, getPersonalizedInsights } from '../logic/digitalTwin';

const VoiceCoachScreen = ({ navigation }) => {
  const [userQuestion, setUserQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([
    {
      type: 'coach',
      message: 'Merhaba! Ben senin diyabet koçunum. Bana kan şekerin, yemeklerin veya diyabet hakkında ne sorsan yanıtlayayım. 😊',
      timestamp: Date.now(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Soru-cevap motoru (basit AI simülasyonu)
  const handleQuestion = async () => {
    if (!userQuestion.trim()) return;

    const question = userQuestion.trim();
    
    // Kullanıcı mesajını ekle
    setChatHistory([...chatHistory, {
      type: 'user',
      message: question,
      timestamp: Date.now(),
    }]);
    
    setUserQuestion('');
    setIsTyping(true);

    // 1 saniye düşünme animasyonu
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Cevap üret
    const response = await generateResponse(question.toLowerCase());

    setChatHistory(prev => [...prev, {
      type: 'coach',
      message: response,
      timestamp: Date.now(),
    }]);

    setIsTyping(false);
  };

  const generateResponse = async (question) => {
    const data = await getTwinData();
    const recentGlucose = data.glucose.slice(-7);

    // Acil durum kontrolleri
    if (question.includes('şekerim çok yüksek') || question.includes('250') || question.includes('300')) {
      return '⚠️ Kan şekerin çok yüksekse:\n\n1. Bol su iç (şekersiz)\n2. Hafif tempolu yürüyüş yap (15-20 dk)\n3. İnsülini doktorunun önerdiği şekilde kullan\n4. 2 saat içinde tekrar ölç\n\n⚠️ 300 üzerindeyse veya kendini kötü hissediyorsan acil servise başvur!';
    }

    if (question.includes('şekerim düştü') || question.includes('düşük') || question.includes('hipoglisemi')) {
      return '🚨 Düşük kan şekeri (hipoglisemi):\n\n1. HEMEN 15g hızlı şeker al: 3-4 şeker, 1 bardak meyve suyu\n2. 15 dakika bekle\n3. Tekrar ölç, hala düşükse tekrarla\n4. Sonra protein/karb karışımı ye (peynir+ekmek gibi)\n\n⚠️ Kendini çok kötü hissediyorsan veya bayılma varsa ACİL ARAYIN!';
    }

    // İstatistik soruları
    if (question.includes('kaç') && (question.includes('karbonhidrat') || question.includes('karb'))) {
      const totalCarbs = data.meals.reduce((sum, meal) => sum + (meal.carbs || 0), 0);
      return `📊 Toplam kayıtlı ${data.meals.length} yemeğinde ${Math.round(totalCarbs)}g karbonhidrat var.\n\nBugün için hesap yapmak ister misin, yeni yemek kaydet!`;
    }

    if (question.includes('ortalam') && (question.includes('şeker') || question.includes('glukoz'))) {
      if (recentGlucose.length === 0) {
        return 'Henüz kan şekeri kaydın yok. Ölçüm yaptıkça sana özel istatistikler göstereceğim! 📈';
      }
      const avg = recentGlucose.reduce((sum, g) => sum + g.value, 0) / recentGlucose.length;
      return `📊 Son ${recentGlucose.length} ölçümünün ortalaması: ${Math.round(avg)} mg/dL\n\n${avg > 140 ? '⚠️ Biraz yüksek, doktorunla görüşmeyi düşün.' : avg > 130 ? '✅ Kabul edilebilir, devam et!' : '🌟 Harika kontrol!'}`;
    }

    // Yemek soruları
    if (question.includes('ne yesem') || question.includes('yemek öner')) {
      return '🍽️ Sana özel yemek önerileri:\n\n• Izgara tavuk + bulgur pilavı + bol salata\n• Omlet + tam buğday ekmeği + avokado\n• Mercimek çorbası + yoğurt + ceviz\n• Izgara balık + quinoa + buharda sebze\n\n💡 Karbonhidratı protein ve lifle dengele, şeker daha stabil kalır!';
    }

    if (question.includes('atıştırmalık') || question.includes('ara öğün')) {
      return '🥜 Sağlıklı atıştırmalıklar:\n\n• Çiğ badem/ceviz (1 avuç)\n• Süzme yoğurt + chia\n• Elma dilimi + fıstık ezmesi\n• Kereviz + humus\n• Tam yulaf bar (şekersiz)\n\n✅ Protein+lif içeren seçenekler şekeri dengede tutar!';
    }

    // Egzersiz soruları
    if (question.includes('spor') || question.includes('egzersiz') || question.includes('yürüyüş')) {
      return '🏃 Egzersiz önerileri:\n\n• Günde 30 dk tempolu yürüyüş (en etkili!)\n• Haftada 2-3 kez direnç egzersizi\n• Yoga/pilates (stres azaltır)\n\n⚠️ Önemli:\n• Egzersiz öncesi şekerin 100-250 arasında olsun\n• Yanında hızlı şeker bulundur\n• Egzersiz sonrası ölç';
    }

    // Motivasyon soruları
    if (question.includes('motivasyon') || question.includes('bıktım') || question.includes('zor')) {
      return '💪 Seni anlıyorum, diyabet yönetimi yorucu olabiliyor.\n\nAma biliyorsun:\n• Her ölçüm, kendine yatırım\n• Her sağlıklı seçim, geleceğine hediye\n• Mükemmel olmak zorunda değilsin, tutarlı olmak yeter!\n\n🌟 Sen harikasın, devam et! Yanındayım.';
    }

    // Genel bilgi soruları
    if (question.includes('a1c') || question.includes('hba1c')) {
      return '📊 HbA1c (3 aylık şeker ortalaması):\n\n• <5.7%: Normal\n• 5.7-6.4%: Prediyabet\n• ≥6.5%: Diyabet\n• Hedef (diyabetlilerde): <7%\n\nSon HbA1c testini ne zaman yaptırdın?';
    }

    if (question.includes('gi') || question.includes('glisemik')) {
      return '📈 Glisemik İndeks (GI):\n\nKan şekerine etki hızı:\n• Düşük GI (<55): Yavaş yükselir ✅\n• Orta GI (56-69): Orta hız\n• Yüksek GI (>70): Hızlı yükselir ⚠️\n\n💡 Düşük GI yemekler tercih et: tam tahıllar, bakliyat, sebzeler';
    }

    // Kişiselleştirilmiş içgörüler
    if (question.includes('nasılım') || question.includes('durum') || question.includes('analiz')) {
      const insights = await getPersonalizedInsights();
      return `📊 Senin için kişisel analiz:\n\n${insights.join('\n\n')}`;
    }

    // Varsayılan yanıtlar
    const defaultResponses = [
      'İlginç bir soru! Biraz daha detay verir misin? Mesela kan şekerin, yediğin yemek veya hissettiğin belirti hakkında.',
      'Bu konuda sana en iyi doktorun yardımcı olabilir. Ben genel bilgi ve destek sağlayabilirim. Başka bir şey sorabilirim?',
      'Harika soru! Diyabet yönetimi kişiye özel olduğu için, doktorunla bunun senin için en iyi çözümünü konuşmanı öneririm.',
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const quickQuestions = [
    '📊 Ortalama şekerim kaç?',
    '🍽️ Ne yesem?',
    '🏃 Egzersiz önerileri',
    '💡 Bugün nasılım?',
    '🍎 Atıştırmalık öner',
    '⚠️ Şekerim çok yüksek',
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#6366f1', '#8b5cf6', '#a78bfa']} style={styles.header}>
        <Text style={styles.headerTitle}>🤖 Diyabet Koçun</Text>
        <Text style={styles.headerSubtitle}>Her soruna anında yanıt</Text>
      </LinearGradient>

      <ScrollView 
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        ref={(ref) => { this.scrollView = ref; }}
        onContentSizeChange={() => this.scrollView?.scrollToEnd({ animated: true })}
      >
        {chatHistory.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageBox,
              msg.type === 'user' ? styles.userMessage : styles.coachMessage,
            ]}
          >
            {msg.type === 'coach' && <Text style={styles.coachIcon}>🤖</Text>}
            <View style={styles.messageBubble}>
              <Text style={[
                styles.messageText,
                msg.type === 'user' ? styles.userMessageText : styles.coachMessageText
              ]}>
                {msg.message}
              </Text>
              <Text style={styles.messageTime}>
                {new Date(msg.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            {msg.type === 'user' && <Text style={styles.userIcon}>👤</Text>}
          </View>
        ))}

        {isTyping && (
          <View style={[styles.messageBox, styles.coachMessage]}>
            <Text style={styles.coachIcon}>🤖</Text>
            <View style={styles.messageBubble}>
              <Text style={styles.typingText}>Düşünüyorum...</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Hızlı Sorular */}
      <View style={styles.quickQuestionsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {quickQuestions.map((q, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickButton}
              onPress={() => {
                setUserQuestion(q);
                setTimeout(() => handleQuestion(), 100);
              }}
            >
              <Text style={styles.quickButtonText}>{q}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Mesaj Giriş */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Bir soru sor veya derdini anlat..."
          value={userQuestion}
          onChangeText={setUserQuestion}
          multiline
          maxLength={500}
          placeholderTextColor="#9ca3af"
          onSubmitEditing={handleQuestion}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleQuestion}>
          <Text style={styles.sendButtonText}>📤</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 25,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 15,
    paddingBottom: 20,
  },
  messageBox: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  userMessage: {
    justifyContent: 'flex-end',
  },
  coachMessage: {
    justifyContent: 'flex-start',
  },
  coachIcon: {
    fontSize: 30,
    marginRight: 8,
  },
  userIcon: {
    fontSize: 30,
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 15,
  },
  coachMessage_bubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 5,
  },
  userMessage_bubble: {
    backgroundColor: '#6366f1',
    borderBottomRightRadius: 5,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  coachMessageText: {
    color: '#374151',
  },
  userMessageText: {
    color: 'white',
  },
  messageTime: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 5,
    textAlign: 'right',
  },
  typingText: {
    fontSize: 15,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  quickQuestionsContainer: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: 'white',
  },
  quickButton: {
    backgroundColor: '#ede9fe',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 8,
  },
  quickButtonText: {
    fontSize: 13,
    color: '#6366f1',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    color: '#374151',
  },
  sendButton: {
    marginLeft: 10,
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 22,
  },
});

export default VoiceCoachScreen;
