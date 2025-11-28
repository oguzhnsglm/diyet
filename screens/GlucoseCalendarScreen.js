import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'glucose_calendar_days';

const statusColors = {
  good: '#22c55e',
  mid: '#eab308',
  bad: '#ef4444',
};

const statusLabels = {
  good: 'İyi gün (şeker genel olarak dengeli)',
  mid: 'Ortalama gün (birkaç yüksek / düşük ölçüm)',
  bad: 'Zor gün (şeker sık sık çok yüksek / çok düşük)',
};

const monthNames = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

const formatDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getMonthMatrix = (current) => {
  const year = current.getFullYear();
  const month = current.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const offset = ((firstDay.getDay() + 6) % 7);
  const weeks = [];
  let week = [];

  for (let i = 0; i < offset; i += 1) {
    week.push(null);
  }

  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    week.push(new Date(year, month, day));
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
  }

  if (week.length > 0) {
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);
  }

  return weeks;
};

const GlucoseCalendarScreen = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [daysData, setDaysData] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [noteInput, setNoteInput] = useState('');

  const monthMatrix = useMemo(() => getMonthMatrix(currentMonth), [currentMonth]);
  const selectedKey = formatDateKey(selectedDate);
  const selectedDayData = daysData[selectedKey] || {};

  useEffect(() => {
    const load = async () => {
      try {
        const json = await AsyncStorage.getItem(STORAGE_KEY);
        if (json) {
          setDaysData(JSON.parse(json));
        }
      } catch (error) {
        console.log('Takvim verisi yüklenemedi', error);
      }
    };
    load();
  }, []);

  useEffect(() => {
    setNoteInput(selectedDayData.note || '');
  }, [selectedKey, selectedDayData.note]);

  const saveDays = async (updated) => {
    try {
      setDaysData(updated);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.log('Takvim verisi kaydedilemedi', error);
    }
  };

  const handleChangeStatus = (status) => {
    const updated = {
      ...daysData,
      [selectedKey]: {
        ...(daysData[selectedKey] || {}),
        status,
      },
    };
    saveDays(updated);
  };

  const handleSaveNote = () => {
    const trimmed = noteInput.trim();
    const updated = {
      ...daysData,
      [selectedKey]: {
        ...(daysData[selectedKey] || {}),
        note: trimmed,
      },
    };
    saveDays(updated);
  };

  const changeMonth = (delta) => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + delta, 1)
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 24 }}>
      <LinearGradient colors={['#DBEAFE', '#EFF6FF']} style={styles.header}>
        <Text style={styles.headerTitle}>Günlük Takvim</Text>
        <Text style={styles.headerSubtitle}>
          Şeker dengene göre günlerini yeşil / sarı / kırmızı olarak işaretle.
        </Text>
      </LinearGradient>

      <View style={styles.monthRow}>
        <Pressable style={styles.monthButton} onPress={() => changeMonth(-1)}>
          <Text style={styles.monthButtonText}>{'‹'}</Text>
        </Pressable>
        <Text style={styles.monthTitle}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        <Pressable style={styles.monthButton} onPress={() => changeMonth(1)}>
          <Text style={styles.monthButtonText}>{'›'}</Text>
        </Pressable>
      </View>

      <View style={styles.weekHeaderRow}>
        {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((d) => (
          <Text key={d} style={styles.weekHeaderText}>{d}</Text>
        ))}
      </View>

      {monthMatrix.map((week, index) => (
        <View key={`week-${index}`} style={styles.weekRow}>
          {week.map((dateObj, idx) => {
            if (!dateObj) {
              return <View key={`empty-${idx}`} style={styles.dayCell} />;
            }
            const key = formatDateKey(dateObj);
            const info = daysData[key];
            const status = info?.status;
            const isSelected = selectedKey === key;

            let bgColor = '#E5E7EB';
            if (status === 'good') bgColor = statusColors.good;
            if (status === 'mid') bgColor = statusColors.mid;
            if (status === 'bad') bgColor = statusColors.bad;

            return (
              <Pressable
                key={key}
                style={[
                  styles.dayCell,
                  { backgroundColor: bgColor },
                  isSelected && styles.dayCellSelected,
                ]}
                onPress={() => setSelectedDate(dateObj)}
              >
                <Text
                  style={[
                    styles.dayText,
                    status && { color: 'white' },
                    isSelected && { fontWeight: '900' },
                  ]}
                >
                  {dateObj.getDate()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}

      <View style={styles.detailCard}>
        <Text style={styles.detailTitle}>
          Seçili Gün: {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </Text>

        <Text style={styles.detailLabel}>Günün durumu</Text>
        <View style={styles.statusRow}>
          <Pressable
            style={[styles.statusChip, selectedDayData.status === 'good' && styles.statusChipActiveGood]}
            onPress={() => handleChangeStatus('good')}
          >
            <View style={[styles.statusDot, { backgroundColor: statusColors.good }]} />
            <Text style={styles.statusChipText}>İyi gün</Text>
          </Pressable>
          <Pressable
            style={[styles.statusChip, selectedDayData.status === 'mid' && styles.statusChipActiveMid]}
            onPress={() => handleChangeStatus('mid')}
          >
            <View style={[styles.statusDot, { backgroundColor: statusColors.mid }]} />
            <Text style={styles.statusChipText}>Ortalama</Text>
          </Pressable>
          <Pressable
            style={[styles.statusChip, selectedDayData.status === 'bad' && styles.statusChipActiveBad]}
            onPress={() => handleChangeStatus('bad')}
          >
            <View style={[styles.statusDot, { backgroundColor: statusColors.bad }]} />
            <Text style={styles.statusChipText}>Zor gün</Text>
          </Pressable>
        </View>

        {selectedDayData.status && (
          <Text style={styles.statusInfo}>{statusLabels[selectedDayData.status]}</Text>
        )}

        <Text style={[styles.detailLabel, { marginTop: 12 }]}>Not (isteğe bağlı)</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="Bugün yemek, şeker, ruh hali ile ilgili not yazmak istersen buraya ekleyebilirsin."
          multiline
          value={noteInput}
          onChangeText={setNoteInput}
          onBlur={handleSaveNote}
        />
        <Text style={styles.noteHint}>Not alanından çıktığında otomatik kaydedilir.</Text>
      </View>

      <View style={styles.legendCard}>
        <Text style={styles.legendTitle}>Renk Açıklamaları</Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: statusColors.good }]} />
          <Text style={styles.legendText}>Yeşil: Gün genel olarak dengeli geçti.</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: statusColors.mid }]} />
          <Text style={styles.legendText}>Sarı: Bazı yüksek/düşük değerler vardı.</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: statusColors.bad }]} />
          <Text style={styles.legendText}>Kırmızı: Şeker sık sık çok yüksek/çok düşüktü.</Text>
        </View>
        <Text style={styles.legendFoot}>
          * Bu takvim, hem kan şekeri ölçümlerini hem de genel hislerini özetlemek için kullanabileceğin kişisel bir ajandadır.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { paddingHorizontal: 20, paddingTop: 32, paddingBottom: 18 },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 8,
  },
  monthButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#E5E7EB',
  },
  monthButtonText: { fontSize: 18, fontWeight: '700', color: '#111827' },
  monthTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  weekHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    marginTop: 12,
  },
  weekHeaderText: { width: 32, textAlign: 'center', fontSize: 12, color: '#6B7280' },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    marginTop: 4,
  },
  dayCell: {
    width: 32,
    height: 32,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  dayCellSelected: {
    borderWidth: 2,
    borderColor: '#1D4ED8',
  },
  dayText: { fontSize: 13, color: '#111827' },
  detailCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    elevation: 2,
  },
  detailTitle: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 8 },
  detailLabel: { fontSize: 13, fontWeight: '600', color: '#4B5563', marginBottom: 4 },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    flex: 1,
    marginHorizontal: 2,
  },
  statusChipActiveGood: { borderColor: '#22c55e', backgroundColor: '#DCFCE7' },
  statusChipActiveMid: { borderColor: '#eab308', backgroundColor: '#FEF9C3' },
  statusChipActiveBad: { borderColor: '#ef4444', backgroundColor: '#FEE2E2' },
  statusDot: { width: 10, height: 10, borderRadius: 999, marginRight: 6 },
  statusChipText: { fontSize: 12, color: '#111827' },
  statusInfo: { fontSize: 12, color: '#4B5563', marginTop: 4 },
  noteInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    padding: 8,
    minHeight: 60,
    backgroundColor: '#F9FAFB',
    fontSize: 12,
    textAlignVertical: 'top',
  },
  noteHint: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  legendCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    marginBottom: 24,
    elevation: 1,
  },
  legendTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 6 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 999, marginRight: 6 },
  legendText: { fontSize: 12, color: '#4B5563' },
  legendFoot: { fontSize: 11, color: '#6B7280', marginTop: 6 },
});

export default GlucoseCalendarScreen;
