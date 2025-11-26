import AsyncStorage from '@react-native-async-storage/async-storage';

export type BloodSugarEntry = {
  date: string; // YYYY-MM-DD
  fasting: number; // mg/dL
  postMeal: number; // mg/dL
};

const STORAGE_KEY = '@bloodSugarEntries';

const parseEntries = (raw: string | null): BloodSugarEntry[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter(entry => entry?.date && typeof entry.date === 'string');
    }
    return [];
  } catch (error) {
    console.error('Kan şekeri verileri çözümlenemedi', error);
    return [];
  }
};

const serializeEntries = (entries: BloodSugarEntry[]): string => JSON.stringify(entries);

export const getBloodSugarEntries = async (): Promise<BloodSugarEntry[]> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return parseEntries(stored);
  } catch (error) {
    console.error('Kan şekeri verileri okunamadı', error);
    return [];
  }
};

export const getEntryByDate = async (date: string): Promise<BloodSugarEntry | undefined> => {
  const entries = await getBloodSugarEntries();
  return entries.find(e => e.date === date);
};

export const upsertBloodSugarEntry = async (entry: BloodSugarEntry): Promise<BloodSugarEntry[]> => {
  try {
    const existing = await getBloodSugarEntries();
    const others = existing.filter(e => e.date !== entry.date);
    const merged = [...others, entry].sort((a, b) => a.date.localeCompare(b.date));
    await AsyncStorage.setItem(STORAGE_KEY, serializeEntries(merged));
    return merged;
  } catch (error) {
    console.error('Kan şekeri verisi kaydedilemedi', error);
    throw error;
  }
};
