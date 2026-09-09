import type { FC } from 'react';
import type { ConnectionStatus } from '../hooks/useNotifications';

interface AppHeaderProps {
  connectionStatus: ConnectionStatus;
  unreadCount: number;
}

const STATUS_META: Record<ConnectionStatus, { label: string; className: string }> = {
  connected: { label: 'Realtime connected', className: 'is-connected' },
  reconnecting: { label: 'Connecting…', className: 'is-connecting' },
  error: { label: 'Connection error', className: 'is-error' },
};

const AppHeader: FC<AppHeaderProps> = ({ connectionStatus, unreadCount }) => {
  const status = STATUS_META[connectionStatus];

  return (
    <header className="app-header">
      <div className="app-header-brand">
        <span className="app-header-icon" aria-hidden="true">
          🔔
        </span>
        <div>
          <h1 className="app-header-title">SignalFlow Notifications</h1>
          <p className="app-header-subtitle">Realtime notification center</p>
        </div>
      </div>
      <div className="app-header-status">
        <span className={`connection-pill ${status.className}`}>
          <span className="connection-pill-dot" aria-hidden="true" />
          {status.label}
        </span>
        {unreadCount > 0 && (
          <span className="unread-badge" key={`unread-badge-${unreadCount.toString()}`}>
            {unreadCount} unread
          </span>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
