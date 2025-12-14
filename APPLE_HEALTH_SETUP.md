# Apple Health Entegrasyonu

## 📱 Kurulum Adımları

### 1. React Native Health Paketini Yükleyin

```bash
npm install react-native-health
```

veya

```bash
yarn add react-native-health
```

### 2. iOS Bağımlılıklarını Yükleyin

```bash
cd ios
pod install
cd ..
```

### 3. Info.plist Dosyasını Güncelleyin

`ios/diyet/Info.plist` dosyasına aşağıdaki izinleri ekleyin:

```xml
<key>NSHealthShareUsageDescription</key>
<string>Bu uygulama sağlık verilerinizi okumak için Apple Health'e erişmek istiyor</string>
<key>NSHealthUpdateUsageDescription</key>
<string>Bu uygulama sağlık verilerinizi kaydetmek için Apple Health'e yazmak istiyor</string>
```

### 4. Health Capability Ekleyin

Xcode'da projenizi açın:
```bash
open ios/diyet.xcworkspace
```

1. Sol panelde projenizi seçin
2. **Signing & Capabilities** sekmesine gidin
3. **+ Capability** butonuna tıklayın
4. **HealthKit** seçin
5. Background Modes için de aynı işlemi yapın ve **Background fetch** seçeneğini işaretleyin

### 5. MainScreen'i Güncelleyin

MainScreen.js dosyasına Apple Health entegrasyonunu ekleyin:

```javascript
import { useEffect } from 'react';
import { initAppleHealth, syncAllHealthData } from '../logic/appleHealthSync';

// Component içinde:
useEffect(() => {
  const setupAppleHealth = async () => {
    try {
      await initAppleHealth();
      const healthData = await syncAllHealthData();
      
      // Verileri state'e kaydet
      setStepsCount(healthData.steps);
      setActiveMinutes(Math.round(healthData.calories / 10)); // Yaklaşık
      setWaterCount(healthData.water.glasses);
      // ... diğer veriler
      
      console.log('Apple Health data synced:', healthData);
    } catch (error) {
      console.log('Apple Health not available:', error);
    }
  };
  
  setupAppleHealth();
  
  // Her 5 dakikada bir senkronize et
  const interval = setInterval(setupAppleHealth, 300000);
  return () => clearInterval(interval);
}, []);
```

## 🔧 Kullanım

### Sağlık Verilerini Okuma

```javascript
import { 
  getTodaySteps, 
  getHeartRate, 
  getSleepData,
  getWaterIntake 
} from '../logic/appleHealthSync';

// Adım sayısı
const steps = await getTodaySteps();

// Kalp atışı
const heartRate = await getHeartRate();

// Uyku verisi
const sleep = await getSleepData(); // { hours, minutes, formatted }

// Su tüketimi
const water = await getWaterIntake(); // { milliliters, glasses }
```

### Sağlık Verilerini Yazma

```javascript
import { 
  saveBloodGlucose, 
  saveWaterIntake 
} from '../logic/appleHealthSync';

// Kan şekeri kaydet
await saveBloodGlucose(120, 'mgPerdL');

// Su tüketimi kaydet (250ml = 1 bardak)
await saveWaterIntake(250);
```

### Tüm Verileri Senkronize Etme

```javascript
import { syncAllHealthData } from '../logic/appleHealthSync';

const healthData = await syncAllHealthData();
console.log(healthData);
// {
//   steps: 5847,
//   heartRate: 72,
//   calories: 320,
//   sleep: { hours: 7, minutes: 24, formatted: '7sa 24dk' },
//   water: { milliliters: 2000, glasses: 8 },
//   glucose: [...],
//   lastSync: '2025-12-14T...'
// }
```

## 🎯 Özellikler

### Okuma İzinleri
- ✅ Adım sayısı (Steps)
- ✅ Kalp atış hızı (Heart Rate)
- ✅ Yakılan kalori (Active Calories)
- ✅ Uyku analizi (Sleep Analysis)
- ✅ Su tüketimi (Water)
- ✅ Kan şekeri (Blood Glucose)
- ✅ Vücut ağırlığı (Body Mass)
- ✅ Boy (Height)
- ✅ Vücut kitle indeksi (BMI)

### Yazma İzinleri
- ✅ Adım sayısı
- ✅ Yakılan kalori
- ✅ Su tüketimi
- ✅ Kan şekeri
- ✅ Vücut ağırlığı

## ⚠️ Önemli Notlar

1. **Sadece iOS**: Apple Health sadece iOS cihazlarda çalışır
2. **Gerçek Cihaz**: Simülatörde test edilemez, gerçek iPhone gerekir
3. **İzinler**: İlk açılışta kullanıcıdan izin istenir
4. **Privacy**: Kullanıcı istediği zaman izinleri iptal edebilir
5. **Background Sync**: Arka planda düzenli senkronizasyon için Background Modes gerekir

## 🐛 Sorun Giderme

### "Module not found" hatası
```bash
cd ios
pod deintegrate
pod install
cd ..
npx react-native run-ios
```

### İzinler çalışmıyor
- Info.plist'te izin açıklamalarını kontrol edin
- Xcode'da HealthKit capability'nin eklendiğinden emin olun
- Gerçek cihazda test edin

### Veriler gelmiyor
- iPhone Ayarlar > Gizlilik > Sağlık > Diyet App kontrol edin
- Apple Health uygulamasında veri olduğundan emin olun
- Konsol loglarını kontrol edin

## 📚 Daha Fazla Bilgi

- [React Native Health Dokümantasyonu](https://github.com/agencyenterprise/react-native-health)
- [Apple HealthKit Dokümantasyonu](https://developer.apple.com/documentation/healthkit)

## 🚀 Sonraki Adımlar

1. **Otomatik Senkronizasyon**: Arka planda düzenli veri çekme
2. **Bildirimler**: Hedeflere ulaşıldığında bildirim
3. **Grafikler**: Sağlık verilerinin görselleştirilmesi
4. **AI Önerileri**: Sağlık verilerine göre kişiselleştirilmiş öneriler
