import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

// Ayakkabı İkonu
const ShoeIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 24 24">
    <Path
      d="M3 18c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2v-2H3v2zm16-4V9c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v5h14z"
      fill="#3B82F6"
    />
  </Svg>
);

// Alev İkonu
const FlameIcon = ({ calories }) => (
  <View style={styles.flameContainer}>
    <Svg width="20" height="24" viewBox="0 0 24 24">
      <Path
        d="M12 2c-1.6 3.2-4 6-4 9 0 2.2 1.8 4 4 4s4-1.8 4-4c0-3-2.4-5.8-4-9zm0 14c-1.1 0-2-.9-2-2 0-1.3 1-2.5 2-4 1 1.5 2 2.7 2 4 0 1.1-.9 2-2 2z"
        fill="#FBBF24"
      />
    </Svg>
    <Text style={styles.calorieText}>{calories} Cal</Text>
  </View>
);

const ActivitiesCard = ({ onConnect }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Aktiviteler</Text>

      {/* Steps Bölümü */}
      <View style={styles.stepsSection}>
        <View style={styles.stepsHeader}>
          <ShoeIcon />
          <View style={styles.stepsInfo}>
            <Text style={styles.stepsTitle}>Adımlar</Text>
            <Text style={styles.stepsSubtitle}>Otomatik Takip</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.connectButton} onPress={onConnect}>
          <Text style={styles.connectButtonText}>Bağlan</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.manualLink}>
          <Text style={styles.manualLinkText}>Adımları manuel takip et</Text>
        </TouchableOpacity>
      </View>

      {/* Alt Bölüm */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Ekle</Text>
        </TouchableOpacity>
        
        <FlameIcon calories={361} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 26,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 20,
  },
  stepsSection: {
    marginBottom: 20,
  },
  stepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  stepsInfo: {
    flex: 1,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  stepsSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  connectButton: {
    backgroundColor: '#111827',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  connectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  manualLink: {
    alignItems: 'center',
  },
  manualLinkText: {
    color: '#3B82F6',
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  addButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  addButtonText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  flameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  calorieText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
});

export default ActivitiesCard;
