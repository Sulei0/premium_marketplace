import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
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

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.hash = "#/";
    window.location.reload();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
            background: "#0a0a0a",
            color: "#fafafa",
            fontFamily: "'Inter', system-ui, sans-serif",
            textAlign: "center",
          }}
        >
          {/* Brand */}
          <div style={{ marginBottom: "2rem" }}>
            <span
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                letterSpacing: "-0.05em",
              }}
            >
              GIYEN
              <span style={{ color: "#ec4899" }}>DEN</span>
            </span>
          </div>

          {/* Error Icon */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "rgba(236, 72, 153, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.5rem",
              border: "1px solid rgba(236, 72, 153, 0.2)",
            }}
          >
            <span style={{ fontSize: "2rem" }}>⚠️</span>
          </div>

          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
            }}
          >
            Bir Hata Oluştu
          </h1>

          <p
            style={{
              color: "#a1a1aa",
              marginBottom: "2rem",
              maxWidth: "400px",
              lineHeight: 1.6,
              fontSize: "0.875rem",
            }}
          >
            Beklenmeyen bir sorun yaşandı. Lütfen sayfayı yenileyin veya
            ana sayfaya dönün.
          </p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={this.handleReload}
              style={{
                padding: "0.75rem 2rem",
                background: "linear-gradient(135deg, #ec4899, #a855f7)",
                color: "white",
                border: "none",
                borderRadius: "999px",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Sayfayı Yenile
            </button>
            <button
              onClick={this.handleGoHome}
              style={{
                padding: "0.75rem 2rem",
                background: "transparent",
                color: "#fafafa",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "999px",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Ana Sayfaya Dön
            </button>
          </div>

          {/* Error details for devs */}
          {process.env.NODE_ENV === "development" && (
            <pre
              style={{
                marginTop: "2rem",
                padding: "1rem",
                background: "#1a1a1a",
                borderRadius: "8px",
                overflow: "auto",
                maxWidth: "100%",
                fontSize: "0.75rem",
                color: "#ef4444",
                textAlign: "left",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {this.state.error.message}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
