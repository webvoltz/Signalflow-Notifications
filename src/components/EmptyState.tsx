import type { FC } from 'react';

interface EmptyStateProps {
  onCreateRequested: () => void;
}

/**
 * Shown when there are no notifications at all yet (as opposed to the
 * list simply being filtered down to nothing - see NotificationList).
 */
const EmptyState: FC<EmptyStateProps> = ({ onCreateRequested }) => (
  <div className="empty-state">
    <span className="empty-state-icon" aria-hidden="true">
      🔔
    </span>
    <h2>No notifications yet</h2>
    <p>Your realtime notifications will appear here.</p>
    <button type="button" className="empty-state-action" onClick={onCreateRequested}>
      Create your first notification
    </button>
  </div>
);

export default EmptyState;
