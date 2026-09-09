import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import LoadingScreen from './LoadingScreen';

describe('LoadingScreen', () => {
  it('identifies the app while the subscription connects', () => {
    render(<LoadingScreen />);

    expect(screen.getByRole('heading', { name: /SignalFlow Notifications/i })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/Connecting to Firestore/i);
  });
});
