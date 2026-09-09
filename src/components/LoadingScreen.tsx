import { useEffect, useState } from 'react';
import type { FC } from 'react';
import './splash.css';

const HINT_DELAY_MS = 6000;

/**
 * Full-screen splash shown while the initial Firestore subscription is
 * still connecting, so the first paint always identifies the app
 * instead of a blank white page. Imports its own CSS so the styling
 * never depends on App.tsx having loaded successfully.
 *
 * This stays mounted until the subscription's first server-confirmed
 * snapshot arrives (see useNotifications.ts) - which never happens if
 * the Firestore emulator isn't running - so a delayed hint appears
 * pointing at the most likely cause instead of spinning forever with
 * no explanation.
 */
const LoadingScreen: FC = () => {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setShowHint(true);
    }, HINT_DELAY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  return (
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
        {showHint && (
          <p className="splash-hint">
            Taking a while? Make sure the Firestore emulator is running (
            <code>npm run emulators</code>) and that <code>VITE_USE_FIRESTORE_EMULATOR</code> in
            your <code>.env</code> matches.
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
