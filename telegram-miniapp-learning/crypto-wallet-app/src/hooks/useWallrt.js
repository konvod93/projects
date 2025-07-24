import { useState, useEffect, useCallback } from 'react';

export const useWallet = () => {
  const [balances, setBalances] = useState({
    ton: 0,
    usdt: 0,
    eth: 0,
    btc: 0
  });

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Симуляция подключения к кошельку
  const connectWallet = useCallback(async (walletType = 'tonkeeper') => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Симулируем задержку подключения
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Симулируем успешное подключение
      setIsConnected(true);
      
      // Загружаем начальные балансы
      setBalances({
        ton: parseFloat((Math.random() * 100).toFixed(2)),
        usdt: parseFloat((Math.random() * 1000).toFixed(2)),
        eth: parseFloat((Math.random() * 10).toFixed(4)),
        btc: parseFloat((Math.random() * 0.1).toFixed(6))
      });

      // Загружаем историю транзакций
      setTransactions([
        {
          id: 1,
          type: 'receive',
          amount: '+5.25 TON',
          from: 'EQD...xyz',
          date: new Date().toISOString(),
          status: 'completed',
          hash: '0x123...abc'
        },
        {
          id: 2,
          type: 'send',
          amount: '-2.10 USDT',
          to: 'EQA...def',
          date: new Date(Date.now() - 86400000).toISOString(),
          status: 'completed',
          hash: '0x456...def'
        },
        {
          id: 3,
          type: 'swap',
          amount: '0.1 ETH → 150 USDT',
          date: new Date(Date.now() - 172800000).toISOString(),
          status: 'pending',
          hash: '0x789...ghi'
        }
      ]);

      return { success: true, walletType };
    } catch (err) {
      setError(`Ошибка подключения: ${err.message}`);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Отключение кошелька
  const disconnectWallet = useCallback(() => {
    setIsConnected(false);
    setBalances({ ton: 0, usdt: 0, eth: 0, btc: 0 });
    setTransactions([]);
    setError(null);
  }, []);

  // Обновление балансов
  const refreshBalances = useCallback(async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setBalances(prev => ({
        ton: parseFloat((prev.ton + (Math.random() - 0.5) * 10).toFixed(2)),
        usdt: parseFloat((prev.usdt + (Math.random() - 0.5) * 100).toFixed(2)),
        eth: parseFloat((prev.eth + (Math.random() - 0.5) * 1).toFixed(4)),
        btc: parseFloat((prev.btc + (Math.random() - 0.5) * 0.01).toFixed(6))
      }));
    } catch (err) {
      setError(`Ошибка обновления: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [isConnected]);

  // Отправка транзакции
  const sendTransaction = useCallback(async (to, amount, currency) => {
    if (!isConnected) {
      throw new Error('Кошелек не подключен');
    }

    setIsLoading(true);
    setError(null);

    try {
      // Проверяем достаточность средств
      if (balances[currency.toLowerCase()] < amount) {
        throw new Error('Недостаточно средств');
      }

      // Симулируем отправку
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Обновляем баланс
      setBalances(prev => ({
        ...prev,
        [currency.toLowerCase()]: prev[currency.toLowerCase()] - amount
      }));

      // Добавляем транзакцию
      const newTransaction = {
        id: Date.now(),
        type: 'send',
        amount: `-${amount} ${currency}`,
        to,
        date: new Date().toISOString(),
        status: 'completed',
        hash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 8)}`
      };

      setTransactions(prev => [newTransaction, ...prev]);

      return { success: true, hash: newTransaction.hash };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, balances]);

  // Получение адреса кошелька
  const getWalletAddress = useCallback(() => {
    if (!isConnected) return null;
    return `EQD${Math.random().toString(36).substr(2, 45)}`;
  }, [isConnected]);

  // Автоматическое обновление балансов каждые 30 секунд
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      refreshBalances();
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, refreshBalances]);

  return {
    // Состояние
    balances,
    transactions,
    isLoading,
    error,
    isConnected,
    
    // Действия
    connectWallet,
    disconnectWallet,
    refreshBalances,
    sendTransaction,
    getWalletAddress,
    
    // Вспомогательные функции
    clearError: () => setError(null),
    getTotalUSDValue: () => {
      // Примерные курсы (в реальном приложении загружались бы с API)
      const rates = { ton: 5.2, usdt: 1, eth: 2300, btc: 45000 };
      return Object.entries(balances).reduce((total, [currency, amount]) => {
        return total + (amount * (rates[currency] || 0));
      }, 0).toFixed(2);
    }
  };
};