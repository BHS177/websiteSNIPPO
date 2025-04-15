import React, { Component, ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface ErrorFallbackProps {
  children: ReactNode;
}

interface ErrorFallbackState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorFallback extends Component<ErrorFallbackProps, ErrorFallbackState> {
  constructor(props: ErrorFallbackProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorFallbackState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error to an error reporting service
    console.error("Component error caught:", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-lg flex flex-col items-center justify-center min-h-[300px]">
          <h3 className="text-xl font-semibold text-red-300 mb-2">Something went wrong</h3>
          <p className="text-red-200/80 mb-4 text-center max-w-md">
            There was an error rendering this component. You can try refreshing the page.
          </p>
          <div className="text-xs text-red-300/60 mb-4 p-2 bg-red-500/20 rounded-lg max-w-md overflow-auto">
            {this.state.error?.message}
          </div>
          <Button
            variant="destructive"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
} 