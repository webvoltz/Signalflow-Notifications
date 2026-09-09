import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { z } from 'zod';
import { firestore } from '../config/firebase';
import type { NotificationRecord, NotificationType } from '../types/notification';

const NOTIFICATIONS_COLLECTION = 'notifications';

const notificationDataSchema = z.object({
  type: z.enum(['info', 'alert', 'message']),
  message: z.string(),
  read: z.boolean(),
  timestamp: z.object({
    seconds: z.number(),
    nanoseconds: z.number(),
  }),
});

function toNotificationRecord(id: string, data: unknown): NotificationRecord | null {
  const result = notificationDataSchema.safeParse(data);

  return result.success ? { id, ...result.data } : null;
}

function generateSampleDigits(): string {
  return String(Math.floor(Math.random() * 900) + 100);
}

function titleForType(type: NotificationType): string {
  switch (type) {
    case 'info':
      return 'Info';
    case 'alert':
      return 'Alert';
    case 'message':
      return 'Message';
  }
}

export interface CreatedNotification {
  id: string;
  title: string;
  message: string;
}

/**
 * Creates a sample notification of the given type in Firestore.
 */
export async function createNotification(type: NotificationType): Promise<CreatedNotification> {
  const title = titleForType(type);
  const message = `This is a sample ${title} text - ${generateSampleDigits()}`;

  const docRef = await addDoc(collection(firestore, NOTIFICATIONS_COLLECTION), {
    type,
    message,
    read: false,
    timestamp: new Date(),
  });

  return { id: docRef.id, title: `New ${title}`, message };
}

/**
 * Subscribes to realtime updates on the notifications collection.
 * Returns an unsubscribe function.
 */
export function subscribeToNotifications(
  onData: (notifications: NotificationRecord[]) => void,
): Unsubscribe {
  return onSnapshot(collection(firestore, NOTIFICATIONS_COLLECTION), (snapshot) => {
    const notifications = snapshot.docs
      .map((docSnapshot) => toNotificationRecord(docSnapshot.id, docSnapshot.data()))
      .filter((notification): notification is NotificationRecord => notification !== null);

    onData(notifications);
  });
}

/**
 * Marks a notification as read in Firestore.
 */
export async function markNotificationAsRead(id: string): Promise<void> {
  await updateDoc(doc(firestore, NOTIFICATIONS_COLLECTION, id), { read: true });
}
