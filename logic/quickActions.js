import AsyncStorage from '@react-native-async-storage/async-storage';

const QUICK_ACTIONS_KEY = '@quick_actions_v1';
const DEFAULT_MAX = 5;

const readStore = async () => {
  try {
    const stored = await AsyncStorage.getItem(QUICK_ACTIONS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn('Quick actions okunamadı', error);
    return {};
  }
};

const writeStore = async (data) => {
  try {
    await AsyncStorage.setItem(QUICK_ACTIONS_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Quick actions kaydedilemedi', error);
  }
};

export const getQuickActions = async (category) => {
  const store = await readStore();
  return store[category] || [];
};

export const addQuickAction = async (category, action, max = DEFAULT_MAX) => {
  const store = await readStore();
  const current = store[category] || [];
  const filtered = current.filter((item) => item.id !== action.id);
  filtered.unshift(action);
  store[category] = filtered.slice(0, max);
  await writeStore(store);
  return store[category];
};

export const removeQuickAction = async (category, id) => {
  const store = await readStore();
  if (!store[category]) return [];
  store[category] = store[category].filter((item) => item.id !== id);
  await writeStore(store);
  return store[category];
};
