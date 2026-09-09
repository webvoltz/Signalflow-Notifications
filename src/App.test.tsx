import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

interface FakeDocSnapshot {
  id: string;
  data: () => unknown;
}

const addDocMock = vi.fn<(collectionRef: unknown, data: unknown) => Promise<{ id: string }>>();
let latestSnapshotCallback: ((snapshot: { docs: FakeDocSnapshot[] }) => void) | undefined;

vi.mock('./config/firebase', () => ({
  firestore: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: (...args: Parameters<typeof addDocMock>) => addDocMock(...args),
  onSnapshot: vi.fn((_query: unknown, onNext: (snapshot: { docs: FakeDocSnapshot[] }) => void) => {
    latestSnapshotCallback = onNext;
    onNext({ docs: [] });
    return vi.fn();
  }),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
  Timestamp: class {
    toMillis(): number {
      return 0;
    }
  },
}));

function pushSnapshot(docs: FakeDocSnapshot[]): void {
  latestSnapshotCallback?.({ docs });
}

describe('App', () => {
  it('shows the notifications header and a send button', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /SignalFlow Notifications/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send info/i })).toBeInTheDocument();
  });

  it('shows the empty state once loading finishes with no notifications', () => {
    render(<App />);

    expect(screen.getByText(/No notifications yet\./i)).toBeInTheDocument();
  });

  it('creates a notification when a send button is clicked', async () => {
    addDocMock.mockResolvedValue({ id: 'new-id' });
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Send info/i }));

    await waitFor(() => {
      expect(addDocMock).toHaveBeenCalledTimes(1);
    });
  });

  it('marks a notification as read when its row action is clicked', async () => {
    render(<App />);

    pushSnapshot([
      {
        id: 'n1',
        data: () => ({ type: 'info', message: 'Hello', read: false, createdAt: null }),
      },
    ]);

    const markAsReadButton = await screen.findByRole('button', { name: /Mark as read/i });
    fireEvent.click(markAsReadButton);

    await waitFor(() => {
      expect(screen.queryByRole('button', { name: /Mark as read/i })).not.toBeInTheDocument();
    });
  });
});
