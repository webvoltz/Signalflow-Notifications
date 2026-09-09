import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ConfigErrorScreen from './ConfigErrorScreen';

describe('ConfigErrorScreen', () => {
  it('shows the failure message and how to fix it', () => {
    render(<ConfigErrorScreen message="Invalid application configuration." />);

    expect(screen.getByRole('alert')).toHaveTextContent('Invalid application configuration.');
    expect(screen.getByText(/\.env\.example/)).toBeInTheDocument();
  });
});
