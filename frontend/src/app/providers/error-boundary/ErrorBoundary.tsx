import { Component } from 'react';

import { logger } from '@shared/lib/logger';

import type { ErrorBoundaryProps, ErrorBoundaryState } from './ErrorBoundary.types';
import { ErrorFallback } from './ErrorFallback';

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    logger.error('Application render failed', { code: error.name });
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback !== undefined ? this.props.fallback : <ErrorFallback />;
    }

    return this.props.children;
  }
}
