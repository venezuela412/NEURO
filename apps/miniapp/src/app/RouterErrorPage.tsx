import { isRouteErrorResponse, Link, useRouteError } from "react-router-dom";

export function RouterErrorPage() {
  const error = useRouteError();

  let message = "Something went wrong.";
  if (isRouteErrorResponse(error)) {
    message = error.statusText || String(error.data);
  } else if (error instanceof Error) {
    message = error.message;
  }

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
      <h1 style={{ fontSize: "1.15rem", marginBottom: 12 }}>Could not load this screen</h1>
      <p style={{ opacity: 0.85, lineHeight: 1.5, marginBottom: 16 }}>
        Try going back to Home, or refresh the page. If you use wallet sync, disconnect and reconnect after updating the app.
      </p>
      <pre
        style={{
          padding: 12,
          borderRadius: 12,
          background: "rgba(255,255,255,0.06)",
          fontSize: 12,
          overflow: "auto",
          whiteSpace: "pre-wrap",
        }}
      >
        {message}
      </pre>
      <Link to="/" style={{ display: "inline-block", marginTop: 20, color: "#8f73ff", fontWeight: 600 }}>
        Back to home
      </Link>
    </div>
  );
}
