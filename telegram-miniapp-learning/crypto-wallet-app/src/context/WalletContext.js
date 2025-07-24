import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useTelegram } from '../hooks/useTelegram';

// Типы действий
const WALLET_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CONNECT_WALLET: 'CONNECT_WALLET',
  DISCONNECT_WALLET: 'DISCONNECT_WALLET',
  UPDATE_BALANCES: 'UPDATE_BALANCES',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  SET_TRANSACTIONS: 'SET_TRANSACTIONS',
  SET_CURRENT_TAB: 'SET_CURRENT_TAB',
  TOGGLE_HISTORY: 'TOGGLE_HISTORY'
};

// Начальное состояние
const initialState = {
  isConnected: false,
  isLoading: false,
  error: null,
  walletType: null,
  walletAddress: null,
  balances: {
    ton: 0,
    usdt: 0,
    eth: 0,
    btc: 0
  },
  transactions: [],
  currentTab: 'wallet', // wallet, history, settings
  showHistory: true,
  lastUpdated: null
};

// Reducer для управления состоянием
const walletReducer = (state, action) => {
  switch (action.type) {
    case WALLET_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
        error: action.payload ? null : state.error
      };

    case WALLET_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };

    case WALLET_ACTIONS.CONNECT_WALLET:
      return {
        ...state,
        isConnected: true,
        walletType: action.payload.walletType,
        walletAddress: action.payload.address,
        error: null,
        isLoading: false
      };

    case WALLET_ACTIONS.DISCONNECT_WALLET:
      return {
        ...initialState,
        currentTab: state.currentTab,
        showHistory: state.showHistory
      };

    case WALLET_ACTIONS.UPDATE_BALANCES:
      return {
        ...state,
        balances: action.payload,
        lastUpdated: new Date().toISOString()
      };

    case WALLET_ACTIONS.ADD_TRANSACTION:
      return {
        ...state,
        transactions: [action.payload, ...state.transactions]
      };

    case WALLET_ACTIONS.SET_TRANSACTIONS:
      return {
        ...state,
        transactions: action.payload
      };

    case WALLET_ACTIONS.SET_CURRENT_TAB:
      return {
        ...state,
        currentTab: action.payload
      };

    case WALLET_ACTIONS.TOGGLE_HISTORY:
      return {
        ...state,
        showHistory: !state.showHistory
      };

    default:
      return state;
  }
};

// Создаем контекст
const WalletContext = createContext();

