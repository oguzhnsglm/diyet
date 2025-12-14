import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme !== null) {
        setIsDarkMode(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDarkMode;
      setIsDarkMode(newTheme);
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const colors = isDarkMode ? {
    // Dark mode colors
    background: '#000000',
    cardBackground: '#1C1C1E',
    text: '#FFFFFF',
    secondaryText: '#8E8E93',
    border: '#38383A',
    primary: '#0A84FF',
    success: '#32D74B',
    danger: '#FF453A',
    warning: '#FF9F0A',
  } : {
    // Light mode colors
    background: '#F2F2F7',
    cardBackground: '#FFFFFF',
    text: '#000000',
    secondaryText: '#8E8E93',
    border: '#E5E5EA',
    primary: '#0A84FF',
    success: '#32D74B',
    danger: '#FF3B30',
    warning: '#FF9500',
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
