"use client"; // replaces the root layout, so it brings its own html/body and inline styles

export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#14122b", color: "#fff", fontFamily: "system-ui, sans-serif" }}>
        <title>Something went wrong · LOGICA @ UIC</title>
        <main style={{ maxWidth: 420, padding: 24 }} role="alert">
          <h1 style={{ fontSize: 32, margin: 0 }}>Something went wrong.</h1>
          <p>Try again, or head back home.</p>
          <button type="button" onClick={() => retry()} style={{ minHeight: 48, padding: "0 24px", borderRadius: 999, border: 0, background: "#b63814", color: "#fff", fontSize: 18, fontWeight: 600, cursor: "pointer" }}>
            Try again
          </button>{" "}
          {/* plain <a>: a full reload recovers even if the app shell is what broke */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" style={{ color: "#FECC15", marginLeft: 12 }}>Back to LOGICA</a>
        </main>
      </body>
    </html>
  );
}
