import type { PropsWithChildren, ReactNode } from 'react';

export type ErrorBoundaryProps = PropsWithChildren<{
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}>;

export type ErrorBoundaryState = {
  hasError: boolean;
};
