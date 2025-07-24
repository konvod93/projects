import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button } from 'react-bootstrap';
import { ChevronDown, ChevronUp, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { useTelegram } from './hooks/useTelegram';
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

// Компонент кошелька (заглушка)
function WalletBalance() {
  const [balance, setBalance] = useState({
    ton: 0.00,
    usdt: 0.00,
    eth: 0.00
  });

  const { hapticFeedback } = useTelegram();

  const handleRefresh = () => {
    hapticFeedback('impact', 'light');
    // Симулируем обновление баланса
    setBalance({
      ton: (Math.random() * 100).toFixed(2),
      usdt: (Math.random() * 1000).toFixed(2),
      eth: (Math.random() * 10).toFixed(4)
    });
  };

  return (
    <div className="wallet-balance">
      <div className="balance-header">
        <h3>💰 Баланс кошелька</h3>
        <button className="refresh-btn" onClick={handleRefresh}>
          🔄
        </button>
      </div>
      
      <div className="balance-cards">
        <div className="balance-card">
          <div className="currency">TON</div>
          <div className="amount">{balance.ton}</div>
        </div>
        
        <div className="balance-card">
          <div className="currency">USDT</div>
          <div className="amount">{balance.usdt}</div>
        </div>
        
        <div className="balance-card">
          <div className="currency">ETH</div>
          <div className="amount">{balance.eth}</div>
        </div>
      </div>
    </div>
  );
}

// Компонент кнопок действий
function ActionButtons() {
  const { showAlert, hapticFeedback, showConfirm } = useTelegram();

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

// Компонент истории транзакций (заглушка)
function TransactionHistory() {
  const [isOpen, setIsOpen] = useState(false)
  const toggleHistory = () => {
    setIsOpen(!isOpen)
  }
  const [transactions] = useState([
    {
      id: 1,
      type: "receive",
      amount: "+5.25 TON",
      date: "2024-01-15",
      status: "completed",
    },
    {
      id: 2,
      type: "send",
      amount: "-2.10 USDT",
      date: "2024-01-14",
      status: "completed",
    },
    {
      id: 3,
      type: "swap",
      amount: "0.1 ETH → 150 USDT",
      date: "2024-01-13",
      status: "pending",
    },
  ]);

  return (
    <>
    <Button variant="primary" className='history-btn' size="lg" onClick={toggleHistory}>
      <span style={{borderRight: "1px solid white", marginRight: "15px", padding: "10px"}}>История транзакций</span>
     {isOpen ? (<ChevronUp className="w-5 h-5 text-gray-500" />) : (<ChevronDown className="w-5 h-5 text-gray-500" />)}
      </Button>
      <div className="transaction-history">
        <h3>📈 История транзакций </h3>
        <div className="transactions-list">
          {transactions.map((tx) => (
            <div key={tx.id} className={`transaction ${tx.type}`}>
              <div className="tx-info">
                <div className="tx-amount">{tx.amount}</div>
                <div className="tx-date">{tx.date}</div>
              </div>
              <div className={`tx-status ${tx.status}`}>
                {tx.status === "completed" ? "✅" : "⏳"}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// Главный компонент приложения
function App() {
  const { user, isLoading, isInTelegram, colorScheme, setMainButton } =
    useTelegram();

  useEffect(() => {
    if (isInTelegram) {
      setMainButton(
        "Настройки",
        () => {
          alert("Настройки кошелька (в разработке)");
        },
        true
      );
    }
  }, [isInTelegram, setMainButton]);

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
        <UserProfile user={user} isInTelegram={isInTelegram} />

        {isInTelegram && (
          <>
            <WalletBalance />
            <ActionButtons />
            <TransactionHistory />
          </>
        )}

        {!isInTelegram && (
          <div className="demo-mode">
            <h2>🚀 Демо режим</h2>
            <p>Это превью криптокошелька для Telegram MiniApp</p>
            <div className="demo-features">
              <div className="feature">✅ React компоненты</div>
              <div className="feature">✅ Telegram Web App API</div>
              <div className="feature">✅ Адаптивный дизайн</div>
              <div className="feature">🔄 Интеграция с блокчейном (скоро)</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;