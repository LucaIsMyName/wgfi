import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './ui/Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  chartName?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ChartErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Chart error in ${this.props.chartName || 'unknown'}:`, error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div 
          className="flex flex-col items-center justify-center p-8 border border-border-color bg-light-sage rounded-lg"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-accent-gold flex-shrink-0" />
            <h3 className="text-lg font-serif text-primary-green">
              Chart konnte nicht geladen werden
            </h3>
          </div>
          
          <p className="font-serif text-deep-charcoal text-sm mb-4 text-center opacity-70">
            {this.props.chartName && `${this.props.chartName} konnte nicht angezeigt werden. `}
            Bitte versuchen Sie es erneut.
          </p>
          
          <Button
            onClick={this.handleRetry}
            variant="primary"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Erneut versuchen
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ChartErrorBoundary;
