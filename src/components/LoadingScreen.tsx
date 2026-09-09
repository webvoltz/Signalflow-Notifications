import type { FC } from 'react';

/**
 * Full-screen splash shown while the initial Firestore subscription
 * is still connecting, so the first paint always identifies the app
 * instead of a blank white page.
 */
const LoadingScreen: FC = () => (
  <div className="splash-screen" role="status">
    <div className="splash-icon" aria-hidden="true">
      🔔
    </div>
    <h1>SignalFlow Notifications</h1>
    <div className="spinner" aria-hidden="true" />
    <p>Connecting to Firestore…</p>
  </div>
);

export default LoadingScreen;
