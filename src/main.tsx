import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

const rootElement = document.getElementById('root');

if (rootElement === null) {
  throw new Error('Root element not found.');
}

const root = ReactDOM.createRoot(rootElement);

/**
 * App.tsx's import chain reaches src/config/env.ts, which validates
 * VITE_* config at module-evaluation time and throws if it's missing
 * or malformed - before React ever mounts, so no error boundary can
 * catch it. Importing it dynamically, inside a try/catch, lets a bad
 * config render a helpful screen instead of leaving the page blank.
 */
async function bootstrap(): Promise<void> {
  try {
    const { default: App } = await import('./App');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    );
  } catch (error) {
    const { default: ConfigErrorScreen } = await import('./components/ConfigErrorScreen');
    root.render(
      <React.StrictMode>
        <ConfigErrorScreen
          message={error instanceof Error ? error.message : 'Unknown configuration error.'}
        />
      </React.StrictMode>,
    );
  }
}

void bootstrap();
