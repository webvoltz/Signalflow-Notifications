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
const MAX_MESSAGE_LENGTH = 500;

// Shared by both directions: validated before a write leaves the client
// (defense in depth - the UI already validates, but never trust that
// alone), and reused (via .extend()) to validate documents read back
// off a snapshot, so the shape is defined exactly once.
const notificationInputSchema = z.object({
  type: z.enum(['info', 'alert', 'message']),
  message: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
});

const notificationDocumentSchema = notificationInputSchema.extend({
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

/**
 * Creates a notification of the given type with the given message.
 * Returns the new document's id.
 */
export async function createNotification(type: NotificationType, message: string): Promise<string> {
  const input = notificationInputSchema.parse({ type, message });

  const docRef = await addDoc(collection(firestore, NOTIFICATIONS_COLLECTION), {
    type: input.type,
    message: input.message,
    read: false,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export interface NotificationsSnapshotMeta {
  /**
   * Firestore delivers a listener's first snapshot from local cache
   * immediately (fromCache: true) - even brand new, empty, and with no
   * emulator or backend reachable at all - then again once the server
   * actually confirms it (fromCache: false). Callers should treat
   * fromCache: true data as unconfirmed rather than "loaded".
   */
  fromCache: boolean;
}

/**
 * Subscribes to realtime updates on the notifications collection.
 * Returns an unsubscribe function.
 */
export function subscribeToNotifications(
  onData: (notifications: NotificationRecord[], meta: NotificationsSnapshotMeta) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    collection(firestore, NOTIFICATIONS_COLLECTION),
    (snapshot) => {
      const notifications = snapshot.docs
        .map((docSnapshot) => toNotificationRecord(docSnapshot.id, docSnapshot.data()))
        .filter((notification): notification is NotificationRecord => notification !== null);

      onData(notifications, { fromCache: snapshot.metadata.fromCache });
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
