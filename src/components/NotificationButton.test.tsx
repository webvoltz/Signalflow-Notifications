import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import NotificationButton from './NotificationButton';

describe('NotificationButton', () => {
  it('calls onSend with its notification type when clicked', () => {
    const onSend = vi.fn();
    render(<NotificationButton type="alert" onSend={onSend} />);

    fireEvent.click(screen.getByRole('button', { name: /Send alert/i }));

    expect(onSend).toHaveBeenCalledWith('alert');
  });
});
