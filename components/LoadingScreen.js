import { Panel, Cursor } from "./UI";

const STEPS = [
  "Resolving target username",
  "Fetching GitHub profile",
  "Loading repositories",
  "Processing analytics",
  "Running AI analysis",
  "Rendering dashboard",
];

export default function LoadingScreen({ username, step }) {
  const pct = Math.round((step / (STEPS.length - 1)) * 100);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-deep)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}>
      <div className="scanlines" />
      <Panel style={{ width: "100%", maxWidth: 560, padding: "36px 40px" }}>
        {/* Header */}
        <div style={{
          fontFamily: "monospace",
          fontSize: 9,
          color: "var(--blue)",
          letterSpacing: 4,
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <span>ANALYZING TARGET</span>
          <span style={{ color: "var(--blue-dim)" }}>—</span>
          <span style={{ color: "var(--text)" }}>{username}</span>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {STEPS.map((s, i) => {
            const done    = i < step;
            const current = i === step;
            const pending = i > step;
            return (
              <div key={i} style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                lineHeight: 2.2,
                color: done ? "var(--green)" : current ? "var(--blue)" : "#1e2a3a",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}>
                <span style={{
                  width: 18,
                  fontSize: 13,
                  color: done ? "var(--green)" : current ? "var(--blue)" : "#1e2a3a",
                }}>
                  {done ? "✓" : current ? "›" : "·"}
                </span>
                <span>{s}</span>
                {current && <Cursor />}
                {done && (
                  <span style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: 10, color: "var(--blue-dim)" }}>
                    OK
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontFamily: "monospace", fontSize: 9, color: "var(--text-ghost)", letterSpacing: 2 }}>
              PROGRESS
            </span>
            <span style={{ fontFamily: "monospace", fontSize: 9, color: "var(--text-ghost)" }}>
              {pct}%
            </span>
          </div>
          <div style={{ background: "var(--bg-raised)", height: 2 }}>
            <div style={{
              height: "100%",
              background: "linear-gradient(90deg, var(--blue), var(--green))",
              width: `${pct}%`,
              transition: "width 0.5s ease",
            }} />
          </div>
        </div>
      </Panel>
    </div>
  );
}
