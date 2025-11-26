import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { getEntryByDate, upsertBloodSugarEntry } from '../logic/bloodSugarStorage';

type Props = {
  onOpenDetail: () => void;
  onOpenEmergency?: (payload: { fasting?: number; postMeal?: number }) => void;
};

const todayISO = () => format(new Date(), 'yyyy-MM-dd');

const BloodSugarQuickCard: React.FC<Props> = ({ onOpenDetail, onOpenEmergency }) => {
  const [date] = useState(todayISO());
  const [fasting, setFasting] = useState('');
  const [postMeal, setPostMeal] = useState('');
  const [statusText, setStatusText] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadExisting = async () => {
      const entry = await getEntryByDate(date);
      if (entry) {
        setFasting(String(entry.fasting));
        setPostMeal(String(entry.postMeal));
        setStatusText('Bugünkü kayıt güncellendi');
      } else {
        setFasting('');
        setPostMeal('');
        setStatusText(null);
      }
    };

    loadExisting();
  }, [date]);

  const readableDate = useMemo(() => format(new Date(date), 'dd MMM yyyy', { locale: tr }), [date]);

  const numericFasting = Number(fasting);
  const numericPost = Number(postMeal);
  const emergencyStatus = useMemo(() => {
    if (!fasting && !postMeal) return 'normal';
    if (!Number.isNaN(numericFasting) && numericFasting < 70) return 'hypo';
    if (!Number.isNaN(numericFasting) && numericFasting > 180) return 'hyper';
    if (!Number.isNaN(numericPost) && numericPost > 250) return 'hyper';
    return 'normal';
  }, [numericFasting, numericPost, fasting, postMeal]);

  const showEmergencyHint = emergencyStatus !== 'normal' && onOpenEmergency;

  const handleSave = async () => {
    const fastingValue = Number(fasting);
    const postValue = Number(postMeal);

    if (Number.isNaN(fastingValue) || Number.isNaN(postValue)) {
      setStatusText('Lütfen geçerli rakamlar girin');
      return;
    }

    setSaving(true);
    try {
      await upsertBloodSugarEntry({ date, fasting: fastingValue, postMeal: postValue });
      setStatusText('Kayıt başarıyla kaydedildi');
    } catch (error) {
      setStatusText('Kaydedilirken bir sorun oluştu');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Kan Şekeri Kaydı</Text>
          <Text style={styles.subtitle}>{readableDate}</Text>
        </View>
        <TouchableOpacity onPress={onOpenDetail} style={styles.detailButton}>
          <Text style={styles.detailButtonText}>Detaylar →</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Açlık (mg/dL)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={fasting}
        onChangeText={setFasting}
        placeholder="Örn: 95"
      />

      <Text style={styles.label}>Tokluk (mg/dL)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={postMeal}
        onChangeText={setPostMeal}
        placeholder="Örn: 140"
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
        <Text style={styles.saveButtonText}>{saving ? 'Kaydediliyor...' : 'Bugünü Kaydet'}</Text>
      </TouchableOpacity>

      {statusText && <Text style={styles.statusText}>{statusText}</Text>}
      {showEmergencyHint && (
        <TouchableOpacity
          style={[styles.emergencyButton, emergencyStatus === 'hypo' ? styles.hypo : styles.hyper]}
          onPress={() =>
            onOpenEmergency?.({
              fasting: Number.isNaN(numericFasting) ? undefined : numericFasting,
              postMeal: Number.isNaN(numericPost) ? undefined : numericPost,
            })
          }
        >
          <Text style={styles.emergencyText}>
            {emergencyStatus === 'hypo'
              ? 'Düşük şeker uyarısı • Acil önerileri aç'
              : 'Yüksek şeker uyarısı • Acil önerileri aç'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default BloodSugarQuickCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
  },
  detailButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  detailButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 10,
    backgroundColor: '#f8fafc',
  },
  saveButton: {
    backgroundColor: '#16a34a',
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statusText: {
    marginTop: 8,
    fontSize: 11,
    color: '#475569',
  },
  emergencyButton: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  emergencyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
    textAlign: 'center',
  },
  hypo: {
    backgroundColor: '#fee2e2',
  },
  hyper: {
    backgroundColor: '#fef3c7',
  },
});
