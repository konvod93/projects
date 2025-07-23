import { useEffect, useState } from 'react';

export const useTelegram = () => {
  const [tg, setTg] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем доступность Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
      const telegram = window.Telegram.WebApp;
      
      // Инициализируем Telegram WebApp
      telegram.ready();
      telegram.expand();
      
      setTg(telegram);
      setUser(telegram.initDataUnsafe?.user || null);
      
      // Настраиваем тему
      document.body.style.backgroundColor = telegram.backgroundColor || '#ffffff';
      document.body.style.color = telegram.themeParams?.text_color || '#000000';
      
      console.log('Telegram WebApp initialized:', {
        platform: telegram.platform,
        version: telegram.version,
        user: telegram.initDataUnsafe?.user
      });
    } else {
      console.warn('Telegram WebApp API not available');
    }
    
    setIsLoading(false);
  }, []);

  // Функции для работы с Telegram
  const showAlert = (message) => {
    if (tg) {
      tg.showAlert(message);
    } else {
      alert(message);
    }
  };

  const showConfirm = (message, callback) => {
    if (tg) {
      tg.showConfirm(message, callback);
    } else {
      const result = window.confirm(message);
      callback(result);
    }
  };

  const hapticFeedback = (type = 'impact', style = 'medium') => {
    if (tg && tg.HapticFeedback) {
      if (type === 'impact') {
        tg.HapticFeedback.impactOccurred(style);
      } else if (type === 'notification') {
        tg.HapticFeedback.notificationOccurred(style);
      } else if (type === 'selection') {
        tg.HapticFeedback.selectionChanged();
      }
    }
  };

  const setMainButton = (text, onClick, show = true) => {
    if (tg && tg.MainButton) {
      tg.MainButton.text = text;
      
      if (onClick) {
        tg.MainButton.onClick(onClick);
      }
      
      if (show) {
        tg.MainButton.show();
      } else {
        tg.MainButton.hide();
      }
    }
  };

  const closeApp = () => {
    if (tg) {
      tg.close();
    } else {
      console.log('Would close Telegram app');
    }
  };

  return {
    tg,
    user,
    isLoading,
    isInTelegram: !!tg,
    platform: tg?.platform || 'unknown',
    colorScheme: tg?.colorScheme || 'light',
    themeParams: tg?.themeParams || {},
    // Utility functions
    showAlert,
    showConfirm,
    hapticFeedback,
    setMainButton,
    closeApp
  };
};