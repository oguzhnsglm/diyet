export const getTodayISO = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const formatDateTR = (isoDate) => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('tr-TR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

export const calculateBMI = (weightKg, heightCm) => {
  const hM = heightCm / 100;
  if (!hM) return 0;
  return weightKg / (hM * hM);
};

export const healthyWeightRange = (heightCm) => {
  const hM = heightCm / 100;
  const min = 18.5 * hM * hM;
  const max = 24.9 * hM * hM;
  return { min, max };
};
