import type { FC } from 'react';

interface ConnectionErrorPanelProps {
  message: string;
  onRetry: () => void;
}

/**
 * Shown in place of the notification list when the realtime
 * subscription itself has failed (as opposed to a single write) -
 * see useNotifications' connectionStatus.
 */
const ConnectionErrorPanel: FC<ConnectionErrorPanelProps> = ({ message, onRetry }) => (
  <div className="connection-error-panel" role="alert">
    <span className="connection-error-icon" aria-hidden="true">
      ⚠️
    </span>
    <h2>We couldn&apos;t load realtime notifications.</h2>
    <p>{message}</p>
    <button type="button" className="connection-error-retry" onClick={onRetry}>
      Retry connection
    </button>
  </div>
);

export default ConnectionErrorPanel;
