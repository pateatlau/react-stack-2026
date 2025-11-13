/**
 * Cross-Tab Sync Error Boundary
 * Catches and logs errors from the CrossTabAuthSync component
 * Prevents the entire app from crashing if sync fails
 */

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class CrossTabSyncErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[CrossTabSync] Error boundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Don't render anything on error - fail silently
      // The app will continue to work, just without cross-tab sync
      if (import.meta.env.DEV) {
        console.warn('[CrossTabSync] Cross-tab sync disabled due to error:', this.state.error);
      }
      return null;
    }

    return this.props.children;
  }
}
