import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from './App';

vi.mock('./config/firebase', () => ({
  firestore: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  doc: vi.fn(),
  onSnapshot: vi.fn((_query: unknown, callback: (snapshot: { docs: unknown[] }) => void) => {
    callback({ docs: [] });
    return vi.fn();
  }),
  updateDoc: vi.fn(),
}));

describe('App', () => {
  it('shows the notifications header and a send button', () => {
    render(<App />);

    expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send info/i })).toBeInTheDocument();
  });
});
