import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { ToastContainer } from 'react-toastify';
import NotificationButton from './components/NotificationButton';
import NotificationTable from './components/NotificationTable';
import { subscribeToNotifications } from './services/notificationService';
import type { NotificationRecord } from './types/notification';
import './App.css';

const App: FC = () => {
  const [data, setData] = useState<NotificationRecord[]>([]);

  /**
   * Effect to subscribe to the notifications collection on Firestore.
   * Automatically unsubscribes on component unmount.
   */
  useEffect(() => {
    const unsubscribe = subscribeToNotifications(setData);

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        {/* Buttons for sending different types of notifications */}
        <NotificationButton type="info" />
        <NotificationButton type="alert" />
        <NotificationButton type="message" />
      </header>

      {/* Toast container to display notifications */}
      <ToastContainer />

      {/* Table to display notification data */}
      <div className="notification-table">
        <NotificationTable data={data} />
      </div>
    </div>
  );
};

export default App;
