import type { FC } from 'react';

interface ConfigErrorScreenProps {
  message: string;
}

/**
 * Shown when app startup fails before React can render anything real -
 * currently only src/config/env.ts's validation, which throws before
 * App.tsx (and every module it imports) ever evaluates. Rendered from
 * main.tsx's catch block, since an error boundary can't catch a throw
 * that happens during module import.
 */
const ConfigErrorScreen: FC<ConfigErrorScreenProps> = ({ message }) => (
  <div className="splash-screen splash-screen--error" role="alert">
    <div className="splash-icon" aria-hidden="true">
      🔔
    </div>
    <h1>SignalFlow Notifications</h1>
    <p className="splash-error-message">{message}</p>
    <p className="splash-hint">
      Copy <code>.env.example</code> to <code>.env</code>, then restart <code>npm run dev</code>.
      The placeholder values work as-is as long as <code>VITE_USE_FIRESTORE_EMULATOR=true</code>
      and the Firestore emulator is running (<code>npm run emulators</code>).
    </p>
  </div>
);

export default ConfigErrorScreen;
