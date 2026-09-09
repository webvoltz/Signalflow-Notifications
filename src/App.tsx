import { useEffect, useState } from 'react';
import type { FC } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { z } from 'zod';
import { db } from './firebaseConfig';
import NotificationButton from './components/NotificationButton';
import NotificationTable from './components/NotificationTable';
import { ToastContainer } from 'react-toastify';
import './App.css';

const notificationDataSchema = z.object({
  type: z.string(),
  message: z.string(),
  read: z.boolean(),
  timestamp: z.object({
    seconds: z.number(),
    nanoseconds: z.number(),
  }),
});

export type Notification = z.infer<typeof notificationDataSchema> & { id: string };

function toNotification(id: string, data: unknown): Notification | null {
  const result = notificationDataSchema.safeParse(data);

  if (!result.success) {
    return null;
  }

  return { id, ...result.data };
}

const App: FC = () => {
  const [data, setData] = useState<Notification[]>([]);

  /**
   * Effect to subscribe to the notifications collection on Firestore.
   * Automatically unsubscribes on component unmount.
   */
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const notifications: Notification[] = snapshot.docs
        .map((docSnapshot) => toNotification(docSnapshot.id, docSnapshot.data()))
        .filter((notification): notification is Notification => notification !== null);

      setData(notifications);
    });

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
