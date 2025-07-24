import { useState, useEffect } from 'react';

export const useLocalStorage = (key, initialValue) => {
  // Получаем значение из localStorage или используем начальное
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // В Telegram Web App localStorage может быть недоступен
      if (typeof window === 'undefined' || !window.localStorage) {
        return initialValue;
      }
      
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Функция для обновления значения
  const setValue = (value) => {
    try {
      // Позволяем передавать функцию для обновления как в useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      // Сохраняем в localStorage если доступен
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Функция для удаления значения
  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
};

// Дополнительный хук для работы с настройками приложения
export const useAppSettings = () => {
  const [theme, setTheme] = useLocalStorage('wallet_theme', 'auto');
  const [currency, setCurrency] = useLocalStorage('display_currency', 'USD');
  const [notifications, setNotifications] = useLocalStorage('notifications_enabled', true);
  const [autoRefresh, setAutoRefresh] = useLocalStorage('auto_refresh', true);
  const [securityPin, setSecurityPin] = useLocalStorage('security_pin_enabled', false);

  const resetSettings = () => {
    setTheme('auto');
    setCurrency('USD');
    setNotifications(true);
    setAutoRefresh(true);
    setSecurityPin(false);
  };

  return {
    settings: {
      theme,
      currency,
      notifications,
      autoRefresh,
      securityPin
    },
    updateSettings: {
      setTheme,
      setCurrency,
      setNotifications,
      setAutoRefresh,
      setSecurityPin
    },
    resetSettings
  };
};