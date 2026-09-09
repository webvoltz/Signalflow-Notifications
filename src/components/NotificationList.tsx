import { useMemo } from 'react';
import type { FC } from 'react';
import type { NotificationRecord } from '../types/notification';

interface NotificationListProps {
  notifications: readonly NotificationRecord[];
  onMarkAsRead: (id: string) => void;
}

/**
 * Renders the realtime notification list, newest first, with an
 * unread/read indicator and a mark-as-read action per row.
 */
const NotificationList: FC<NotificationListProps> = ({ notifications, onMarkAsRead }) => {
  const sortedNotifications = useMemo(
    () => [...notifications].sort((a, b) => b.createdAt - a.createdAt),
    [notifications],
  );

  if (sortedNotifications.length === 0) {
    return <p className="notification-empty">No notifications yet.</p>;
  }

  return (
    <table className="notification-table">
      <caption className="sr-only">Notifications</caption>
      <thead>
        <tr>
          <th scope="col">Message</th>
          <th scope="col">Type</th>
          <th scope="col">Status</th>
          <th scope="col">Received</th>
          <th scope="col">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {sortedNotifications.map((notification) => (
          <tr key={notification.id} className={notification.read ? 'is-read' : 'is-unread'}>
            <td>{notification.message}</td>
            <td>{notification.type}</td>
            <td>{notification.read ? 'Read' : 'Unread'}</td>
            <td>{new Date(notification.createdAt).toLocaleString()}</td>
            <td>
              {!notification.read && (
                <button
                  type="button"
                  onClick={() => {
                    onMarkAsRead(notification.id);
                  }}
                >
                  Mark as read
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default NotificationList;
