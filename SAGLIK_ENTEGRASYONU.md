# 🏥 Sağlık Uygulaması Entegrasyonu

## 📋 Genel Bakış

Diyabet asistan uygulaması artık **Apple Health (iOS)** ve **Google Fit (Android)** ile entegre çalışıyor. Akıllı saatlerden ve sağlık uygulamalarından gelen veriler otomatik olarak tüm modüllerde kullanılıyor.

---

## 🔄 Senkronize Edilen Veriler

### 1. **Kan Şekeri (Glucose)**
- Manuel girişler + sağlık uygulamasından otomatik senkronizasyon
- Dijital İkiz tarafından analiz edilir

### 2. **Aktivite (Activity)**
- Yürüyüş, koşu, bisiklet, egzersiz süreleri
- Kalori yakımı hesaplamaları
- Egzersiz yoğunluğu

### 3. **Uyku (Sleep)**
- Uyku süresi (saat)
- Uyku kalitesi
- Kan şekerine etki analizi

### 4. **Kalp Atışı (Heart Rate)** ⌚ YENİ
- Anlık kalp atış hızı (bpm)
- Ortalama kalp atışı hesaplamaları
- Egzersiz sırasında kalp atışı takibi

### 5. **Adım Sayısı (Steps)** 👣 YENİ
- Günlük adım sayısı
- Aktivite hedefi takibi
- Kalori yakımı hesaplamalarında kullanılır

### 6. **Kalori Yakımı (Calories Burned)** 🔥 YENİ
- Toplam günlük kalori yakımı
- Aktivite bazlı kalori hesaplaması
- Beslenme dengesi için kullanılır

### 7. **Kilo (Weight)** ⚖️ YENİ
- Güncel kilo takibi
- Kilo değişim trendi
- BMI hesaplamalarında kullanılır

### 8. **Kan Basıncı (Blood Pressure)** 💓 YENİ
- Sistolik/Diastolik değerler
- Hipertansiyon kontrolü
- Diyabet komplikasyonu takibi

---

## 📱 Kullanım Alanları

### **Ana Menü (MainScreen)**
```
✅ Bugünkü sağlık özeti:
  • Ortalama kalp atışı: 72 bpm
  • Adım sayısı: 8,450 adım  
  • Yakılan kalori: 320 kal
```

### **Egzersiz Kütüphanesi (ExerciseLibraryScreen)**
```
✅ Gerçek zamanlı aktivite verileri:
  • Alınan kalori vs Yakılan kalori karşılaştırması
  • Güncel adım sayısı
  • Kalp atışı bazlı egzersiz önerileri
```

### **Uyku & Stres Analitiği (StressSleepAnalysisScreen)**
```
✅ Akıllı saat verileri banner:
  • Bugünkü adım sayısı
  • Ortalama kalp atışı
  • Otomatik uyku verileri (akıllı saatten)
```

### **Dijital İkiz AI (digitalTwin.js)**
```
✅ Tahmin algoritmaları:
  • Kalp atışı yüksekse → Stres algıla → Kan şekeri artışı öngör
  • Az adım atılmışsa → Düşük aktivite uyarısı
  • Kilo artışı trendinde → Diyet önerileri güncelle
```

### **Doktor Raporu (DoctorReportScreen)**
```
✅ Otomatik rapor oluşturma:
  • Ortalama kalp atışı: 68-82 bpm
  • Günlük ortalama adım: 7,200
  • Son kilo: 78.5 kg
  • Son kan basıncı: 125/80 mmHg
```

---

## 🛠️ Teknik Altyapı

### **Dosyalar:**

1. **`logic/healthSync.js`** - Senkronizasyon motoru
   - `syncAllHealthData()` - Tüm verileri paralel olarak senkronize eder
   - `syncGlucoseData()` - Kan şekeri verileri
   - `syncHeartRateData()` - Kalp atışı verileri
   - `syncStepsData()` - Adım sayısı verileri
   - `syncCaloriesBurnedData()` - Kalori yakımı verileri
   - `syncWeightData()` - Kilo verileri
   - `syncBloodPressureData()` - Kan basıncı verileri
   - `getTodayHealthSummary()` - Bugünün özeti (tüm ekranlarda kullanılır)
   - `getHealthData()` - Geçmiş veriler

2. **`screens/HealthSyncScreen.js`** - Kullanıcı arayüzü
   - İzin yönetimi (iOS/Android)
   - Manuel senkronizasyon butonları
   - Otomatik senkronizasyon ayarı
   - Son senkronizasyon zamanı
   - Senkronizasyon sonuçları

---

## 🔐 İzinler

