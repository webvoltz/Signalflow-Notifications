import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { z } from 'zod';
import { firestore } from '../config/firebase';
import type { NotificationRecord, NotificationType } from '../types/notification';

const NOTIFICATIONS_COLLECTION = 'notifications';

const notificationDocumentSchema = z.object({
  type: z.enum(['info', 'alert', 'message']),
  message: z.string(),
  read: z.boolean(),
  createdAt: z.union([z.instanceof(Timestamp), z.null()]),
});

function toNotificationRecord(id: string, data: unknown): NotificationRecord | null {
  const result = notificationDocumentSchema.safeParse(data);

  if (!result.success) {
    return null;
  }

  const { type, message, read, createdAt } = result.data;

  return {
    id,
    type,
    message,
    read,
    // createdAt is null for the brief window between an optimistic client
    // write and the server resolving its serverTimestamp() sentinel; the
    // listener fires again with the real value as soon as it's available.
    createdAt: createdAt === null ? Date.now() : createdAt.toMillis(),
  };
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

/**
 * Creates a sample notification of the given type in Firestore.
 * Returns the new document's id.
 */
export async function createNotification(type: NotificationType): Promise<string> {
  const title = titleForType(type);
  const message = `This is a sample ${title} text - ${generateSampleDigits()}`;

  const docRef = await addDoc(collection(firestore, NOTIFICATIONS_COLLECTION), {
    type,
    message,
    read: false,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Subscribes to realtime updates on the notifications collection.
 * Returns an unsubscribe function.
 */
export function subscribeToNotifications(
  onData: (notifications: NotificationRecord[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(firestore, NOTIFICATIONS_COLLECTION),
    (snapshot) => {
      const notifications = snapshot.docs
        .map((docSnapshot) => toNotificationRecord(docSnapshot.id, docSnapshot.data()))
        .filter((notification): notification is NotificationRecord => notification !== null);

      onData(notifications);
    },
    onError,
  );
}

/**
 * Marks a notification as read in Firestore.
 */
export async function markNotificationAsRead(id: string): Promise<void> {
  await updateDoc(doc(firestore, NOTIFICATIONS_COLLECTION, id), { read: true });
}