// Provider компонент
export const WalletProvider = ({ children }) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);
  const { showAlert, hapticFeedback } = useTelegram();

  // Действия
  const actions = {
    setLoading: (loading) => {
      dispatch({ type: WALLET_ACTIONS.SET_LOADING, payload: loading });
    },

    setError: (error) => {
      dispatch({ type: WALLET_ACTIONS.SET_ERROR, payload: error });
      if (error) {
        showAlert(`Ошибка: ${error}`);
        hapticFeedback('notification', 'error');
      }
    },

    connectWallet: async (walletType = 'tonkeeper') => {
      dispatch({ type: WALLET_ACTIONS.SET_LOADING, payload: true });
      
      try {
        // Симулируем подключение к кошельку
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const mockAddress = `EQD${Math.random().toString(36).substr(2, 45)}`;
        
        dispatch({
          type: WALLET_ACTIONS.CONNECT_WALLET,
          payload: {
            walletType,
            address: mockAddress
          }
        });

        // Загружаем начальные данные
        actions.loadBalances();
        actions.loadTransactions();

        hapticFeedback('notification', 'success');
        showAlert('Кошелек успешно подключен!');
        
        return { success: true };
      } catch (error) {
        actions.setError(error.message);
        return { success: false, error: error.message };
      }
    },

    disconnectWallet: () => {
      dispatch({ type: WALLET_ACTIONS.DISCONNECT_WALLET });
      hapticFeedback('impact', 'medium');
      showAlert('Кошелек отключен');
    },

    loadBalances: async () => {
      if (!state.isConnected) return;
      
      try {
        // Симулируем загрузку балансов
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockBalances = {
          ton: parseFloat((Math.random() * 100).toFixed(2)),
          usdt: parseFloat((Math.random() * 1000).toFixed(2)),
          eth: parseFloat((Math.random() * 10).toFixed(4)),
          btc: parseFloat((Math.random() * 0.1).toFixed(6))
        };

        dispatch({
          type: WALLET_ACTIONS.UPDATE_BALANCES,
          payload: mockBalances
        });
      } catch (error) {
        actions.setError('Ошибка загрузки балансов');
      }
    },

    loadTransactions: async () => {
      if (!state.isConnected) return;
      
      try {
        // Симулируем загрузку транзакций
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const mockTransactions = [
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
        ];

        dispatch({
          type: WALLET_ACTIONS.SET_TRANSACTIONS,
          payload: mockTransactions
        });
      } catch (error) {
        actions.setError('Ошибка загрузки транзакций');
      }
    },

    sendTransaction: async (to, amount, currency) => {
      if (!state.isConnected) {
        actions.setError('Кошелек не подключен');
        return { success: false };
      }

      dispatch({ type: WALLET_ACTIONS.SET_LOADING, payload: true });

      try {
        // Проверяем баланс
        if (state.balances[currency.toLowerCase()] < amount) {
          throw new Error('Недостаточно средств');
        }

        // Симулируем отправку транзакции
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Создаем новую транзакцию
        const newTransaction = {
          id: Date.now(),
          type: 'send',
          amount: `-${amount} ${currency}`,
          to,
          date: new Date().toISOString(),
          status: 'completed',
          hash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 8)}`
        };

        // Обновляем баланс
        const newBalances = {
          ...state.balances,
          [currency.toLowerCase()]: state.balances[currency.toLowerCase()] - amount
        };

        dispatch({ type: WALLET_ACTIONS.UPDATE_BALANCES, payload: newBalances });
        dispatch({ type: WALLET_ACTIONS.ADD_TRANSACTION, payload: newTransaction });

        hapticFeedback('notification', 'success');
        showAlert('Транзакция отправлена!');

        return { success: true, hash: newTransaction.hash };
      } catch (error) {
        actions.setError(error.message);
        return { success: false, error: error.message };
      } finally {
        dispatch({ type: WALLET_ACTIONS.SET_LOADING, payload: false });
      }
    },

    setCurrentTab: (tab) => {
      dispatch({ type: WALLET_ACTIONS.SET_CURRENT_TAB, payload: tab });
      hapticFeedback('selection');
    },

    toggleHistory: () => {
      dispatch({ type: WALLET_ACTIONS.TOGGLE_HISTORY });
      hapticFeedback('impact', 'light');
    },

    refreshData: async () => {
      if (state.isConnected) {
        await Promise.all([
          actions.loadBalances(),
          actions.loadTransactions()
        ]);
        hapticFeedback('impact', 'light');
      }
    }
  };

  // Автоматическое обновление данных каждые 30 секунд
  useEffect(() => {
    if (!state.isConnected) return;

    const interval = setInterval(() => {
      actions.refreshData();
    }, 30000);

    return () => clearInterval(interval);
  }, [state.isConnected]);

  // Вычисляемые значения
  const computedValues = {
    getTotalUSDValue: () => {
      const rates = { ton: 5.2, usdt: 1, eth: 2300, btc: 45000 };
      return Object.entries(state.balances).reduce((total, [currency, amount]) => {
        return total + (amount * (rates[currency] || 0));
      }, 0).toFixed(2);
    },

    getRecentTransactions: (limit = 5) => {
      return state.transactions.slice(0, limit);
    }
  };

  const contextValue = {
    ...state,
    actions,
    ...computedValues
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

// Хук для использования контекста
export const useWalletContext = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWalletContext must be used within a WalletProvider');
  }
  return context;
};