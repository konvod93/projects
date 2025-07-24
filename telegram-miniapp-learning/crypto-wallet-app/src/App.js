import React, { useEffect } from 'react';
import { useTelegram } from './hooks/useTelegram';
import { useWalletContext } from './context/WalletContext';
import './App.css';

// Компонент для отображения информации о пользователе
function UserProfile({ user, isInTelegram }) {
  if (!isInTelegram) {
    return (
      <div className="user-profile">
        <div className="warning">
          ⚠️ Откройте приложение через Telegram для полного функционала
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile">
      <div className="user-avatar">
        {user?.first_name?.charAt(0) || '?'}
      </div>
      <div className="user-info">
        <h2>{user?.first_name} {user?.last_name}</h2>
        <p>@{user?.username || 'без username'}</p>
        <span className="user-id">ID: {user?.id}</span>
      </div>
    </div>
  );
}

// Компонент подключения кошелька
function WalletConnection() {
  const { isConnected, isLoading, actions } = useWalletContext();
  const { hapticFeedback } = useTelegram();

  const handleConnect = async () => {
    hapticFeedback('impact', 'medium');
    await actions.connectWallet('tonkeeper');
  };

  const handleDisconnect = () => {
    hapticFeedback('impact', 'heavy');
    actions.disconnectWallet();
  };

  if (isConnected) {
    return (
      <div className="wallet-connection connected">
        <div className="connection-status">
          <span className="status-indicator online"></span>
          <span>Кошелек подключен</span>
        </div>
        <button 
          className="disconnect-btn" 
          onClick={handleDisconnect}
          disabled={isLoading}
        >
          Отключить
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-connection">
      <div className="connection-prompt">
        <h3>🔗 Подключите кошелек</h3>
        <p>Для работы с криптовалютами необходимо подключить кошелек</p>
      </div>
      <button 
        className="connect-btn" 
        onClick={handleConnect}
        disabled={isLoading}
      >
        {isLoading ? 'Подключение...' : '🔌 Подключить TonKeeper'}
      </button>
    </div>
  );
}

// Обновленный компонент кошелька с Context
function WalletBalance() {
  const { balances, isLoading, actions, getTotalUSDValue, lastUpdated } = useWalletContext();

  const handleRefresh = () => {
    actions.refreshData();
  };

  return (
    <div className="wallet-balance">
      <div className="balance-header">
        <div>
          <h3>💰 Баланс кошелька</h3>
          <p className="total-usd">${getTotalUSDValue()} USD</p>
        </div>
        <button 
          className={`refresh-btn ${isLoading ? 'loading' : ''}`} 
          onClick={handleRefresh}
          disabled={isLoading}
        >
          🔄
        </button>
      </div>
      
      {lastUpdated && (
        <p className="last-updated">
          Обновлено: {new Date(lastUpdated).toLocaleTimeString()}
        </p>
      )}
      
      <div className="balance-cards">
        <div className="balance-card">
          <div className="currency">TON</div>
          <div className="amount">{balances.ton}</div>
        </div>
        
        <div className="balance-card">
          <div className="currency">USDT</div>
          <div className="amount">{balances.usdt}</div>
        </div>
        
        <div className="balance-card">
          <div className="currency">ETH</div>
          <div className="amount">{balances.eth}</div>
        </div>
      </div>
    </div>
  );
}

// Обновленный компонент кнопок действий
function ActionButtons() {
  const { isConnected, actions } = useWalletContext();
  const { showAlert, hapticFeedback, showConfirm } = useTelegram();

  if (!isConnected) return null;

  const handleSend = () => {
    hapticFeedback('impact', 'medium');
    showAlert('Функция отправки будет добавлена в следующих уроках!');
  };

  const handleReceive = () => {
    hapticFeedback('selection');
    showAlert('Адрес для получения: TON_ADDRESS_PLACEHOLDER');
  };

  const handleSwap = () => {
    hapticFeedback('impact', 'heavy');
    showConfirm('Открыть функцию обмена?', (confirmed) => {
      if (confirmed) {
        showAlert('Функция обмена в разработке!');
      }
    });
  };

  return (
    <div className="action-buttons">
      <button className="action-btn send" onClick={handleSend}>
        📤 Отправить
      </button>
      <button className="action-btn receive" onClick={handleReceive}>
        📥 Получить
      </button>
      <button className="action-btn swap" onClick={handleSwap}>
        🔄 Обменять
      </button>
    </div>
  );
}

// Обновленный компонент истории транзакций
function TransactionHistory() {
  const { transactions, showHistory, actions, isConnected } = useWalletContext();

  if (!isConnected) return null;

  const handleToggleHistory = () => {
    actions.toggleHistory();
  };

  return (
    <div className="transaction-history">
      <div className="history-header">
        <h3>📈 История транзакций</h3>
        <button className="toggle-btn" onClick={handleToggleHistory}>
          {showHistory ? '👁️ Скрыть' : '👁️ Показать'}
        </button>
      </div>
      
      {showHistory && (
        <div className="transactions-list">
          {transactions.length === 0 ? (
            <p className="no-transactions">Пока нет транзакций</p>
          ) : (
            transactions.map(tx => (
              <div key={tx.id} className={`transaction ${tx.type}`}>
                <div className="tx-info">
                  <div className="tx-amount">{tx.amount}</div>
                  <div className="tx-date">
                    {new Date(tx.date).toLocaleDateString()}
                  </div>
                  {tx.hash && (
                    <div className="tx-hash">{tx.hash}</div>
                  )}
                </div>
                <div className={`tx-status ${tx.status}`}>
                  {tx.status === 'completed' ? '✅' : '⏳'}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

// Главный компонент приложения
function App() {
  const { user, isLoading, isInTelegram, colorScheme, setMainButton } = useTelegram();
  const { isConnected, error, actions } = useWalletContext();

  useEffect(() => {
    if (isInTelegram) {
      if (isConnected) {
        setMainButton('Настройки', () => {
          alert('Настройки кошелька (в разработке)');
        }, true);
      } else {
        setMainButton('Подключить кошелек', () => {
          actions.connectWallet('tonkeeper');
        }, true);
      }
    }
  }, [isInTelegram, isConnected, setMainButton, actions]);

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Инициализация кошелька...</p>
      </div>
    );
  }

  return (
    <div className={`App ${colorScheme}`}>
      <div className="app-container">
        {error && (
          <div className="error-banner">
            <span>❌ {error}</span>
            <button onClick={() => actions.setError(null)}>×</button>
          </div>
        )}

        <UserProfile user={user} isInTelegram={isInTelegram} />
        
        {isInTelegram ? (
          <>
            <WalletConnection />
            {isConnected && (
              <>
                <WalletBalance />
                <ActionButtons />
                <TransactionHistory />
              </>
            )}
          </>
        ) : (
          <div className="demo-mode">
            <h2>🚀 Демо режим</h2>
            <p>Это превью криптокошелька для Telegram MiniApp</p>
            <div className="demo-features">
              <div className="feature">✅ React компоненты</div>
              <div className="feature">✅ Context API</div>
              <div className="feature">✅ Custom Hooks</div>
              <div className="feature">✅ Telegram Web App API</div>
              <div className="feature">🔄 Интеграция с блокчейном (скоро)</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;