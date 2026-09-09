import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

interface FakeDocSnapshot {
  id: string;
  data: () => unknown;
}

interface FakeQuerySnapshot {
  docs: FakeDocSnapshot[];
  metadata: { fromCache: boolean };
}

type SnapshotCallback = (snapshot: FakeQuerySnapshot) => void;

const addDocMock = vi.fn<(collectionRef: unknown, data: unknown) => Promise<{ id: string }>>();
const onSnapshotMock = vi.fn<(collectionRef: unknown, onNext: SnapshotCallback) => () => void>();
let latestSnapshotCallback: SnapshotCallback | undefined;

vi.mock('./config/firebase', () => ({
  firestore: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  addDoc: (...args: Parameters<typeof addDocMock>) => addDocMock(...args),
  onSnapshot: (...args: Parameters<typeof onSnapshotMock>) => onSnapshotMock(...args),
  updateDoc: vi.fn().mockResolvedValue(undefined),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
  Timestamp: class {
    toMillis(): number {
      return 0;
    }
  },
}));

function pushSnapshot(docs: FakeDocSnapshot[], fromCache = false): void {
  latestSnapshotCallback?.({ docs, metadata: { fromCache } });
}

beforeEach(() => {
  addDocMock.mockReset();
  onSnapshotMock.mockReset();
  onSnapshotMock.mockImplementation((_collectionRef, onNext) => {
    latestSnapshotCallback = onNext;
    onNext({ docs: [], metadata: { fromCache: false } });
    return vi.fn();
  });
});

describe('App', () => {
  it('shows a loading screen before the first snapshot arrives', async () => {
    onSnapshotMock.mockImplementationOnce((_collectionRef, onNext) => {
      latestSnapshotCallback = onNext;
      return vi.fn();
    });

    render(<App />);

    expect(screen.getByRole('status')).toHaveTextContent(/Connecting to Firestore/i);
    expect(screen.queryByRole('button', { name: /Send info/i })).not.toBeInTheDocument();

    pushSnapshot([]);

    expect(await screen.findByRole('button', { name: /Send info/i })).toBeInTheDocument();
  });

  it('keeps showing the loading screen while only a cache-sourced snapshot has arrived', () => {
    onSnapshotMock.mockImplementationOnce((_collectionRef, onNext) => {
      latestSnapshotCallback = onNext;
      onNext({ docs: [], metadata: { fromCache: true } });
      return vi.fn();
    });

    render(<App />);

    expect(screen.getByRole('status')).toHaveTextContent(/Connecting to Firestore/i);
    expect(screen.queryByRole('button', { name: /Send info/i })).not.toBeInTheDocument();
  });

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
