import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { NotificationRecord } from '../types/notification';
import NotificationList from './NotificationList';

const notifications: NotificationRecord[] = [
  { id: 'older', type: 'info', message: 'Older message', read: true, createdAt: 1 },
  { id: 'newer', type: 'alert', message: 'Newer message', read: false, createdAt: 2 },
];

describe('NotificationList', () => {
  it('shows an empty state when there are no notifications', () => {
    render(<NotificationList notifications={[]} onMarkAsRead={vi.fn()} />);

    expect(screen.getByText(/No notifications yet\./i)).toBeInTheDocument();
  });

  it('renders notifications newest first without mutating the input array', () => {
    const original = [...notifications];

    render(<NotificationList notifications={notifications} onMarkAsRead={vi.fn()} />);

    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Newer message');
    expect(rows[1]).toHaveTextContent('Older message');
    expect(notifications).toEqual(original);
  });

  it('only shows the mark-as-read action for unread notifications', () => {
    render(<NotificationList notifications={notifications} onMarkAsRead={vi.fn()} />);

    expect(screen.getAllByRole('button', { name: /Mark as read/i })).toHaveLength(1);
  });

  it('calls onMarkAsRead with the notification id when clicked', () => {
    const onMarkAsRead = vi.fn();
    render(<NotificationList notifications={notifications} onMarkAsRead={onMarkAsRead} />);

    fireEvent.click(screen.getByRole('button', { name: /Mark as read/i }));

    expect(onMarkAsRead).toHaveBeenCalledWith('newer');
  });
});
