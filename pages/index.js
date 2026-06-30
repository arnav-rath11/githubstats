import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import Navbar from "../components/Navbar";
import LoadingScreen from "../components/LoadingScreen";
import ReposTab from "../components/ReposTab";
import LanguagesTab from "../components/LanguagesTab";
import CompareTab from "../components/CompareTab";
import AITab from "../components/AITab";
import ActivityTab from "../components/ActivityTab";
import {
  Panel, SectionHeader, StatBox, CircularScore, HealthBadge, Tag, Cursor,
} from "../components/UI";
import {
  githubREST, fetchAllRepos, calcDevScore, calcRepoHealth,
  getLangData, fmt, timeAgo, sleep, LANG_COLORS,
  fetchUserEvents, calcActivityStats, downloadShareCard, downloadReport,
} from "../lib/utils";
import { useTheme } from "../lib/theme";

// ─── SEARCH PAGE ─────────────────────────────────────────────────────────────
function SearchPage({ onSearch, history }) {
  const [input, setInput] = useState("");
  const inputRef = useRef();

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 400);
  }, []);

  const EXAMPLES = ["torvalds", "yyx990803", "gaearon", "sindresorhus", "antfu", "tj", "addyosmani"];

  const handleSearch = () => {
    const u = input.trim();
    if (u) onSearch(u);
  };

  return (
    <>
      <Head>
        <title>GitHubStats — Terminal Analytics</title>
      </Head>

      <div style={{
        minHeight: "100vh",
        background: "var(--bg-deep)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}>
        <div className="scanlines" />

        <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 680 }}>
          {/* Wordmark */}
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: "var(--blue)",
              letterSpacing: 8,
              marginBottom: 10,
              textTransform: "uppercase",
            }}>
              Terminal Analytics
            </div>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 46,
              fontWeight: 900,
              color: "#e8f0ff",
              letterSpacing: -2,
              lineHeight: 1,
            }}>
              GitHub<span style={{ color: "var(--blue)" }}>Stats</span>
            </div>
            <div style={{
              fontFamily: "monospace",
              fontSize: 11,
              color: "var(--text-ghost)",
              marginTop: 10,
              letterSpacing: 3,
            }}>
              DEVELOPER ANALYTICS ENGINE v2.0
            </div>
          </div>

          {/* Boot log */}
          <Panel style={{ marginBottom: 16, padding: "16px 20px" }}>
            <div style={{ fontFamily: "monospace", fontSize: 9, color: "var(--blue-dim)", letterSpacing: 2, marginBottom: 10 }}>
              SYSTEM INIT
            </div>
            {[
              { text: "GitHubStats OS v2.0.0 — Terminal Analytics Engine", color: "var(--blue)" },
              { text: "Loading modules: [github-api] [ai-engine] [chart-renderer]", color: "var(--text-muted)" },
              { text: "Checking rate limits...", color: "var(--text-muted)" },
              { text: "All systems operational.", color: "var(--green)" },
              { text: "", color: "transparent" },
              { text: "Enter a GitHub username to begin analysis.", color: "var(--text)" },
            ].map((line, i) => (
              <div key={i} style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                color: line.color,
                lineHeight: 1.9,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                {line.text && <span style={{ color: "var(--blue-dim)" }}>›</span>}
                {line.text}
                {i === 5 && <Cursor />}
              </div>
            ))}
          </Panel>

          {/* Search */}
          <Panel style={{ marginBottom: 12 }}>
            <div style={{ fontFamily: "monospace", fontSize: 9, color: "var(--text-ghost)", letterSpacing: 2, marginBottom: 12 }}>
              ANALYZE TARGET
            </div>
            <div style={{ display: "flex", gap: 0 }}>
              <div style={{
                background: "var(--bg-raised)",
                border: "1px solid var(--border)",
                borderRight: "none",
                padding: "13px 16px",
                fontFamily: "monospace",
                color: "var(--blue)",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                userSelect: "none",
              }}>
                $
              </div>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="github-username"
                style={{
                  flex: 1,
                  background: "var(--bg-raised)",
                  border: "1px solid var(--border)",
                  borderRight: "none",
                  color: "#e8f0ff",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 14,
                  padding: "13px 16px",
                }}
              />
              <button
                onClick={handleSearch}
                style={{
                  background: "var(--blue)",
                  border: "none",
                  color: "var(--bg-deep)",
                  fontFamily: "monospace",
                  fontSize: 12,
                  fontWeight: 700,
                  padding: "13px 22px",
                  letterSpacing: 1.5,
                  whiteSpace: "nowrap",
                }}
              >
                ANALYZE →
              </button>
            </div>
          </Panel>

          {/* Examples */}
          <Panel style={{ marginBottom: 12, padding: "14px 20px" }}>
            <div style={{ fontFamily: "monospace", fontSize: 9, color: "var(--text-ghost)", letterSpacing: 2, marginBottom: 10 }}>
              EXAMPLE TARGETS
            </div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {EXAMPLES.map((u) => (
                <button key={u} onClick={() => onSearch(u)} style={{
                  background: "transparent",
                  border: "1px solid var(--border)",
                  color: "var(--blue)",
                  fontFamily: "monospace",
                  fontSize: 11,
                  padding: "5px 12px",
                  letterSpacing: 1,
                  transition: "border-color 0.15s",
                }}>
                  {u}
                </button>
              ))}
            </div>
          </Panel>

          {/* History */}
          {history.length > 0 && (
            <Panel style={{ padding: "14px 20px" }}>
              <div style={{ fontFamily: "monospace", fontSize: 9, color: "var(--text-ghost)", letterSpacing: 2, marginBottom: 10 }}>
                RECENT TARGETS
              </div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {history.map((u) => (
                  <button key={u} onClick={() => onSearch(u)} style={{
                    background: "transparent",
                    border: "1px solid var(--border-dim)",
                    color: "var(--text-muted)",
                    fontFamily: "monospace",
                    fontSize: 11,
                    padding: "5px 12px",
                  }}>
                    {u}
                  </button>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ username, onBack, theme, onToggleTheme, initialCompare, onCompareChange }) {
  const [loadStep, setLoadStep] = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [data,     setData]     = useState(null);
  const [aiText,   setAiText]   = useState(null);
  const [aiLoading,setAiLoading]= useState(false);
  const [activeTab,setActiveTab]= useState("overview");
  const [activity, setActivity] = useState(null);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoadStep(0);
        await sleep(200);
        if (cancelled) return;

        setLoadStep(1);
        const user = await githubREST(`/users/${username}`);
        if (cancelled) return;

        setLoadStep(2);
        const repos = await fetchAllRepos(username);
        if (cancelled) return;

        setLoadStep(3);
        await sleep(300);
        if (cancelled) return;

        setLoadStep(4);
        const devScore   = calcDevScore(user, repos);
        const langData   = getLangData(repos);
        const totalStars = repos.reduce((a, r) => a + r.stargazers_count, 0);
        const totalForks = repos.reduce((a, r) => a + r.forks_count, 0);
        const byStars    = [...repos].sort((a, b) => b.stargazers_count - a.stargazers_count);
        if (cancelled) return;

        setData({ user, repos, devScore, langData, totalStars, totalForks, byStars });
        setLoadStep(5);
        await sleep(200);
        if (cancelled) return;
        setLoading(false);

        // Background AI fetch
        setAiLoading(true);
        try {
          const r = await fetch("/api/ai-insights", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userData: user, repos: byStars, langData }),
          });
          const d = await r.json();
          if (!cancelled) setAiText(d.insights || d.error || "Analysis unavailable.");
        } catch {
          if (!cancelled) setAiText("AI analysis unavailable.");
        }
        if (!cancelled) setAiLoading(false);

        // Background activity fetch (separate so it never blocks the main dashboard)
        try {
          const events = await fetchUserEvents(username);
          if (!cancelled) setActivity(calcActivityStats(events));
        } catch {
          if (!cancelled) setActivity(null);
        }
        if (!cancelled) setActivityLoading(false);
      } catch (e) {
        if (!cancelled) { setError(e.message); setLoading(false); }
      }
    })();

    return () => { cancelled = true; };
  }, [username]);

  if (loading) return <LoadingScreen username={username} step={loadStep} />;

  if (error) return (
    <>
      <Head><title>Error — GitHubStats</title></Head>
      <div style={{ minHeight: "100vh", background: "var(--bg-deep)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Panel style={{ maxWidth: 500, width: "100%", padding: "36px 40px", textAlign: "center" }}>
          <div style={{ fontFamily: "monospace", fontSize: 9, color: "var(--red)", letterSpacing: 4, marginBottom: 16 }}>
            ERROR
          </div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: "var(--text)", lineHeight: 1.7, marginBottom: 24 }}>
            {error}
          </div>
          <button onClick={onBack} style={{
            background: "var(--blue)", border: "none", color: "var(--bg-deep)",
            fontFamily: "monospace", fontSize: 11, fontWeight: 700,
            padding: "10px 22px", letterSpacing: 1,
          }}>
            ← BACK TO SEARCH
          </button>
        </Panel>
      </div>
    </>
  );

  const { user, repos, devScore, langData, totalStars, totalForks, byStars } = data;
  const joinYear = new Date(user.created_at).getFullYear();

  return (
    <>
      <Head>
        <title>{user.name || username} — GitHubStats</title>
      </Head>

      <div className="scanlines" />

      <Navbar
        username={username}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBack={onBack}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "20px 16px 48px", display: "flex", flexDirection: "column", gap: 14 }}>

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <>
            {/* Profile */}
            <Panel>
              <SectionHeader title="PROFILE" cmd={`gh user get ${username}`} />
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
                <button
                  onClick={() => downloadShareCard({ user, devScore, totalStars, totalForks, langData })}
                  style={{
                    background: "transparent", border: "1px solid var(--border)", color: "var(--blue)",
                    fontFamily: "monospace", fontSize: 10, padding: "7px 14px", letterSpacing: 1,
                  }}
                >
                  ⤓ SHARE CARD (PNG)
                </button>
                <button
                  onClick={() => downloadReport({ user, repos, devScore, langData, totalStars, totalForks })}
                  style={{
                    background: "transparent", border: "1px solid var(--border)", color: "var(--green)",
                    fontFamily: "monospace", fontSize: 10, padding: "7px 14px", letterSpacing: 1,
                  }}
                >
                  ⤓ EXPORT REPORT (JSON)
                </button>
              </div>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
                <img
                  src={user.avatar_url}
                  alt={username}
                  style={{ width: 80, height: 80, border: "2px solid var(--border)", display: "block", flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 800, color: "#e8f0ff", lineHeight: 1.2 }}>
                    {user.name || username}
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--blue)", marginTop: 3, marginBottom: 10 }}>
                    @{username}
                  </div>
                  {user.bio && (
                    <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-dim)", lineHeight: 1.7, maxWidth: 520 }}>
                      {user.bio}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 12 }}>
                    {user.company  && <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)" }}>{user.company}</span>}
                    {user.location && <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)" }}>📍 {user.location}</span>}
                    {user.blog     && <a href={user.blog} target="_blank" rel="noreferrer" style={{ fontFamily: "monospace", fontSize: 11, color: "var(--blue)" }}>{user.blog}</a>}
                    <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-ghost)" }}>member since {joinYear}</span>
                  </div>
                </div>
                <CircularScore score={devScore} />
              </div>
            </Panel>

            {/* Stats */}
            <Panel>
              <SectionHeader title="STATISTICS" cmd="gh stats --all" />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <StatBox label="Repositories" value={user.public_repos} />
                <StatBox label="Stars Earned"  value={fmt(totalStars)}        color="var(--yellow)" />
                <StatBox label="Total Forks"   value={fmt(totalForks)}        color="var(--purple)" />
                <StatBox label="Followers"     value={fmt(user.followers)}    color="var(--green)" />
                <StatBox label="Following"     value={fmt(user.following)}    color="var(--orange)" />
                <StatBox label="Public Gists"  value={user.public_gists}      color="var(--blue)" />
              </div>
            </Panel>

            {/* Top repos */}
            <Panel>
              <SectionHeader title="TOP REPOSITORIES" cmd="gh repo list --sort stars --limit 6" />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {byStars.slice(0, 6).map((repo) => {
                  const health    = calcRepoHealth(repo);
                  const langColor = LANG_COLORS[repo.language] || "var(--blue)";
                  return (
                    <div key={repo.id} style={{
                      border: "1px solid var(--border)",
                      padding: "14px 18px",
                      background: "var(--bg-deep)",
                      display: "flex",
                      gap: 16,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}>
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 5, flexWrap: "wrap" }}>
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700, color: "var(--blue)" }}
                          >
                            {repo.name}
                          </a>
                          {repo.fork && <Tag color="var(--text-ghost)">FORK</Tag>}
                          {repo.topics?.slice(0, 2).map((t) => <Tag key={t}>{t}</Tag>)}
                        </div>
                        {repo.description && (
                          <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)", lineHeight: 1.5 }}>
                            {repo.description}
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                        {repo.language && (
                          <span style={{
                            fontFamily: "monospace", fontSize: 10, color: langColor,
                            display: "flex", alignItems: "center", gap: 5,
                          }}>
                            <span style={{ width: 7, height: 7, borderRadius: "50%", background: langColor, display: "inline-block" }} />
                            {repo.language}
                          </span>
                        )}
                        <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--yellow)" }}>★ {fmt(repo.stargazers_count)}</span>
                        <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-muted)" }}>⑂ {fmt(repo.forks_count)}</span>
                        <span style={{ fontFamily: "monospace", fontSize: 9, color: "var(--text-ghost)" }}>{timeAgo(repo.updated_at)}</span>
                        <HealthBadge score={health} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>

            {/* Language preview */}
            <Panel>
              <SectionHeader title="LANGUAGE SNAPSHOT" cmd="gh lang top --limit 8" />
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {langData.slice(0, 8).map((l, i) => {
                  const tot = langData.reduce((a, x) => a + x.count, 0);
                  const pct = Math.round((l.count / tot) * 100);
                  return (
                    <div key={i} style={{
                      border: `1px solid ${l.color}33`,
                      background: "var(--bg-deep)",
                      padding: "10px 14px",
                      flex: "1 1 120px",
                      cursor: "pointer",
                    }}
                    onClick={() => setActiveTab("languages")}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
                        <span style={{ width: 7, height: 7, background: l.color, display: "inline-block" }} />
                        <span style={{ fontFamily: "monospace", fontSize: 11, color: l.color }}>{l.name}</span>
                      </div>
                      <div style={{ fontFamily: "monospace", fontSize: 18, color: "#e8f0ff", fontWeight: 800 }}>
                        {pct}<span style={{ fontSize: 10, color: "var(--text-ghost)" }}>%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>
          </>
        )}

        {/* ── REPOS ── */}
        {activeTab === "repos" && <ReposTab repos={repos} />}

        {/* ── LANGUAGES ── */}
        {activeTab === "languages" && <LanguagesTab langData={langData} />}

        {/* ── ACTIVITY ── */}
        {activeTab === "activity" && <ActivityTab activity={activity} loading={activityLoading} />}

        {/* ── COMPARE ── */}
        {activeTab === "compare" && (
          <CompareTab
            primaryUser={user}
            primaryRepos={repos}
            initialUsername={initialCompare}
            onCompareChange={onCompareChange}
          />
        )}

        {/* ── AI ── */}
        {activeTab === "ai" && (
          <AITab insights={aiText} loading={aiLoading} />
        )}

      </div>
    </>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const [username, setUsername] = useState(null);
  const [compareUsername, setCompareUsername] = useState(null);
  const [theme, toggleTheme] = useTheme();
  const [history,  setHistory]  = useState(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("ghstats_history") || "[]"); }
    catch { return []; }
  });

  // Deep-link support: /?u=torvalds&vs=gaearon loads straight into a comparison.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const u = params.get("u");
    const vs = params.get("vs");
    if (u) {
      setUsername(u);
      if (vs) setCompareUsername(vs);
    }
  }, []);

  const syncUrl = (u, vs) => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (u) params.set("u", u);
    if (vs) params.set("vs", vs);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  };

  const handleSearch = (u) => {
    const h = [u, ...history.filter((x) => x !== u)].slice(0, 12);
    setHistory(h);
    try { localStorage.setItem("ghstats_history", JSON.stringify(h)); } catch {}
    setUsername(u);
    setCompareUsername(null);
    syncUrl(u, null);
  };

  const handleBack = () => {
    setUsername(null);
    setCompareUsername(null);
    syncUrl(null, null);
  };

  const handleCompareChange = (vs) => {
    setCompareUsername(vs);
    syncUrl(username, vs);
  };

  return username
    ? (
      <Dashboard
        username={username}
        onBack={handleBack}
        theme={theme}
        onToggleTheme={toggleTheme}
        initialCompare={compareUsername}
        onCompareChange={handleCompareChange}
      />
    )
    : <SearchPage onSearch={handleSearch} history={history} />;
}
