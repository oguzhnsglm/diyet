import React, { createContext, useContext, useMemo, useReducer } from 'react';
import levelsData from '../logic/levels';

const PracticeContext = createContext(undefined);

const initialState = levelsData.map((level, index) => ({
  id: level.id,
  title: level.title,
  description: level.description,
  words: level.words,
  progress: level.words.map(() => 'pending'),
  unlocked: index === 0,
  completed: false,
}));

function reducer(state, action) {
  switch (action.type) {
    case 'SET_WORD_STATUS': {
      const { levelId, wordIndex, status } = action.payload;
      const updated = state.map((level) => {
        if (level.id !== levelId) {
          return level;
        }
        const nextProgress = level.progress.map((item, idx) =>
          idx === wordIndex ? status : item,
        );
        const completed = nextProgress.every((item) => item === 'success');
        return { ...level, progress: nextProgress, completed };
      });
      return unlockLevels(updated);
    }
    case 'RESET_LEVEL': {
      const { levelId } = action.payload;
      const updated = state.map((level, index) => {
        if (level.id !== levelId) {
          return level;
        }
        return {
          ...level,
          progress: level.words.map(() => 'pending'),
          completed: false,
        };
      });
      return unlockLevels(updated);
    }
    case 'RESET_ALL': {
      return unlockLevels(
        state.map((level, index) => ({
          ...level,
          progress: level.words.map(() => 'pending'),
          completed: false,
          unlocked: index === 0,
        })),
      );
    }
    default:
      return state;
  }
}

function unlockLevels(levels) {
  return levels.map((level, index) => {
    if (index === 0) {
      return { ...level, unlocked: true };
    }
    const unlocked = levels[index - 1].completed;
    return { ...level, unlocked: unlocked || level.unlocked };
  });
}

export function PracticeProvider({ children }) {
  const [levels, dispatch] = useReducer(reducer, initialState);

  const value = useMemo(
    () => ({
      levels,
      setWordStatus: (levelId, wordIndex, status) =>
        dispatch({ type: 'SET_WORD_STATUS', payload: { levelId, wordIndex, status } }),
      resetLevel: (levelId) => dispatch({ type: 'RESET_LEVEL', payload: { levelId } }),
      resetAll: () => dispatch({ type: 'RESET_ALL' }),
    }),
    [levels],
  );

  return <PracticeContext.Provider value={value}>{children}</PracticeContext.Provider>;
}

export function usePractice() {
  const context = useContext(PracticeContext);
  if (!context) {
    throw new Error('usePractice must be used within a PracticeProvider');
  }
  return context;
}

