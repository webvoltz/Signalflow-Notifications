import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NotificationRecord } from '../types/notification';
import type { NotificationsSnapshotMeta } from '../services/notificationService';

type SubscribeCallback = (
  notifications: NotificationRecord[],
  meta: NotificationsSnapshotMeta,
) => void;
type ErrorCallback = (error: Error) => void;

const subscribeMock = vi.fn<(onData: SubscribeCallback, onError: ErrorCallback) => () => void>();
const createNotificationMock = vi.fn<(type: string) => Promise<string>>();
const markNotificationAsReadMock = vi.fn<(id: string) => Promise<void>>();

vi.mock('../services/notificationService', () => ({
  subscribeToNotifications: subscribeMock,
  createNotification: createNotificationMock,
  markNotificationAsRead: markNotificationAsReadMock,
}));

const { useNotifications } = await import('./useNotifications');

const sampleNotification: NotificationRecord = {
  id: 'n1',
  type: 'info',
  message: 'Hello',
  read: false,
  createdAt: 1,
};

beforeEach(() => {
  subscribeMock.mockReset();
  createNotificationMock.mockReset();
  markNotificationAsReadMock.mockReset();
  subscribeMock.mockImplementation((onData) => {
    onData([sampleNotification], { fromCache: false });
    return vi.fn();
  });
});

describe('useNotifications', () => {
  it('does not clear loading until the subscription is confirmed by the server', () => {
    let capturedOnData: SubscribeCallback | undefined;
    subscribeMock.mockImplementation((onData) => {
      capturedOnData = onData;
      onData([], { fromCache: true });
      return vi.fn();
    });

    const { result } = renderHook(() => useNotifications());

    expect(result.current.loading).toBe(true);
    expect(result.current.notifications).toEqual([]);

    act(() => {
      capturedOnData?.([sampleNotification], { fromCache: false });
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.notifications).toEqual([sampleNotification]);
  });

  it('applies an optimistic read update immediately', async () => {
    markNotificationAsReadMock.mockResolvedValue(undefined);
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.markAsRead('n1');
    });

    expect(result.current.notifications[0]?.read).toBe(true);
    expect(markNotificationAsReadMock).toHaveBeenCalledWith('n1');
    expect(result.current.error).toBeNull();
  });

  it('rolls back the optimistic update when the write fails', async () => {
    markNotificationAsReadMock.mockRejectedValue(new Error('permission-denied'));
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.markAsRead('n1');
    });

    expect(result.current.notifications[0]?.read).toBe(false);
    expect(result.current.error).toBe('permission-denied');
  });

  it('surfaces subscription errors and stops loading', async () => {
    subscribeMock.mockImplementation((_onData: unknown, onError: (error: Error) => void) => {
      onError(new Error('unavailable'));
      return vi.fn();
    });

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('unavailable');
    expect(result.current.notifications).toEqual([]);
  });

  it('surfaces a creation failure without touching the notification list', async () => {
    createNotificationMock.mockRejectedValue(new Error('quota-exceeded'));
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.sendNotification('alert');
    });

    expect(createNotificationMock).toHaveBeenCalledWith('alert');
    expect(result.current.error).toBe('quota-exceeded');
    expect(result.current.notifications).toEqual([sampleNotification]);
  });

  it('clears any prior error once a notification is created successfully', async () => {
    createNotificationMock.mockResolvedValue('new-id');
    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.sendNotification('info');
    });

    expect(createNotificationMock).toHaveBeenCalledWith('info');
    expect(result.current.error).toBeNull();
  });

  it('leaves other notifications untouched when marking one as read', async () => {
    const otherNotification: NotificationRecord = {
      id: 'n2',
      type: 'alert',
      message: 'Other',
      read: false,
      createdAt: 2,
    };
    subscribeMock.mockImplementation((onData) => {
      onData([sampleNotification, otherNotification], { fromCache: false });
      return vi.fn();
    });
    markNotificationAsReadMock.mockResolvedValue(undefined);

    const { result } = renderHook(() => useNotifications());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.markAsRead('n1');
    });

    expect(result.current.notifications.find((n) => n.id === 'n1')?.read).toBe(true);
    expect(result.current.notifications.find((n) => n.id === 'n2')).toEqual(otherNotification);
  });
});
