import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    // Error caught by boundary
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ivory flex items-center justify-center p-6 text-center">
          <div className="max-w-md">
            <h1 className="font-heading text-4xl text-stone-800 mb-4">A Technical Moment</h1>
            <p className="font-body text-stone-500 text-sm mb-8 italic">
              Our digital atelier is experiencing a brief pause. Please refresh the page or return to our home collection.
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="btn-luxury"
            >
              Return to Atelier
            </button>
          </div>
        </div>
      );
    }

    // @ts-expect-error - TS5.8 class field handling
    return this.props.children;
  }
}