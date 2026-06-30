import { Panel, SectionHeader, Cursor } from "./UI";

const AI_SECTIONS = [
  { key: "[STRENGTHS]",        label: "STRENGTHS",        color: "var(--green)",  icon: "▲" },
  { key: "[TECH_STACK]",       label: "TECH STACK",       color: "var(--blue)",  icon: "◈" },
  { key: "[CONSISTENCY]",      label: "CONSISTENCY",      color: "var(--yellow)",  icon: "◉" },
  { key: "[OPEN_SOURCE]",      label: "OPEN SOURCE",      color: "var(--purple)",  icon: "◇" },
  { key: "[RECRUITER_SUMMARY]",label: "RECRUITER SUMMARY",color: "var(--orange)",  icon: "◎" },
  { key: "[IMPROVEMENTS]",     label: "IMPROVEMENTS",     color: "var(--red)",  icon: "◈" },
];

function parseInsights(text) {
  const parsed = {};
  AI_SECTIONS.forEach(({ key }, i) => {
    const start = text.indexOf(key);
    if (start === -1) return;
    const nextStarts = AI_SECTIONS
      .slice(i + 1)
      .map(({ key: k }) => text.indexOf(k))
      .filter((p) => p > start);
    const end = nextStarts.length ? Math.min(...nextStarts) : text.length;
    parsed[key] = text.slice(start + key.length, end).trim();
  });
  return parsed;
}

export default function AITab({ insights, loading }) {
  if (loading) {
    return (
      <Panel style={{ textAlign: "center", padding: "64px 24px" }}>
        <div style={{ fontFamily: "monospace", fontSize: 9, color: "var(--blue)", letterSpacing: 4, marginBottom: 20 }}>
          AI ENGINE RUNNING
        </div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
          gemini-2.5-flash analyzing profile
          <Cursor />
        </div>
        <div style={{ fontFamily: "monospace", fontSize: 10, color: "#1e2a3a", marginTop: 16 }}>
          this may take a few seconds...
        </div>
      </Panel>
    );
  }

  if (!insights) {
    return (
      <Panel style={{ padding: "48px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--red)" }}>
          AI analysis unavailable.
        </div>
        <div style={{ fontFamily: "monospace", fontSize: 10, color: "var(--text-ghost)", marginTop: 8 }}>
          Add GEMINI_API_KEY to .env.local to enable AI insights.
        </div>
      </Panel>
    );
  }

  const parsed = parseInsights(insights);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Panel>
        <SectionHeader title="AI INSIGHTS" cmd="gemini-2.5-flash --analyze" color="var(--purple)" />
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 12,
        }}>
          {AI_SECTIONS.map(({ key, label, color, icon }) => {
            const content = parsed[key];
            if (!content) return null;
            return (
              <div key={key} style={{
                border: `1px solid color-mix(in srgb, ${color} 22%, transparent)`,
                background: "var(--bg-deep)",
                padding: "16px 18px",
              }}>
                <div style={{
                  fontFamily: "monospace",
                  fontSize: 9,
                  color,
                  letterSpacing: 3,
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}>
                  <span>{icon}</span>
                  {label}
                </div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: "var(--text-dim)",
                  lineHeight: 1.9,
                  whiteSpace: "pre-wrap",
                }}>
                  {content}
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Raw output toggle */}
      <Panel style={{ padding: "14px 20px" }}>
        <div style={{ fontFamily: "monospace", fontSize: 9, color: "#1e2a3a", letterSpacing: 2, marginBottom: 8 }}>
          RAW AI OUTPUT
        </div>
        <pre style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          color: "var(--text-ghost)",
          lineHeight: 1.8,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          maxHeight: 200,
          overflow: "auto",
        }}>
          {insights}
        </pre>
      </Panel>
    </div>
  );
}
