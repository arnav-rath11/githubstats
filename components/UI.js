import { useState, useEffect } from "react";

// ─── CURSOR ───────────────────────────────────────────────────────────────────
export function Cursor({ color = "var(--blue)" }) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const t = setInterval(() => setOn((v) => !v), 530);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{
      display: "inline-block", width: 8, height: 14,
      background: color, opacity: on ? 1 : 0,
      verticalAlign: "middle", marginLeft: 3,
      transition: "opacity 0.05s",
    }} />
  );
}

// ─── PANEL ────────────────────────────────────────────────────────────────────
export function Panel({ children, style = {}, className = "" }) {
  return (
    <div
      className={`fade-in ${className}`}
      style={{
        background: "var(--bg-base)",
        border: "1px solid var(--border)",
        padding: "20px 24px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
export function SectionHeader({ title, cmd, color = "var(--blue)" }) {
  return (
    <div style={{
      borderBottom: "1px solid var(--border-dim)",
      paddingBottom: 10,
      marginBottom: 18,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <span style={{
        fontFamily: "monospace",
        fontSize: 10,
        color,
        letterSpacing: 3,
        textTransform: "uppercase",
        fontWeight: 700,
      }}>
        {title}
      </span>
      {cmd && (
        <span style={{
          fontFamily: "monospace",
          fontSize: 9,
          color: "#1e2a3a",
          letterSpacing: 1,
        }}>
          {cmd}
        </span>
      )}
    </div>
  );
}

// ─── STAT BOX ─────────────────────────────────────────────────────────────────
export function StatBox({ label, value, color = "var(--blue)", sub }) {
  return (
    <div style={{
      border: "1px solid var(--border)",
      padding: "14px 18px",
      background: "var(--bg-deep)",
      flex: "1 1 130px",
      minWidth: 110,
    }}>
      <div style={{
        fontFamily: "monospace",
        fontSize: 9,
        color: "var(--text-muted)",
        letterSpacing: 2,
        marginBottom: 8,
        textTransform: "uppercase",
      }}>
        {label}
      </div>
      <div style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 24,
        color,
        fontWeight: 800,
        lineHeight: 1,
      }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontFamily: "monospace", fontSize: 9, color: "var(--text-ghost)", marginTop: 6 }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── CIRCULAR SCORE ───────────────────────────────────────────────────────────
export function CircularScore({ score, size = 130 }) {
  const r = size * 0.4;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color =
    score >= 80 ? "var(--green)" :
    score >= 60 ? "var(--blue)" :
    score >= 40 ? "var(--yellow)" : "var(--red)";
  const cx = size / 2;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="var(--border-dim)" strokeWidth={7} />
          <circle
            cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={7}
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: size * 0.22,
            fontWeight: 900,
            color,
            lineHeight: 1,
          }}>
            {score}
          </div>
          <div style={{
            fontFamily: "monospace",
            fontSize: 8,
            color: "var(--text-ghost)",
            letterSpacing: 2,
            marginTop: 4,
          }}>
            /100
          </div>
        </div>
      </div>
      <div style={{ fontFamily: "monospace", fontSize: 9, color: "var(--text-ghost)", letterSpacing: 2, marginTop: 6 }}>
        DEV SCORE
      </div>
    </div>
  );
}

// ─── HEALTH BADGE ─────────────────────────────────────────────────────────────
export function HealthBadge({ score }) {
  const color =
    score >= 80 ? "var(--green)" :
    score >= 60 ? "var(--blue)" :
    score >= 40 ? "var(--yellow)" : "var(--red)";
  const label =
    score >= 80 ? "EXCELLENT" :
    score >= 60 ? "GOOD"      :
    score >= 40 ? "AVERAGE"   : "NEEDS WORK";
  return (
    <span style={{
      fontFamily: "monospace",
      fontSize: 9,
      color,
      border: `1px solid color-mix(in srgb, ${color} 55%, transparent)`,
      padding: "2px 7px",
      letterSpacing: 1,
      whiteSpace: "nowrap",
    }}>
      {label}
    </span>
  );
}

// ─── PROGRESS BAR ─────────────────────────────────────────────────────────────
export function ProgressBar({ value, color = "var(--blue)", height = 3 }) {
  return (
    <div style={{ background: "var(--bg-raised)", height }}>
      <div style={{
        height: "100%",
        background: color,
        width: `${Math.min(value, 100)}%`,
        transition: "width 0.8s cubic-bezier(.4,0,.2,1)",
      }} />
    </div>
  );
}

// ─── TAG ─────────────────────────────────────────────────────────────────────
export function Tag({ children, color = "var(--text-ghost)" }) {
  return (
    <span style={{
      fontFamily: "monospace",
      fontSize: 9,
      color,
      border: `1px solid color-mix(in srgb, ${color} 70%, transparent)`,
      padding: "2px 7px",
      letterSpacing: 1,
      display: "inline-block",
    }}>
      {children}
    </span>
  );
}

// ─── SKELETON ─────────────────────────────────────────────────────────────────
export function Skeleton({ width = "100%", height = 16, style = {} }) {
  return (
    <div style={{
      width, height,
      background: "linear-gradient(90deg, var(--bg-raised) 25%, var(--border-dim) 50%, var(--bg-raised) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.5s infinite",
      ...style,
    }} />
  );
}
