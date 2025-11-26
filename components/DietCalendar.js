import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STATUS_COLORS = {
  healthy: '#22c55e',
  unhealthy: '#ef4444',
  cheat: '#facc15',
  none: '#e5e7eb',
};

const WEEK_DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
const JOURNAL_STORAGE_KEY = '@diet-journal-v1';
const MOOD_OPTIONS = [
  { value: 'harika', label: 'Harika', emoji: '😄' },
  { value: 'iyi', label: 'İyi', emoji: '🙂' },
  { value: 'orta', label: 'İdare eder', emoji: '😐' },
  { value: 'yorgun', label: 'Yorgun', emoji: '😴' },
  { value: 'stresli', label: 'Stresli', emoji: '😟' },
  { value: 'uzgun', label: 'Üzgün', emoji: '😢' },
];

const formatDateKey = (date) => date.toISOString().slice(0, 10);

const calculateCheatRight = (summaries = {}) => {
  const dates = Object.keys(summaries).sort();
  let streak = 0;
  for (let i = dates.length - 1; i >= 0; i -= 1) {
    const status = summaries[dates[i]]?.status;
    if (status === 'healthy') {
      streak += 1;
      if (streak >= 3) {
        return true;
      }
    } else if (status === 'cheat') {
      break;
    } else {
      break;
    }
  }
  return false;
};

const buildMonthDays = (currentMonth) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekDay = firstDay.getDay();
  const startOffset = (startWeekDay + 6) % 7; // convert to Monday-first
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i += 1) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d += 1) {
    cells.push(new Date(year, month, d));
  }
  while (cells.length < 42) {
    cells.push(null);
  }
  return cells;
};

