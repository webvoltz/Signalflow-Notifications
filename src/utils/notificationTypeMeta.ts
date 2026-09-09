import type { NotificationType } from '../types/notification';

export interface NotificationTypeMeta {
  icon: string;
  label: string;
}

/**
 * Visual identity for each notification type. Icon and label are always
 * shown together so type is never communicated by color alone.
 */
export const NOTIFICATION_TYPE_META: Record<NotificationType, NotificationTypeMeta> = {
  info: { icon: 'ℹ️', label: 'Info' },
  alert: { icon: '⚠️', label: 'Alert' },
  message: { icon: '💬', label: 'Message' },
};

export const NOTIFICATION_TYPES: readonly NotificationType[] = ['info', 'alert', 'message'];
