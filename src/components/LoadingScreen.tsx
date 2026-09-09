import type { FC } from 'react';
import './splash.css';

/**
 * Full-screen splash shown while the initial Firestore subscription is
 * still connecting, so the first paint always identifies the app
 * instead of a blank white page. Imports its own CSS so the styling
 * never depends on App.tsx having loaded successfully.
 */
const LoadingScreen: FC = () => (
  <div className="splash-screen" role="status">
    <div className="splash-card">
      <div className="splash-badge" aria-hidden="true">
        <span className="splash-badge-ring" />
        <span className="splash-icon">🔔</span>
      </div>
      <span className="splash-status-label">Connecting</span>
      <h1 className="splash-title">SignalFlow Notifications</h1>
      <p className="splash-message">
        Connecting to Firestore
        <span className="splash-dots" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </p>
    </div>
  </div>
);

export default LoadingScreen;
