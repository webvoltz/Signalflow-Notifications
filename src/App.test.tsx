import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./config/firebase', () => ({
  firestore: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  onSnapshot: vi.fn((_query: unknown, onNext: (snapshot: { docs: unknown[] }) => void) => {
    onNext({ docs: [] });
    return vi.fn();
  }),
  serverTimestamp: vi.fn(),
  updateDoc: vi.fn(),
  Timestamp: class {
    toMillis(): number {
      return 0;
    }
  },
}));

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
});
