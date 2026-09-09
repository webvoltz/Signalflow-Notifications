import { useCallback } from 'react';
import type { FC } from 'react';
import NotificationButton from './components/NotificationButton';
import NotificationList from './components/NotificationList';
import { useNotifications } from './hooks/useNotifications';
import type { NotificationType } from './types/notification';
import './App.css';

const NOTIFICATION_TYPES: readonly NotificationType[] = ['info', 'alert', 'message'];

const App: FC = () => {
  const { notifications, loading, error, sendNotification, markAsRead } = useNotifications();

  const handleSend = useCallback(
    (type: NotificationType) => {
      void sendNotification(type);
    },
    [sendNotification],
  );

  const handleMarkAsRead = useCallback(
    (id: string) => {
      void markAsRead(id);
    },
    [markAsRead],
  );

  return (
    <div className="App">
      <header className="App-header">
        <h1>SignalFlow Notifications</h1>
        <div className="App-actions">
          {NOTIFICATION_TYPES.map((type) => (
            <NotificationButton key={type} type={type} onSend={handleSend} />
          ))}
        </div>
      </header>

      {error !== null && (
        <p role="alert" className="app-error">
          {error}
        </p>
      )}

      <main className="notification-table">
        {loading ? (
          <p role="status">Loading notifications…</p>
        ) : (
          <NotificationList notifications={notifications} onMarkAsRead={handleMarkAsRead} />
        )}
      </main>
    </div>
  );
};

export default App;
