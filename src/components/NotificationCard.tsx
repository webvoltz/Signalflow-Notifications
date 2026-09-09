import { useState } from 'react';
import type { FC } from 'react';
import type { NotificationRecord } from '../types/notification';
import { NOTIFICATION_TYPE_META } from '../utils/notificationTypeMeta';
import { formatRelativeTime } from '../utils/formatRelativeTime';

interface NotificationCardProps {
  notification: NotificationRecord;
  animationDelayMs: number;
  onMarkAsRead: (id: string) => Promise<boolean>;
}

/**
 * A single notification. Type is always shown as an icon + text label
 * together (never color alone). Unread notifications get a stronger
 * visual treatment and the only interactive "Mark as read" action;
 * read ones show a static "Read" status - Firestore's rules only ever
 * allow false -> true, so there is deliberately no way back.
 */
const NotificationCard: FC<NotificationCardProps> = ({
  notification,
  animationDelayMs,
  onMarkAsRead,
}) => {
  const [isPending, setIsPending] = useState(false);
  const meta = NOTIFICATION_TYPE_META[notification.type];
  const time = formatRelativeTime(notification.createdAt);

  const handleMarkAsRead = async (): Promise<void> => {
    // No guard for notification.read here - the only caller of this
    // function is the "Mark as read" button below, which is never
    // rendered once a notification is read.
    if (isPending) {
      return;
    }

    setIsPending(true);
    await onMarkAsRead(notification.id);
    setIsPending(false);
  };

  return (
    <li
      className={`notification-card ${notification.read ? 'is-read' : 'is-unread'}`}
      style={{ animationDelay: `${animationDelayMs.toString()}ms` }}
    >
      <span className="notification-card-icon" aria-hidden="true">
        {meta.icon}
      </span>
      <div className="notification-card-body">
        <div className="notification-card-heading">
          <span className="notification-card-type">{meta.label}</span>
          {!notification.read && <span className="notification-card-dot" aria-hidden="true" />}
        </div>
        <p className="notification-card-message">{notification.message}</p>
        <div className="notification-card-footer">
          <time
            className="notification-card-time"
            dateTime={time.isValid ? new Date(notification.createdAt).toISOString() : undefined}
            title={time.fullDate}
          >
            {time.label}
          </time>
          {notification.read ? (
            <span className="notification-card-status">Read</span>
          ) : (
            <button
              type="button"
              className="notification-card-action"
              disabled={isPending}
              onClick={() => {
                void handleMarkAsRead();
              }}
            >
              {isPending ? (
                <>
                  <span className="notification-card-spinner" aria-hidden="true" />
                  Updating…
                </>
              ) : (
                'Mark as read'
              )}
            </button>
          )}
        </div>
      </div>
    </li>
  );
};

export default NotificationCard;
