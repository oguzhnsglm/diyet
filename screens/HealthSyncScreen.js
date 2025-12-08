import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  checkHealthPermissions,
  requestHealthPermissions,
  syncAllHealthData,
  syncGlucoseData,
  syncActivityData,
  syncSleepData,
  getLastSyncTime,
  isHealthSyncEnabled,
  setHealthSyncEnabled,
} from '../logic/healthSync';

export default function HealthSyncScreen({ navigation }) {
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [permissions, setPermissions] = useState({ granted: false });
  const [lastSync, setLastSync] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const enabled = await isHealthSyncEnabled();
    setSyncEnabled(enabled);

    const perms = await checkHealthPermissions();
    setPermissions(perms);

    const lastSyncTime = await getLastSyncTime();
    setLastSync(lastSyncTime);
  }

  async function handlePermissionRequest() {
    const result = await requestHealthPermissions();
    setPermissions(result);

    if (result.granted) {
      Alert.alert('Başarılı', 'Sağlık izinleri verildi!');
    } else {
      Alert.alert('İzin Gerekli', result.message || 'İzinler verilemedi.');
    }
  }

  async function handleToggleSync(value) {
    setSyncEnabled(value);
    await setHealthSyncEnabled(value);

    if (value && !permissions.granted) {
      Alert.alert(
        'İzin Gerekli',
        'Senkronizasyonu aktifleştirmek için sağlık izinleri gerekli.',
        [
          { text: 'İptal', style: 'cancel' },
          { text: 'İzin Ver', onPress: handlePermissionRequest },
        ]
      );
    }
  }

  async function handleSyncAll() {
    if (!permissions.granted) {
      Alert.alert('İzin Gerekli', 'Önce sağlık izinleri vermelisiniz.');
      return;
    }

    setSyncing(true);
    setSyncResults(null);

    const result = await syncAllHealthData(30); // Son 30 gün

    setSyncing(false);
    setSyncResults(result);

    if (result.success) {
      Alert.alert('Senkronizasyon Tamamlandı', result.message);
      setLastSync(Date.now());
    } else {
      Alert.alert('Hata', result.error || 'Senkronizasyon başarısız.');
    }
  }

  async function handleSyncGlucose() {
    if (!permissions.granted) {
      Alert.alert('İzin Gerekli', 'Önce sağlık izinleri vermelisiniz.');
      return;
    }

    setSyncing(true);
    const result = await syncGlucoseData(30);
    setSyncing(false);

    if (result.success) {
      Alert.alert('Başarılı', result.message);
      setLastSync(Date.now());
    } else {
      Alert.alert('Hata', result.error || 'Senkronizasyon başarısız.');
    }
  }

  async function handleSyncActivity() {
    if (!permissions.granted) {
      Alert.alert('İzin Gerekli', 'Önce sağlık izinleri vermelisiniz.');
      return;
    }

    setSyncing(true);
    const result = await syncActivityData(30);
    setSyncing(false);

    if (result.success) {
      Alert.alert('Başarılı', result.message);
      setLastSync(Date.now());
    } else {
      Alert.alert('Hata', result.error || 'Senkronizasyon başarısız.');
    }
  }

  async function handleSyncSleep() {
    if (!permissions.granted) {
      Alert.alert('İzin Gerekli', 'Önce sağlık izinleri vermelisiniz.');
      return;
    }

    setSyncing(true);
    const result = await syncSleepData(30);
    setSyncing(false);

    if (result.success) {
      Alert.alert('Başarılı', result.message);
      setLastSync(Date.now());
    } else {
      Alert.alert('Hata', result.error || 'Senkronizasyon başarısız.');
    }
  }

  function formatLastSync() {
    if (!lastSync) return 'Henüz senkronize edilmedi';

    const diff = Date.now() - lastSync;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} gün önce`;
    if (hours > 0) return `${hours} saat önce`;
    if (minutes > 0) return `${minutes} dakika önce`;
    return 'Az önce';
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#667eea', '#764ba2']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sağlık Uygulaması</Text>
        <Text style={styles.headerSubtitle}>Apple Health & Google Fit</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* İzin Durumu */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📱 İzin Durumu</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Sağlık İzinleri:</Text>
            <Text style={[styles.statusValue, permissions.granted ? styles.granted : styles.denied]}>
              {permissions.granted ? '✓ Verildi' : '✗ Verilmedi'}
            </Text>
          </View>
          {!permissions.granted && (
            <TouchableOpacity style={styles.permissionButton} onPress={handlePermissionRequest}>
              <Text style={styles.permissionButtonText}>İzin Ver</Text>
            </TouchableOpacity>
          )}
          {permissions.message && (
            <Text style={styles.permissionMessage}>{permissions.message}</Text>
          )}
        </View>

        {/* Otomatik Senkronizasyon */}
        <View style={styles.card}>
          <View style={styles.switchRow}>
            <View style={styles.switchInfo}>
              <Text style={styles.cardTitle}>🔄 Otomatik Senkronizasyon</Text>
              <Text style={styles.switchDescription}>
                Günde bir kez otomatik olarak sağlık verilerinizi senkronize eder
              </Text>
            </View>
            <Switch
              value={syncEnabled}
              onValueChange={handleToggleSync}
              trackColor={{ false: '#ccc', true: '#667eea' }}
              thumbColor={syncEnabled ? '#fff' : '#f4f3f4'}
            />
          </View>
          <Text style={styles.lastSyncText}>Son senkronizasyon: {formatLastSync()}</Text>
        </View>

        {/* Manuel Senkronizasyon */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚡ Manuel Senkronizasyon</Text>
          <Text style={styles.cardDescription}>Son 30 günün verilerini şimdi senkronize edin</Text>

          <TouchableOpacity
            style={[styles.syncButton, styles.syncAllButton]}
            onPress={handleSyncAll}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.syncButtonText}>🔄 Tümünü Senkronize Et</Text>
            )}
          </TouchableOpacity>

          <View style={styles.syncRow}>
            <TouchableOpacity
              style={[styles.syncButton, styles.syncIndividual]}
              onPress={handleSyncGlucose}
              disabled={syncing}
            >
              <Text style={styles.syncButtonText}>🩸 Kan Şekeri</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.syncButton, styles.syncIndividual]}
              onPress={handleSyncActivity}
              disabled={syncing}
            >
              <Text style={styles.syncButtonText}>🏃 Aktivite</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.syncButton, styles.syncIndividual, { width: '100%' }]}
            onPress={handleSyncSleep}
            disabled={syncing}
          >
            <Text style={styles.syncButtonText}>😴 Uyku</Text>
          </TouchableOpacity>
        </View>

        {/* Senkronizasyon Sonuçları */}
        {syncResults && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Son Senkronizasyon Sonuçları</Text>
            {syncResults.success ? (
              <>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Kan Şekeri:</Text>
                  <Text style={styles.resultValue}>
                    {syncResults.results?.glucose?.count || 0} kayıt
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Aktivite:</Text>
                  <Text style={styles.resultValue}>
                    {syncResults.results?.activity?.count || 0} kayıt
                  </Text>
                </View>
                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>Uyku:</Text>
                  <Text style={styles.resultValue}>
                    {syncResults.results?.sleep?.count || 0} kayıt
                  </Text>
                </View>
                <View style={[styles.resultRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Toplam:</Text>
                  <Text style={styles.totalValue}>{syncResults.totalCount} kayıt</Text>
                </View>
              </>
            ) : (
              <Text style={styles.errorText}>{syncResults.error || 'Senkronizasyon başarısız'}</Text>
            )}
          </View>
        )}

        {/* Bilgilendirme */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ Sağlık Entegrasyonu Hakkında</Text>
          <Text style={styles.infoText}>
            • iOS: Apple Health uygulamanızdan kan şekeri, aktivite ve uyku verilerinizi alır
          </Text>
          <Text style={styles.infoText}>
            • Android: Google Fit uygulamanızdan verilerinizi alır
          </Text>
          <Text style={styles.infoText}>
            • Verileriniz cihazınızda güvenle saklanır
          </Text>
          <Text style={styles.infoText}>
            • Dijital İkiz sistemi bu verilerle daha iyi tahminler yapar
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 16,
    color: '#333',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  granted: {
    color: '#27ae60',
  },
  denied: {
    color: '#e74c3c',
  },
  permissionButton: {
    backgroundColor: '#667eea',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  permissionMessage: {
    fontSize: 13,
    color: '#666',
    marginTop: 10,
    fontStyle: 'italic',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  switchInfo: {
    flex: 1,
    paddingRight: 10,
  },
  switchDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 5,
  },
  lastSyncText: {
    fontSize: 13,
    color: '#999',
    marginTop: 5,
  },
  syncButton: {
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  syncAllButton: {
    backgroundColor: '#667eea',
  },
  syncIndividual: {
    backgroundColor: '#764ba2',
    flex: 1,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  syncRow: {
    flexDirection: 'row',
    gap: 10,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  resultLabel: {
    fontSize: 15,
    color: '#666',
  },
  resultValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  totalRow: {
    marginTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#667eea',
    borderBottomWidth: 0,
    paddingTop: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#e8f4f8',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 5,
  },
});
