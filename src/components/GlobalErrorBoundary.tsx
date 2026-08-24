import { Component, ErrorInfo, ReactNode } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

function ErrorFallback() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-6 text-center">
      <div className="max-w-md">
        <h1 className="font-heading text-4xl text-stone-800 mb-4">{t('errors.tech_title')}</h1>
        <p className="font-body text-stone-500 text-sm mb-8 italic">
          {t('errors.tech_body')}
        </p>
        <button onClick={() => window.location.href = '/'} className="btn-luxury">
          {t('errors.return_atelier')}
        </button>
      </div>
    </div>
  );
}

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
      return <ErrorFallback />;
    }

    return this.props.children;
  }
}