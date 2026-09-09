import type { FC } from 'react';
import './splash.css';

interface ConfigErrorScreenProps {
  message: string;
}

/**
 * Shown when app startup fails before React can render anything real -
 * currently only src/config/env.ts's validation, which throws before
 * App.tsx (and every module it imports) ever evaluates. Rendered from
 * main.tsx's catch block, since an error boundary can't catch a throw
 * that happens during module import. Imports its own CSS so the
 * styling never depends on App.tsx having loaded successfully.
 */
const ConfigErrorScreen: FC<ConfigErrorScreenProps> = ({ message }) => (
  <div className="splash-screen splash-screen--error" role="alert">
    <div className="splash-card">
      <div className="splash-badge" aria-hidden="true">
        <span className="splash-badge-ring" />
        <span className="splash-icon">🔔</span>
      </div>
      <span className="splash-badge-label">Configuration error</span>
      <h1 className="splash-title">SignalFlow Notifications</h1>
      <p className="splash-error-message">{message}</p>
      <ol className="splash-steps">
        <li>
          <span className="splash-step-number" aria-hidden="true">
            1
          </span>
          <span>
            Copy <code>.env.example</code> to <code>.env</code>
          </span>
        </li>
        <li>
          <span className="splash-step-number" aria-hidden="true">
            2
          </span>
          <span>
            Keep <code>VITE_USE_FIRESTORE_EMULATOR=true</code> and start the emulator with{' '}
            <code>npm run emulators</code>
          </span>
        </li>
        <li>
          <span className="splash-step-number" aria-hidden="true">
            3
          </span>
          <span>Restart the dev server</span>
        </li>
      </ol>
      <pre className="splash-code">cp .env.example .env && npm run dev</pre>
    </div>
  </div>
);

export default ConfigErrorScreen;
