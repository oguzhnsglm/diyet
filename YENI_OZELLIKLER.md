# 🩺 Diyabet Yönetim Uygulaması - Yenilikçi Özellikler

## 📋 Genel Bakış

Bu uygulama, diyabet hastalar için **tamamen özgün ve yenilikçi** bir dijital sağlık platformudur. Klasik kan şekeri takip uygulamalarının ötesinde, yapay zeka destekli kişiselleştirilmiş içgörüler ve tahminler sunar.

---

## ✨ Benzersiz Özellikler

### 1. 🤖 Kişisel Diyabet İkizi (Digital Twin)

**Konum:** `logic/digitalTwin.ts`

**Ne Yapar:**
- Kullanıcının geçmiş verilerinden öğrenen AI tabanlı tahmin motoru
- Kan şekeri, yemek, aktivite, uyku ve stres verilerini birlikte analiz eder
- Kişiye özel tahminler yapar

**Özellikler:**
- ✅ "Bu yemeği yersem 2 saat sonra şekerim ne olur?" tahmini
- ✅ "15 dakika yürürsem şekerim nasıl değişir?" analizi
- ✅ Geçmiş verilere dayalı güven skoru (%30-90 arası)
- ✅ Kişiselleştirilmiş içgörüler ve öneriler

**Örnek Kullanım:**
```javascript
const prediction = await predictBloodSugarAfterMeal(50, 120);
// { prediction: 180, confidence: 0.75 }
```

---

### 2. 📸 Akıllı Yemek Analizi (AI Food Scanner)

**Ekran:** `screens/FoodCameraScreen.js`

**Ne Yapar:**
- Yemek fotoğrafını AI ile analiz eder
- Karbonhidrat ve kalori tahmini yapar
- **Kişisel Glikoz Etkisi Skoru** verir (1-10)

**Benzersiz Yönü:**
Diğer uygulamalar genel skor verir. Bu uygulama, **kullanıcının geçmiş tepkilerine** bakarak kişisel skor hesaplar.

**Ekran Akışı:**
1. 📸 Fotoğraf çek
2. 🤖 AI yemeği tanır (pilav, tavuk, salata vb.)
3. 📊 Karbonhidrat ve kalori hesaplar
4. 🎯 **Senin için** glikoz etkisi skoru verir (örn: 7/10)
5. 🔮 Mevcut kan şekerine göre 2 saat sonrası tahmin
6. 💾 Yemek arşivine kaydet

**Kullanıcı Faydası:**
- "Bu yemek bana iyi gelir mi?" sorusunun cevabını anında alır
- Geçmişte yediği yemekleri arşivden bulabilir
- Benzer yemeklerin etkisini karşılaştırabilir

---

### 3. 💤 Uyku & Stres Analiz Modülü

**Ekran:** `screens/StressSleepAnalysisScreen.js`

**Ne Yapar:**
- Uyku saati ve kalitesini kaydeder
- Stres seviyesini (1-10) ve tetikleyicileri izler
- Kan şekeri ile ilişkisini analiz eder

**Benzersiz İçgörüler:**
- "6 saatten az uyuduğun günlerde sabah şekerin 45 mg/dL daha yüksek"
- "Salı günleri toplantı sonrası şeker dalgalanmaların artıyor"
- "İyi uyuduğun günlerde şeker stabiliten %20 daha iyi"

**Ekran Bileşenleri:**
- Uyku kaydı (saat + kalite: kötü/orta/iyi/mükemmel)
- Stres seviyesi slider (1-10)
- Stres tetikleyicileri (iş, toplantı, trafik vb.)
- Kişisel içgörüler kartları

---

## 🎯 Uygulamadaki Diğer Temel Özellikler

### ✅ Mevcut Özellikler:
1. **Kan Şekeri Takibi** - Açlık ve tokluk ölçümleri
2. **Diyet Planlayıcı** - Kişiye özel öğün planları
3. **Egzersiz Önerileri** - Görsel destekli egzersiz rehberi
4. **Sağlıklı Tarifler** - Diyabete uygun yemek tarifleri
5. **Acil Durum Önerileri** - Hipoglisemi/hiperglisemi yönergeler
6. **Diyabet Bilgi Merkezi** - GI, GL, A1C gibi kavramlar
7. **Günlük Takvim** - Renkli gün işaretleme sistemi

---

## 🚀 Gelecek Özellikler (Roadmap)

