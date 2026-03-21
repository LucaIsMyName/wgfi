import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    
    // Log error to external service in production
    if (import.meta.env.PROD) {
      // TODO: Add error logging service (Sentry, LogRocket, etc.)
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div 
          className="flex flex-col items-center justify-center min-h-[60vh] p-6"
          role="alert"
          aria-live="polite"
        >
          <div className="bg-card-bg p-8 rounded-lg shadow-lg max-w-2xl w-full border border-primary-green">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-8 h-8 text-accent-gold flex-shrink-0" />
              <h1 className="text-2xl font-serif font-bold text-primary-green">
                Etwas ist schief gelaufen
              </h1>
            </div>
            
            <div className="bg-[var(--soft-cream)] p-4 rounded-md mb-6 border border-accent-gold/20">
              <p className="font-serif text-deep-charcoal mb-2">
                <span className="font-semibold">Fehler:</span> {this.state.error?.name}
              </p>
              <p className="font-serif text-deep-charcoal italic">
                {this.state.error?.message}
              </p>
              
              {import.meta.env.DEV && (
                <details className="mt-4">
                  <summary className="text-sm font-serif cursor-pointer text-accent-gold hover:text-accent-gold/80 transition-colors">
                    Technische Details (Entwicklungsmodus)
                  </summary>
                  <pre className="bg-white p-3 rounded mt-2 text-xs overflow-auto border border-primary-green/20 font-mono">
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={this.handleRetry}
                variant="primary"
                size="md"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Erneut versuchen
              </Button>
              
              <Button
                onClick={this.handleGoHome}
                variant="secondary"
                size="md"
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Zur Startseite
              </Button>
              
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="md"
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Seite neu laden
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
