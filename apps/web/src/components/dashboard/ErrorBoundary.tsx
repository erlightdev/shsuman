import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[Dashboard ErrorBoundary caught error]:", error, errorInfo);
  }

  resetError = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto my-8 max-w-xl rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center shadow-sm">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <AlertTriangle className="size-6" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            {this.props.fallbackTitle || "Something went wrong loading this editor"}
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {this.state.error?.message || this.props.fallbackMessage || "An unexpected error occurred while rendering this section."}
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={this.resetError}
              className="rounded-full gap-1.5"
            >
              <RotateCcw className="size-3.5" />
              Try again
            </Button>
            <Button asChild size="sm" variant="ghost" className="rounded-full">
              <a href="/dashboard/content">Back to Homepage Sections</a>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
