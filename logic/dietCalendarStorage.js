import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@diet-calendar-summaries';

export const getDietSummaries = async () => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Beslenme takvimi verisi alınamadı', error);
    return {};
  }
};

export const saveDietSummary = async (dateKey, summary) => {
  try {
    const current = await getDietSummaries();
    current[dateKey] = summary;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    return current;
  } catch (error) {
    console.error('Beslenme takvimi verisi kaydedilemedi', error);
    return null;
  }
};