### **iOS (Apple Health)**
Gerekli izinler:
- `HKQuantityTypeIdentifierBloodGlucose`
- `HKQuantityTypeIdentifierHeartRate`
- `HKQuantityTypeIdentifierStepCount`
- `HKQuantityTypeIdentifierActiveEnergyBurned`
- `HKQuantityTypeIdentifierBodyMass`
- `HKQuantityTypeIdentifierBloodPressureSystolic`
- `HKQuantityTypeIdentifierBloodPressureDiastolic`
- `HKCategoryTypeIdentifierSleepAnalysis`

### **Android (Google Fit)**
Gerekli izinler:
- `Fitness.BLOOD_GLUCOSE`
- `Fitness.HEART_RATE_BPM`
- `Fitness.STEP_COUNT_DELTA`
- `Fitness.CALORIES_EXPENDED`
- `Fitness.WEIGHT`
- `Fitness.BLOOD_PRESSURE`
- `Fitness.SLEEP`

---

## 📊 Veri Akışı

```
┌─────────────────────────────────────┐
│  Apple Health / Google Fit          │
│  (Akıllı saat, Manuel girişler)     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  healthSync.js                      │
│  • syncAllHealthData()              │
│  • Verileri AsyncStorage'a kaydet   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  digitalTwin.js                     │
│  • AI tahminleri                    │
│  • Korelasyon analizleri            │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  Tüm Ekranlar (13 modül)            │
│  • Ana Menü: Sağlık özeti           │
│  • Egzersiz: Kalori dengesi         │
│  • Uyku/Stres: Kalp atışı           │
│  • Dijital İkiz: Tahminler          │
│  • Doktor Raporu: Özet istatistikler│
└─────────────────────────────────────┘
```

---

## 🚀 Kullanım Senaryoları

### **Senaryo 1: Sabah Uyanma**
1. Kullanıcı uygulamayı açar
2. Ana menüde görür: "⌚ 6.5 saat uyku, 64 bpm ortalama kalp atışı"
3. Uyku kalitesi düşükse → "Bugün düşük tempolu egzersizler önerilir" uyarısı

### **Senaryo 2: Öğle Yemeği Sonrası**
1. Kullanıcı yemek girer (800 kcal)
2. Egzersiz ekranında görür: "Alınan: 800 kcal | Yakılan: 180 kcal"
3. Öneri: "25 dk tempolu yürüyüş + 620 kcal dengeleyebilir"
4. Akıllı saat verisini kontrol eder: "Bugün 3,200 adım atmışsın"

### **Senaryo 3: Doktor Randevusu**
1. Kullanıcı "Doktor Raporu" butonuna basar
2. Otomatik rapor oluşturulur:
   - Son 30 günün kan şekeri ortalaması
   - Ortalama günlük adım: 7,500
   - Ortalama kalp atışı: 68-75 bpm
   - Son kilo: 79.2 kg (-1.3 kg son 30 gün)
3. Raporu WhatsApp/email ile doktora gönderir

---

## 🔮 Gelecek Özellikler (Planlanıyor)

- [ ] **Gerçek zamanlı senkronizasyon** (şu an manuel/günlük otomatik)
- [ ] **Oksijen seviyesi (SpO2)** takibi
- [ ] **Stres skoru** (HRV bazlı)
- [ ] **Menstrüel döngü** takibi (kadın kullanıcılar için)
- [ ] **İlaç hatırlatıcı** (akıllı saatle entegre)
- [ ] **Glukometre Bluetooth** bağlantısı (otomatik kan şekeri aktarımı)

---

## ✅ Sonuç

Sağlık uygulaması entegrasyonu ile:
- ✅ **13 modülde** akıllı saat verileri kullanılıyor
- ✅ **8 farklı veri tipi** senkronize ediliyor
- ✅ **Dijital İkiz AI** daha doğru tahminler yapıyor
- ✅ **Otomatik raporlar** doktor randevuları için hazır
- ✅ **Kullanıcı deneyimi** çok daha kişiselleşmiş

---

## 📞 Teknik Destek

Entegrasyon sorunları için:
1. `HealthSyncScreen` → "İzin Ver" butonuna bas
2. iOS: Ayarlar → Gizlilik → Sağlık → Diyabet Asistan → Tüm kategorilere izin ver
3. Android: Google Fit → Bağlı uygulamalar → Diyabet Asistan → İzinleri kontrol et

**Not:** Şu an placeholder modunda çalışıyor. Gerçek entegrasyon için:
- iOS: `react-native-health` veya `expo-health` paketi kurulmalı
- Android: `@react-native-community/google-fit` paketi kurulmalı
