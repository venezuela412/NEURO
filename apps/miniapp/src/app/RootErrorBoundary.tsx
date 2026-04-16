import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class RootErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[NEURO]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: "100dvh",
            padding: 24,
            maxWidth: 520,
            margin: "0 auto",
            fontFamily: "system-ui, sans-serif",
            background: "#090b13",
            color: "#f6f8ff",
          }}
        >
          <h1 style={{ fontSize: "1.25rem", marginBottom: 12 }}>Something went wrong</h1>
          <p style={{ opacity: 0.85, lineHeight: 1.5 }}>
            The app hit a runtime error. Open the browser developer console (F12 → Console) for details, or try
            refreshing. If you just deployed, check that the build finished and you are opening the correct HTTPS URL.
          </p>
          <pre
            style={{
              marginTop: 16,
              padding: 12,
              borderRadius: 12,
              background: "rgba(255,255,255,0.06)",
              overflow: "auto",
              fontSize: 12,
              whiteSpace: "pre-wrap",
            }}
          >
            {this.state.error.message}
          </pre>
          <button
            type="button"
            style={{
              marginTop: 20,
              padding: "12px 20px",
              borderRadius: 12,
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
              background: "#8f73ff",
              color: "#0a0c12",
            }}
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
