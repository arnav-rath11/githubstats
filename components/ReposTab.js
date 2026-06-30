import { useState } from "react";
import { Panel, SectionHeader, HealthBadge, Tag } from "./UI";
import { LANG_COLORS, calcRepoHealth, timeAgo, fmt } from "../lib/utils";

const SORT_OPTIONS = [
  { value: "stars",   label: "STARS" },
  { value: "updated", label: "UPDATED" },
  { value: "name",    label: "NAME" },
  { value: "health",  label: "HEALTH" },
  { value: "forks",   label: "FORKS" },
];

export default function ReposTab({ repos }) {
  const [sort,   setSort]   = useState("stars");
  const [filter, setFilter] = useState("");
  const [showForks, setShowForks] = useState(true);

  const sorted = [...repos]
    .filter((r) => {
      if (!showForks && r.fork) return false;
      if (!filter) return true;
      const q = filter.toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        (r.description || "").toLowerCase().includes(q) ||
        (r.language || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === "stars")   return b.stargazers_count - a.stargazers_count;
      if (sort === "updated") return new Date(b.updated_at) - new Date(a.updated_at);
      if (sort === "name")    return a.name.localeCompare(b.name);
      if (sort === "health")  return calcRepoHealth(b) - calcRepoHealth(a);
      if (sort === "forks")   return b.forks_count - a.forks_count;
      return 0;
    });

  return (
    <Panel>
      <SectionHeader
        title={`REPOSITORIES (${repos.length})`}
        cmd={`gh repo list --limit ${repos.length}`}
      />

      {/* Controls */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        {/* Search */}
        <div style={{ display: "flex", flex: "1 1 200px" }}>
          <span style={{
            background: "var(--bg-raised)",
            border: "1px solid var(--border)",
            borderRight: "none",
            padding: "8px 12px",
            fontFamily: "monospace",
            fontSize: 11,
            color: "var(--blue)",
          }}>
            /
          </span>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="filter repos..."
            style={{
              flex: 1,
              background: "var(--bg-raised)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              fontFamily: "monospace",
              fontSize: 11,
              padding: "8px 12px",
            }}
          />
        </div>

        {/* Sort */}
        <div style={{ display: "flex", gap: 0 }}>
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setSort(o.value)}
              style={{
                background: sort === o.value ? "#0a1628" : "transparent",
                border: "1px solid var(--border)",
                borderLeft: o.value === "stars" ? "1px solid var(--border)" : "none",
                color: sort === o.value ? "var(--blue)" : "var(--text-ghost)",
                fontFamily: "monospace",
                fontSize: 9,
                padding: "8px 12px",
                letterSpacing: 1,
              }}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Fork toggle */}
        <button
          onClick={() => setShowForks((v) => !v)}
          style={{
            background: showForks ? "#0a1628" : "transparent",
            border: "1px solid var(--border)",
            color: showForks ? "var(--blue)" : "var(--text-ghost)",
            fontFamily: "monospace",
            fontSize: 9,
            padding: "8px 12px",
            letterSpacing: 1,
          }}
        >
          FORKS
        </button>
      </div>

      {/* Count */}
      <div style={{ fontFamily: "monospace", fontSize: 10, color: "var(--text-ghost)", marginBottom: 12, letterSpacing: 1 }}>
        {sorted.length} RESULTS
      </div>

      {/* Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
        gap: 8,
      }}>
        {sorted.map((repo) => {
          const health = calcRepoHealth(repo);
          const langColor = LANG_COLORS[repo.language] || "var(--blue)";
          return (
            <div key={repo.id} style={{
              border: "1px solid var(--border)",
              padding: "14px 16px",
              background: "var(--bg-deep)",
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}>
              {/* Title row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <a
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--blue)",
                    flex: 1,
                    wordBreak: "break-word",
                    lineHeight: 1.4,
                  }}
                >
                  {repo.name}
                </a>
                <HealthBadge score={health} />
              </div>

              {/* Description */}
              {repo.description && (
                <div style={{
                  fontFamily: "monospace",
                  fontSize: 10,
                  color: "var(--text-muted)",
                  lineHeight: 1.6,
                  flex: 1,
                }}>
                  {repo.description}
                </div>
              )}

              {/* Topics */}
              {repo.topics?.length > 0 && (
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                  {repo.topics.slice(0, 4).map((t) => (
                    <Tag key={t}>{t}</Tag>
                  ))}
                </div>
              )}

              {/* Footer */}
              <div style={{
                borderTop: "1px solid var(--border-dim)",
                paddingTop: 8,
                marginTop: 4,
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
              }}>
                {repo.language && (
                  <span style={{
                    fontFamily: "monospace",
                    fontSize: 10,
                    color: langColor,
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                  }}>
                    <span style={{
                      width: 7, height: 7,
                      borderRadius: "50%",
                      background: langColor,
                      display: "inline-block",
                    }} />
                    {repo.language}
                  </span>
                )}
                <span style={{ fontFamily: "monospace", fontSize: 10, color: "var(--yellow)" }}>
                  ★ {fmt(repo.stargazers_count)}
                </span>
                <span style={{ fontFamily: "monospace", fontSize: 10, color: "var(--text-muted)" }}>
                  ⑂ {fmt(repo.forks_count)}
                </span>
                {repo.license && (
                  <span style={{ fontFamily: "monospace", fontSize: 9, color: "var(--text-ghost)" }}>
                    {repo.license.spdx_id}
                  </span>
                )}
                {repo.fork && <Tag color="var(--text-ghost)">FORK</Tag>}
                <span style={{ fontFamily: "monospace", fontSize: 9, color: "var(--border)", marginLeft: "auto" }}>
                  {timeAgo(repo.updated_at)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "48px 24px",
          fontFamily: "monospace",
          fontSize: 12,
          color: "var(--text-ghost)",
        }}>
          no repositories match filter
        </div>
      )}
    </Panel>
  );
}
