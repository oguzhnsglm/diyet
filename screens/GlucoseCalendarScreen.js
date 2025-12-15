import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import BottomNavBar from '../components/BottomNavBar';
import BackButton from '../components/BackButton';

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

const GlucoseCalendarScreen = ({ navigation }) => {
  const { isDarkMode, colors } = useTheme();
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
    if (!trimmed) return;
    
    const now = new Date();
    const timeString = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
    
    const existingNotes = daysData[selectedKey]?.notes || [];
    const newNote = {
      text: trimmed,
      timestamp: now.toISOString(),
      timeString: timeString,
    };
    
    const updated = {
      ...daysData,
      [selectedKey]: {
        ...(daysData[selectedKey] || {}),
        notes: [...existingNotes, newNote],
      },
    };
    saveDays(updated);
    setNoteInput('');
  };

  const handleDeleteNote = (dateKey, noteIndex) => {
    const existingNotes = daysData[dateKey]?.notes || [];
    const updatedNotes = existingNotes.filter((_, idx) => idx !== noteIndex);
    
    const updated = {
      ...daysData,
      [dateKey]: {
        ...(daysData[dateKey] || {}),
        notes: updatedNotes,
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <BackButton navigation={navigation} />
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        <LinearGradient colors={isDarkMode ? ['#1C1C1E', '#1C1C1E'] : ['#FFFFFF', '#FFFFFF']} style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Günlük Takvim</Text>
      </LinearGradient>

      <View style={styles.monthRow}>
        <Pressable style={[styles.monthButton, { backgroundColor: colors.cardBackground }]} onPress={() => changeMonth(-1)}>
          <Text style={[styles.monthButtonText, { color: colors.text }]}>{'<'}</Text>
        </Pressable>
        <Text style={[styles.monthTitle, { color: colors.text }]}>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </Text>
        <Pressable style={[styles.monthButton, { backgroundColor: colors.cardBackground }]} onPress={() => changeMonth(1)}>
          <Text style={[styles.monthButtonText, { color: colors.text }]}>{'>'}</Text>
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

      <View style={[styles.detailCard, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.detailTitle, { color: colors.text }]}>
          Seçili Gün: {selectedDate.getDate()} {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </Text>

        <Text style={[styles.detailLabel, { color: colors.text }]}>Günün durumu</Text>
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

        <Text style={[styles.detailLabel, { color: colors.text, marginTop: 12 }]}>Not (isteğe bağlı)</Text>
        <TextInput
          style={[styles.noteInput, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.border }]}
          placeholder=""
          placeholderTextColor={colors.secondaryText}
          multiline
          value={noteInput}
          onChangeText={setNoteInput}
        />
        <Pressable
          style={[styles.saveNoteButton, { backgroundColor: isDarkMode ? '#0ea5e9' : '#3b82f6' }]}
          onPress={handleSaveNote}
        >
          <Text style={styles.saveNoteButtonText}>💾 Kaydet</Text>
        </Pressable>
      </View>

      <View style={[styles.legendCard, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.legendTitle, { color: colors.text }]}>Renk Açıklamaları</Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: statusColors.good }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>Yeşil: Gün genel olarak dengeli geçti.</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: statusColors.mid }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>Sarı: Bazı yüksek/düşük değerler vardı.</Text>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: statusColors.bad }]} />
          <Text style={[styles.legendText, { color: colors.text }]}>Kırmızı: Şeker sık sık çok yüksek/çok düşüktü.</Text>
        </View>
      </View>

      {/* Kaydedilmiş Notlar Ajandası */}
      <View style={[styles.notesJournal, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.legendTitle, { color: colors.text }]}>📝 Notlarım</Text>
        {Object.keys(daysData).filter(key => daysData[key].notes && daysData[key].notes.length > 0).length === 0 ? (
          <Text style={[styles.emptyNotesText, { color: colors.secondaryText }]}>Henüz kaydedilmiş not bulunmuyor.</Text>
        ) : (
          Object.keys(daysData)
            .filter(key => daysData[key].notes && daysData[key].notes.length > 0)
            .sort((a, b) => new Date(b) - new Date(a))
            .slice(0, 10)
            .map(dateKey => {
              const [year, month, day] = dateKey.split('-');
              const date = new Date(year, parseInt(month) - 1, day);
              const dayName = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'][date.getDay()];
              const formattedDate = `${day}.${month}.${year}`;
              const notes = daysData[dateKey].notes || [];
              
              return (
                <View key={dateKey} style={[styles.noteEntry, { borderColor: isDarkMode ? '#3A3A3C' : '#E5E7EB' }]}>
                  <View style={styles.noteEntryHeader}>
                    <Text style={[styles.noteEntryDate, { color: colors.text }]}>{dayName}, {formattedDate}</Text>
                    {daysData[dateKey].status && (
                      <View style={[styles.noteStatusDot, { backgroundColor: statusColors[daysData[dateKey].status] }]} />
                    )}
                  </View>
                  {notes.map((note, idx) => (
                    <View key={idx} style={[styles.noteItemRow, { marginTop: idx > 0 ? 8 : 4 }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.noteEntryTime, { color: isDarkMode ? '#FF9F0A' : '#3b82f6' }]}>{note.timeString}</Text>
                        <Text style={[styles.noteEntryText, { color: colors.secondaryText }]}>{note.text}</Text>
                      </View>
                      <Pressable
                        onPress={() => handleDeleteNote(dateKey, idx)}
                        style={styles.deleteNoteButton}
                      >
                        <Text style={styles.deleteNoteButtonText}>🗑️</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              );
            })
        )}
      </View>
      </ScrollView>
    </SafeAreaView>
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
  saveNoteButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveNoteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
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
  notesJournal: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    marginBottom: 24,
    elevation: 1,
  },
  emptyNotesText: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  noteEntry: {
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    paddingVertical: 12,
    marginTop: 8,
  },
  noteEntryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  noteEntryDate: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  noteStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  noteEntryText: {
    fontSize: 12,
    color: '#4B5563',
    lineHeight: 18,
  },
  noteEntryTime: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 2,
  },
  savedNoteItem: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  savedNoteTime: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  savedNoteText: {
    fontSize: 12,
    lineHeight: 18,
  },
  deleteNoteButton: {
    padding: 4,
    marginLeft: 8,
  },
  deleteNoteButtonText: {
    fontSize: 16,
  },
  noteItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
});

function GlucoseCalendarScreenWithNav({ navigation }) {
  return (
    <>
      <GlucoseCalendarScreen navigation={navigation} />
      <BottomNavBar navigation={navigation} activeKey="Diary" />
    </>
  );
}

export default GlucoseCalendarScreenWithNav;