### Faz 2 - Yakında Eklenecekler:

#### 1. 🎤 Sesli Diyabet Koçu
- Sesli komutlarla etkileşim
- "Şekerim 250, ne yapmalıyım?" sorusuna anında yanıt
- Motivasyon mesajları ve hatırlatmalar

#### 2. 📍 Konum Bazlı Öneriler
- Belirli restoranlarda geçmiş yemek tepkilerini hatırlat
- Spor salonunda hipoglisemi uyarısı
- Rutin yerlerde akıllı öneriler

#### 3. 🎮 Gelişmiş Oyunlaştırma
- Şeker Stabilite Haritası (oyun benzeri görsel)
- Level sistemi ve rozetler
- Yemek tahmin oyunu (eğitici)
- Arkadaşlarla güvenli karşılaştırma

#### 4. 📄 Doktor Rapor Oluşturucu
- Tek tuşla PDF rapor
- Son 30 günün özeti
- Grafikler ve önemli olaylar
- E-posta/WhatsApp paylaşımı

#### 5. 😊 Duygu Analizi
- Günlük not ve sesli mesaj kaydı
- Duygu-şeker ilişkisi analizi
- Pozitif alışkanlık önerileri
- Nefes egzersizleri

#### 6. ⌚ Cihaz Entegrasyonları
- CGM (Sürekli Glikoz Ölçüm) desteği
- Akıllı insülin kalemleri
- Apple Health / Google Fit senkronizasyonu
- Akıllı bileklik ve tartı entegrasyonu

---

## 🎨 Tasarım Felsefesi

