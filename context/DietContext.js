import React, { createContext, useEffect, useMemo, useState } from 'react';
import { addMeal as saveMeal, getMealsByDate, getUser, saveUser } from '../logic/storage';
import { getTodayISO } from '../logic/utils';

export const DietContext = createContext();

export const DietProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const storedUser = await getUser();
      setUser(storedUser);
      await refreshTodayMeals();
      setLoading(false);
    };
    init();
  }, []);

  const refreshTodayMeals = async () => {
    const today = getTodayISO();
    const todaysMeals = await getMealsByDate(today);
    setMeals(todaysMeals);
    return todaysMeals;
  };

  const saveUserData = async (data) => {
    await saveUser(data);
    setUser(data);
  };

  const addMeal = async (meal) => {
    await saveMeal(meal);
    await refreshTodayMeals();
  };

  const value = useMemo(
    () => ({
      user,
      setUser: saveUserData,
      meals,
      setMeals,
      addMeal,
      refreshTodayMeals,
      loading,
      reloadUser: async () => {
        const u = await getUser();
        setUser(u);
        return u;
      },
    }),
    [user, meals, loading]
  );

  return <DietContext.Provider value={value}>{children}</DietContext.Provider>;
};
