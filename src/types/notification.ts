export type NotificationType = 'info' | 'alert' | 'message';

export interface NotificationRecord {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: number;
}
