import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NotificationRecord } from '../types/notification';

type SubscribeCallback = (notifications: NotificationRecord[]) => void;
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
  subscribeMock.mockImplementation((onData: (notifications: NotificationRecord[]) => void) => {
    onData([sampleNotification]);
    return vi.fn();
  });
});

describe('useNotifications', () => {
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
});
