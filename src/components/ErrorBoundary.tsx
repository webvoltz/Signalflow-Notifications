import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import './splash.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches unexpected render errors anywhere below it and shows a
 * recoverable fallback instead of a blank page or a raw stack trace.
 * Reuses splash.css's card styling for visual consistency with
 * LoadingScreen/ConfigErrorScreen, which cover the other two ways this
 * app can fail to render its real UI.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('SignalFlow Notifications crashed:', error, errorInfo.componentStack);
  }

  private readonly handleRetry = (): void => {
    this.setState({ hasError: false });
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="splash-screen splash-screen--error">
          <div className="splash-card">
            <div className="splash-badge" aria-hidden="true">
              <span className="splash-badge-ring" />
              <span className="splash-icon">⚠️</span>
            </div>
            <span className="splash-badge-label">Unexpected error</span>
            <h1 className="splash-title">Something went wrong</h1>
            <p className="splash-error-message">
              We couldn&apos;t display this notification center.
            </p>
            <button type="button" className="splash-button" onClick={this.handleRetry}>
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
