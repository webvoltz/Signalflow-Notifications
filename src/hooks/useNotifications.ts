import { useCallback, useEffect, useState } from 'react';
import {
  createNotification,
  markNotificationAsRead,
  subscribeToNotifications,
} from '../services/notificationService';
import type { NotificationRecord, NotificationType } from '../types/notification';

export interface UseNotificationsResult {
  notifications: NotificationRecord[];
  loading: boolean;
  error: string | null;
  sendNotification: (type: NotificationType) => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
}

function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

/**
 * Owns the realtime notification list: subscribes on mount, exposes
 * loading/error state, and applies an optimistic update (with rollback)
 * when marking a notification as read.
 */
export function useNotifications(): UseNotificationsResult {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications(
      (data, meta) => {
        setNotifications(data);
        setError(null);

        // Firestore's first snapshot is served from local cache, even
        // with no emulator/backend reachable at all - only clear the
        // initial loading state once the server has actually confirmed
        // a snapshot, so a missing emulator shows "still connecting"
        // instead of a false "loaded, no notifications".
        if (!meta.fromCache) {
          setLoading(false);
        }
      },
      (subscriptionError) => {
        setError(subscriptionError.message);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, []);

  const sendNotification = useCallback(async (type: NotificationType) => {
    try {
      await createNotification(type);
      setError(null);
    } catch (creationError) {
      setError(toErrorMessage(creationError, 'Failed to create notification.'));
    }
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    let previousRead: boolean | undefined;

    setNotifications((current) =>
      current.map((notification) => {
        if (notification.id !== id) {
          return notification;
        }
        previousRead = notification.read;
        return { ...notification, read: true };
      }),
    );

    try {
      await markNotificationAsRead(id);
      setError(null);
    } catch (updateError) {
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id && previousRead !== undefined
            ? { ...notification, read: previousRead }
            : notification,
        ),
      );
      setError(toErrorMessage(updateError, 'Failed to update notification.'));
    }
  }, []);

  return { notifications, loading, error, sendNotification, markAsRead };
}
