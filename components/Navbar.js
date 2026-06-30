import { useState } from "react";

export default function Navbar({ username, activeTab, setActiveTab, onBack, theme, onToggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const tabs = ["overview", "repos", "languages", "activity", "compare", "ai"];

  return (
    <nav style={{
      borderBottom: "1px solid var(--border-dim)",
      background: "var(--bg-deep)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      {/* Main bar */}
      <div style={{ display: "flex", alignItems: "stretch", height: 46 }}>
        {/* Back */}
        <button
          onClick={onBack}
          style={{
            background: "transparent",
            border: "none",
            borderRight: "1px solid var(--border-dim)",
            color: "var(--blue)",
            fontFamily: "monospace",
            fontSize: 11,
            padding: "0 18px",
            letterSpacing: 1,
            flexShrink: 0,
          }}
        >
          ← BACK
        </button>

        {/* Brand */}
        <div className="nav-brand-text" style={{
          borderRight: "1px solid var(--border-dim)",
          padding: "0 18px",
          fontFamily: "monospace",
          fontSize: 11,
          color: "var(--blue-dim)",
          letterSpacing: 3,
          display: "flex",
          alignItems: "center",
          flexShrink: 0,
        }}>
          GitHub<span style={{ color: "var(--blue)" }}>Stats</span>
        </div>

        {/* Target */}
        <div className="nav-target-text" style={{
          padding: "0 18px",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          color: "var(--blue)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          minWidth: 0,
        }}>
          <span style={{ color: "var(--text-ghost)" }}>target://</span>
          {username}
        </div>

        {/* Theme toggle */}
        <button
          onClick={onToggleTheme}
          title="Toggle terminal theme"
          style={{
            background: "transparent",
            border: "none",
            borderLeft: "1px solid var(--border-dim)",
            color: "var(--blue)",
            fontFamily: "monospace",
            fontSize: 11,
            padding: "0 14px",
            marginLeft: "auto",
            flexShrink: 0,
          }}
        >
          {theme === "amber" ? "☀" : "◑"}
        </button>

        {/* Desktop tabs — hidden below 720px via CSS, see .nav-tabs-desktop */}
        <div className="nav-tabs-desktop">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              style={{
                background: activeTab === t ? "var(--border-dim)" : "transparent",
                border: "none",
                borderLeft: "1px solid var(--border-dim)",
                borderBottom: activeTab === t ? "2px solid var(--blue)" : "2px solid transparent",
                color: activeTab === t ? "var(--blue)" : "var(--text-ghost)",
                fontFamily: "monospace",
                fontSize: 10,
                padding: "0 16px",
                letterSpacing: 1.5,
                textTransform: "uppercase",
                height: "100%",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
              }}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Mobile menu button — hidden above 720px via CSS, see .nav-mobile-toggle */}
        <button
          className="nav-mobile-toggle"
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            background: "transparent",
            border: "none",
            borderLeft: "1px solid var(--border-dim)",
            color: "var(--blue)",
            fontFamily: "monospace",
            fontSize: 11,
            padding: "0 16px",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{ borderTop: "1px solid var(--border-dim)", background: "var(--bg-base)" }}>
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => { setActiveTab(t); setMenuOpen(false); }}
              style={{
                display: "block",
                width: "100%",
                background: activeTab === t ? "var(--border-dim)" : "transparent",
                border: "none",
                borderBottom: "1px solid var(--border-dim)",
                color: activeTab === t ? "var(--blue)" : "var(--text-muted)",
                fontFamily: "monospace",
                fontSize: 11,
                padding: "12px 20px",
                textAlign: "left",
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              {activeTab === t ? "> " : "  "}{t}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
