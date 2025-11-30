import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // You can log error/stack to an external service here
    // console.error('ErrorBoundary caught:', error, info);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200">
          <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
          <p className="text-sm mb-4">An unexpected error occurred in this part of the UI.</p>
          <div className="flex gap-2">
            <button onClick={this.reset} className="px-3 py-1 bg-white dark:bg-gray-800 rounded shadow">Try again</button>
            <button onClick={() => window.location.reload()} className="px-3 py-1 bg-red-600 text-white rounded">Reload page</button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
