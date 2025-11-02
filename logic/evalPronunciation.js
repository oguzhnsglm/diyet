import normalize from './normalizeText';
import similarity from './similarity';

export default function evalPronunciation(expected, recognized) {
  const a = normalize(expected || '');
  const b = normalize(recognized || '');

  let score = 0;
  if (a && b) {
    score = similarity(a, b);
  }

  return {
    score,
    isSuccessful: score >= 0.6,
  };
}