### Renk Kodları:
- 💙 **Mavi (#3b82f6)** - Bilgi, güven
- 💚 **Yeşil (#22c55e)** - Sağlık, başarı
- 🟡 **Sarı (#eab308)** - Dikkat, orta risk
- 🔴 **Kırmızı (#ef4444)** - Uyarı, yüksek risk
- 💜 **Mor (#8b5cf6)** - Uyku/Stres
- 🩷 **Pembe (#ec4899)** - AI/Yemek analizi

### UX Prensipleri:
1. **Basit ve Temiz** - Karmaşık veri bile kolay anlaşılır
2. **Görsel Öncelikli** - Emoji, ikon ve grafiklerle zenginleştirilmiş
3. **Kişiselleştirilmiş** - Her kullanıcıya özel içgörüler
4. **Motivasyon Odaklı** - Pozitif dil, teşvik mesajları
5. **Hızlı Erişim** - Ana bilgilere 2 tıklamayla ulaşım

---

## 🔬 Teknik Altyapı

### Kullanılan Teknolojiler:
- **React Native** (Expo)
- **TypeScript** (Logic katmanı)
- **AsyncStorage** (Lokal veri)
- **Supabase** (Backend - opsiyonel)
- **AI/ML** - Mock implementasyon (gelecekte gerçek API)

### Veri Yapısı:
```typescript
DigitalTwinData {
  meals: MealRecord[]          // Yemek kayıtları
  activities: ActivityRecord[] // Aktivite kayıtları
  sleep: SleepRecord[]         // Uyku kayıtları
  stress: StressRecord[]       // Stres kayıtları
  patterns: {                  // Hesaplanan kalıplar
    avgMorningBS, avgAfternoonBS, avgEveningBS, avgStability
  }
}
```

---

## 🌟 Neden Benzersiz?

### Diğer Uygulamalardan Farkları:

| Özellik | Klasik Uygulamalar | Bu Uygulama |
|---------|-------------------|-------------|
| Yemek Kaydı | Manuel veri girişi | 📸 AI fotoğraf analizi |
| Tahmin | Genel formüller | 🤖 Kişiye özel öğrenme |
| Skor | Herkes için aynı | 🎯 "Senin için" skoru |
| Uyku/Stres | Ayrı uygulamalar | 💤 Entegre analiz |
| İçgörüler | Genel tavs iyeler | 💡 Kişisel kalıp tespiti |
| Raporlama | Basit grafikler | 📊 Doktor için hazır PDF |

### Ana Değer Önerisi:
**"Diyabetini yönetmek için 10 uygulama yerine tek uygulama kullan, hem de seni tanıyan bir yapay zeka ile"**

---

## 📱 Kullanım Senaryoları

### Senaryo 1: Öğle Yemeği
1. Kullanıcı yemeğinin fotoğrafını çeker
2. AI: "Bu yemek senin için 6/10 etkiye sahip"
3. Kullanıcı mevcut şekerini girer (120)
4. Tahmin: "2 saat sonra ~165 mg/dL olacak"
5. Kullanıcı yemeden önce porsiyon ayarlar

### Senaryo 2: Uyku Analizi
1. Kullanıcı 5 saat uyuduğunu kaydeder
2. Sabah şekeri normalden yüksek çıkar
3. Uygulama: "Az uyuduğun günlerde sabah şekerin daha yüksek"
4. Kullanıcı uyku düzenini iyileştirmeye çalışır
5. 1 hafta sonra pozitif değişim görür

### Senaryo 3: Doktor Randevusu
1. Kullanıcı "Doktor Raporu" butonuna basar
2. Son 30 günün özeti PDF olarak oluşturulur
3. Grafikler, ortalamalar, kritik olaylar dahil
4. E-posta ile doktora gönderir
5. Randevuda detaylı görüşme yapılır

---

## 🎯 Hedef Kullanıcı Profilleri

### Profil 1: Teknoloji Dostu Takipçi
- Düzenli ölçüm yapar
- Verilerle arası iyi
- AI tahminlerini kullanır
- Tüm özellikleri aktif kullanır

### Profil 2: Unutkan Kullanıcı
- Ölçüm hatırlatmaları önemli
- Basit, hızlı kayıt ister
- Motivasyon mesajlarına ihtiyaç var
- Oyunlaştırma ile engage olur

### Profil 3: Doktor Yönlendir ilmi
- Aylık rapor özelliğini kullanır
- Detaylı analiz ister
- Doktora sunmak için veri toplar
- Uzun dönem trendleri izler

---

## 📊 Başarı Metrikleri

Uygulamanın etkisini ölçmek için:

1. **Şeker Stabilite Skoru** - Haftalık varyasyon azalması
2. **Ölçüm Düzenliliği** - Günlük ölçüm yapma oranı
3. **Tahmin Doğruluğu** - AI tahminlerinin gerçek değerlere yakınlığı
4. **Kullanıcı Engagement** - Günlük aktif kullanım süresi
5. **Yaşam Kalitesi** - Subjektif anketlerle ölçülen iyileşme

---

## 🚀 Kurulum ve Çalıştırma

```bash
# Bağımlılıkları yükle
npm install

# Dijital İkiz başlat (ilk kullanımda otomatik)
# App.js içinde initializeDigitalTwin() çağrılıyor

# Uygulamayı başlat
npx expo start

# Web için
npx expo start --web

# Mobil için (Expo Go ile)
npx expo start --tunnel
```

---

## 📝 Geliştirici Notları

### Yeni Özellik Eklerken:
1. `logic/` klasörüne data logic ekle
2. `screens/` klasörüne UI ekranı ekle
3. `App.js` içinde navigation'a kaydet
4. `MainScreen.js` içinde ana menüye buton ekle

### AI Entegrasyonu için:
- `FoodCameraScreen.js` içindeki `analyzeFoodImage()` fonksiyonunu gerçek API ile değiştir
- Önerilen servisler: Google Vision API, Clarifai, Custom TensorFlow model

### Veri Gizliliği:
- Tüm veriler lokal (AsyncStorage) - 0 sunucu riski
- Gelecekte cloud senkronizasyon opsiyonel olacak
- KVKK ve GDPR uyumlu tasarım

---

## 🤝 Katkıda Bulunma

Bu proje, diyabet hastaları için gerçek fayda sağlamayı hedefler. Katkılarınız değerlidir:

- 🐛 Bug bildirimi
- 💡 Yeni özellik önerisi
- 🎨 UI/UX iyileştirmeleri
- 📖 Dokümantasyon güncellemeleri

---

## 📜 Lisans

Bu proje, sağlık amaçlı kullanım için geliştirilmiştir. Ticari kullanım öncesi geliştirici ile iletişime geçiniz.

---

## ⚠️ Yasal Uyarı

Bu uygulama, eğitim ve farkındalık amaçlıdır. Tıbbi teşhis, tedavi veya ilaç reçetesi yerine geçmez. Diyabet yönetiminiz için mutlaka doktorunuza danışın.

---

## 💚 İletişim

Sorularınız ve geri bildirimleriniz için:
- GitHub Issues
- E-posta: [Buraya e-posta eklenecek]

---

**Sağlıklı günler! 🌟**
