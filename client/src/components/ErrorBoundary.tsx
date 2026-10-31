import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="surface max-w-lg w-full rounded-3xl p-8 border border-slate-200/80 dark:border-white/10 shadow-xl bg-white dark:bg-[#101614]">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-sm">
              <AlertCircle size={32} />
            </div>

            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {this.props.fallbackTitle || 'Something went wrong'}
            </h2>

            <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              The application encountered an unexpected display issue while rendering this section.
            </p>

            {this.state.error?.message && (
              <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-left font-mono text-xs text-rose-600 dark:text-rose-400 max-h-32 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-[#123b36] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#0b2d29] dark:bg-teal-400 dark:text-[#08241f] dark:hover:bg-teal-300 transition"
              >
                <RotateCcw size={14} />
                <span>Reload Page</span>
              </button>

              <Link
                to="/"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10 transition"
              >
                <Home size={14} />
                <span>Go Home</span>
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