const DietCalendar = ({ visible, summaries = {}, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState(() => formatDateKey(new Date()));
  const [journal, setJournal] = useState({});
  const [mood, setMood] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (visible) {
      const today = new Date();
      const first = new Date(today.getFullYear(), today.getMonth(), 1);
      setCurrentMonth(first);
      setSelectedDate(formatDateKey(today));
    }
  }, [visible]);

  useEffect(() => {
    let mounted = true;
    const loadJournal = async () => {
      try {
        const saved = await AsyncStorage.getItem(JOURNAL_STORAGE_KEY);
        if (saved && mounted) {
          setJournal(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Günlük kayıtları okunamadı', error);
      }
    };
    loadJournal();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const sync = async () => {
      try {
        await AsyncStorage.setItem(JOURNAL_STORAGE_KEY, JSON.stringify(journal));
      } catch (error) {
        console.error('Günlük kayıtları kaydedilemedi', error);
      }
    };
    sync();
  }, [journal]);

  const days = useMemo(() => buildMonthDays(currentMonth), [currentMonth]);
  const cheatRight = useMemo(() => calculateCheatRight(summaries), [summaries]);
  const selectedSummary = summaries[selectedDate];
  const selectedJournal = journal[selectedDate] || {};

  useEffect(() => {
    const current = journal[selectedDate] || {};
    setMood(current.mood || '');
    setNote(current.note || '');
  }, [selectedDate, journal]);

  const handleSaveJournal = () => {
    setJournal((prev) => ({
      ...prev,
      [selectedDate]: {
        mood: mood || '',
        note: note || '',
      },
    }));
  };

  const changeMonth = (offset) => {
    setCurrentMonth((prev) => {
      const next = new Date(prev);
      next.setMonth(prev.getMonth() + offset);
      return next;
    });
  };

  const monthLabel = currentMonth.toLocaleString('tr-TR', {
    month: 'long',
    year: 'numeric',
  });

  const getStatusLabel = (status) => {
    if (status === 'healthy') return 'Sağlıklı ✅';
    if (status === 'unhealthy') return 'Diyeti bozdu ❌';
    if (status === 'cheat') return 'Cheat day 🎉';
    return 'Kayıt yok';
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.panel}>
          <ScrollView contentContainerStyle={styles.panelContent}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>Beslenme Takvimi & Günlük Ajanda</Text>
            <Pressable onPress={onClose} style={styles.closeButton} accessibilityRole="button">
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.monthRow}>
            <Pressable onPress={() => changeMonth(-1)} style={styles.navButton}>
              <Text style={styles.navButtonText}>‹</Text>
            </Pressable>
            <Text style={styles.monthLabel}>{monthLabel}</Text>
            <Pressable onPress={() => changeMonth(1)} style={styles.navButton}>
              <Text style={styles.navButtonText}>›</Text>
            </Pressable>
          </View>

          {cheatRight && (
            <View style={styles.cheatInfo}>
              <Text style={styles.cheatInfoText}>
                🎉 Son üç gün sağlıklı beslendin, bugün bir <Text style={styles.cheatInfoStrong}>cheat day</Text> hakkın var!
              </Text>
            </View>
          )}

          <View style={styles.weekdayRow}>
            {WEEK_DAYS.map((day) => (
              <Text key={day} style={styles.weekday}>
                {day}
              </Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {days.map((value, index) => {
              if (!value) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }
              const key = formatDateKey(value);
              const summary = summaries[key];
              const status = summary?.status || 'none';
              const isSelected = key === selectedDate;
              const emojiSymbol = journal[key]?.mood
                ? MOOD_OPTIONS.find((option) => option.value === journal[key].mood)?.emoji || '📝'
                : null;

              return (
                <Pressable
                  key={key}
                  style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                  onPress={() => setSelectedDate(key)}
                >
                  <View
                    style={[
                      styles.dayCircle,
                      { backgroundColor: STATUS_COLORS[status] || STATUS_COLORS.none },
                      isSelected && styles.dayCircleSelected,
                    ]}
                  >
                    <Text style={styles.dayCircleText}>{value.getDate()}</Text>
                  </View>
                  {emojiSymbol && <Text style={styles.moodEmoji}>{emojiSymbol}</Text>}
                </Pressable>
              );
            })}
          </View>

          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS.healthy }]} />
              <Text style={styles.legendText}>Sağlıklı</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS.unhealthy }]} />
              <Text style={styles.legendText}>Diyeti bozdu</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS.cheat }]} />
              <Text style={styles.legendText}>Cheat day</Text>
            </View>
          </View>

          <View style={styles.detailBox}>
            <Text style={styles.detailTitle}>Seçili Gün: {selectedDate}</Text>
            {selectedSummary && selectedSummary.status ? (
              <>
                <Text style={styles.detailText}>{getStatusLabel(selectedSummary.status)}</Text>
                {typeof selectedSummary.calories === 'number' && (
                  <Text style={styles.detailText}>Toplam kalori: {selectedSummary.calories} kcal</Text>
                )}
                {selectedSummary.note && (
                  <Text style={styles.detailText}>Not: {selectedSummary.note}</Text>
                )}
              </>
            ) : (
              <Text style={styles.detailText}>Bu gün için kayıt yok.</Text>
            )}
            <View style={styles.journalBox}>
              <Text style={styles.journalTitle}>Günlük Ajanda</Text>
              <View style={styles.moodRow}>
                {MOOD_OPTIONS.map((option) => {
                  const selected = mood === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      style={[styles.moodChip, selected && styles.moodChipSelected]}
                      onPress={() => setMood(option.value)}
                    >
                      <Text style={styles.moodChipText}>
                        {option.emoji} {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <TextInput
                style={styles.noteInput}
                multiline
                placeholder="Bugün nasıl geçti? Neler hissettin?"
                value={note}
                onChangeText={setNote}
                textAlignVertical="top"
              />
              <Pressable style={styles.journalSaveButton} onPress={handleSaveJournal}>
                <Text style={styles.journalSaveText}>Kaydet</Text>
              </Pressable>
              {selectedJournal.mood || selectedJournal.note ? (
                <Text style={styles.journalInfo}>
                  Bu gün için kaydedilmiş bir ajandan var, dilediğinde güncelleyebilirsin. ✏️
                </Text>
              ) : (
                <Text style={styles.journalInfo}>
                  Ruh hâlini veya kısa bir notu paylaşırsan takvimde saklanır. 💚
                </Text>
              )}
            </View>
          </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  panel: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#f9fafb',
    borderRadius: 18,
    padding: 16,
    maxHeight: '90%',
  },
  panelContent: {
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#111827',
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  navButton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  navButtonText: {
    fontSize: 18,
    color: '#111827',
  },
  monthLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  cheatInfo: {
    backgroundColor: '#fef3c7',
    borderRadius: 10,
    padding: 8,
    marginBottom: 8,
  },
  cheatInfoText: {
    fontSize: 12,
    color: '#92400e',
  },
  cheatInfoStrong: {
    fontWeight: '700',
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  weekday: {
    width: '14.28%',
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    color: '#6b7280',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  dayCell: {
    width: '14.28%',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayCellSelected: {
    borderRadius: 12,
  },
  dayCircle: {
    width: 32,
    height: 32,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: STATUS_COLORS.none,
  },
  dayCircleSelected: {
    borderWidth: 2,
    borderColor: '#0ea5e9',
  },
  dayCircleText: {
    fontSize: 12,
    color: '#111827',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    marginRight: 4,
  },
  legendText: {
    fontSize: 11,
    color: '#6b7280',
  },
  detailBox: {
    marginTop: 10,
    backgroundColor: '#eef2ff',
    borderRadius: 12,
    padding: 10,
  },
  detailTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1f2937',
  },
  detailText: {
    fontSize: 12,
    color: '#374151',
    marginBottom: 2,
  },
  moodEmoji: {
    fontSize: 12,
    marginTop: 2,
  },
  journalBox: {
    marginTop: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
  },
  journalTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1f2937',
  },
  moodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  moodChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  moodChipSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  moodChipText: {
    fontSize: 12,
    color: '#111827',
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 10,
    minHeight: 80,
    fontSize: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
    color: '#111827',
  },
  journalSaveButton: {
    backgroundColor: '#0ea5e9',
    borderRadius: 999,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  journalSaveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  journalInfo: {
    marginTop: 6,
    fontSize: 11,
    color: '#4b5563',
  },
});

export default DietCalendar;
