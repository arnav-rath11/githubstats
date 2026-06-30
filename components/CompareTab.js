import { useState, useEffect } from "react";
import { Panel, SectionHeader, ProgressBar } from "./UI";
import { githubREST, fetchAllRepos, calcDevScore, getLangData, fmt } from "../lib/utils";

function CompareRow({ label, val1, val2, color1 = "var(--blue)", color2 = "var(--orange)", higher = "higher" }) {
  const n1 = typeof val1 === "number" ? val1 : 0;
  const n2 = typeof val2 === "number" ? val2 : 0;
  const max = Math.max(n1, n2, 1);
  const w1 = (n1 / max) * 100;
  const w2 = (n2 / max) * 100;
  const winner = n1 > n2 ? 1 : n2 > n1 ? 2 : 0;

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
        <span style={{
          fontFamily: "monospace",
          fontSize: 11,
          color: winner === 1 ? color1 : "var(--text)",
          fontWeight: winner === 1 ? 700 : 400,
        }}>
          {fmt(val1)} {winner === 1 ? "▲" : ""}
        </span>
        <span style={{ fontFamily: "monospace", fontSize: 9, color: "var(--text-ghost)", letterSpacing: 2 }}>
          {label}
        </span>
        <span style={{
          fontFamily: "monospace",
          fontSize: 11,
          color: winner === 2 ? color2 : "var(--text)",
          fontWeight: winner === 2 ? 700 : 400,
        }}>
          {winner === 2 ? "▲" : ""} {fmt(val2)}
        </span>
      </div>
      <div style={{ display: "flex", gap: 3 }}>
        <div style={{ flex: 1, background: "var(--bg-raised)", height: 3, display: "flex", justifyContent: "flex-end" }}>
          <div style={{ height: "100%", background: color1, width: `${w1}%`, transition: "width 0.8s ease" }} />
        </div>
        <div style={{ width: 3, background: "var(--border)", flexShrink: 0 }} />
        <div style={{ flex: 1, background: "var(--bg-raised)", height: 3 }}>
          <div style={{ height: "100%", background: color2, width: `${w2}%`, transition: "width 0.8s ease" }} />
        </div>
      </div>
    </div>
  );
}

export default function CompareTab({ primaryUser, primaryRepos, initialUsername, onCompareChange }) {
  const [compareUsername, setCompareUsername] = useState(initialUsername || "");
  const [compareData, setCompareData]         = useState(null);
  const [loading, setLoading]                 = useState(false);
  const [error, setError]                     = useState(null);
  const [copied, setCopied]                   = useState(false);

  const primaryScore = calcDevScore(primaryUser, primaryRepos);
  const primaryStars = primaryRepos.reduce((a, r) => a + r.stargazers_count, 0);
  const primaryLangs = getLangData(primaryRepos);

  const handleCompare = async (overrideUsername) => {
    const target = (overrideUsername ?? compareUsername).trim();
    if (!target) return;
    setLoading(true);
    setError(null);
    setCompareData(null);
    try {
      const user  = await githubREST(`/users/${target}`);
      const repos = await fetchAllRepos(target);
      const score = calcDevScore(user, repos);
      const stars = repos.reduce((a, r) => a + r.stargazers_count, 0);
      const langs = getLangData(repos);
      setCompareData({ user, repos, score, stars, langs });
      onCompareChange?.(target);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  // Auto-run when arriving via a shared "?u=...&vs=..." link.
  useEffect(() => {
    if (initialUsername) handleCompare(initialUsername);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUsername]);

  const copyLink = () => {
    if (typeof window === "undefined") return;
    navigator.clipboard?.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Search bar */}
      <Panel>
        <SectionHeader title="COMPARE DEVELOPERS" cmd="gh user compare" />
        <div style={{ display: "flex", gap: 0 }}>
          <div style={{
            background: "var(--bg-raised)", border: "1px solid var(--border)", borderRight: "none",
            padding: "12px 14px", fontFamily: "monospace", color: "var(--blue)", fontSize: 13,
            display: "flex", alignItems: "center",
          }}>
            $
          </div>
          <input
            value={compareUsername}
            onChange={(e) => setCompareUsername(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCompare()}
            placeholder="enter second github username"
            style={{
              flex: 1, background: "var(--bg-raised)", border: "1px solid var(--border)", borderRight: "none",
              color: "var(--text)", fontFamily: "monospace", fontSize: 12, padding: "12px 16px",
            }}
          />
          <button
            onClick={() => handleCompare()}
            disabled={loading}
            style={{
              background: "var(--blue)", border: "none", color: "var(--bg-deep)",
              fontFamily: "monospace", fontSize: 12, fontWeight: 700,
              padding: "12px 20px", letterSpacing: 1,
            }}
          >
            {loading ? "LOADING..." : "COMPARE →"}
          </button>
        </div>
        {error && (
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--red)", marginTop: 10 }}>
            {error}
          </div>
        )}
        {compareData && (
          <button
            onClick={copyLink}
            style={{
              marginTop: 10, background: "transparent", border: "1px solid var(--border)",
              color: copied ? "var(--green)" : "var(--text-muted)", fontFamily: "monospace",
              fontSize: 10, padding: "6px 12px", letterSpacing: 1,
            }}
          >
            {copied ? "✓ LINK COPIED" : "⎘ COPY SHAREABLE LINK"}
          </button>
        )}
      </Panel>

      {/* Results */}
      {compareData && (
        <>
          {/* Header avatars */}
          <Panel>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
              {/* User 1 */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1 }}>
                <img src={primaryUser.avatar_url} alt={primaryUser.login} style={{ width: 56, height: 56, border: "2px solid var(--blue)" }} />
                <div>
                  <div style={{ fontFamily: "monospace", fontSize: 14, color: "var(--blue)", fontWeight: 700 }}>
                    {primaryUser.name || primaryUser.login}
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-ghost)" }}>
                    @{primaryUser.login}
                  </div>
                </div>
              </div>

              <div style={{ fontFamily: "monospace", fontSize: 14, color: "var(--text-ghost)", letterSpacing: 4 }}>
                VS
              </div>

              {/* User 2 */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, flex: 1, justifyContent: "flex-end" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "monospace", fontSize: 14, color: "var(--orange)", fontWeight: 700 }}>
                    {compareData.user.name || compareData.user.login}
                  </div>
                  <div style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-ghost)" }}>
                    @{compareData.user.login}
                  </div>
                </div>
                <img src={compareData.user.avatar_url} alt={compareData.user.login} style={{ width: 56, height: 56, border: "2px solid var(--orange)" }} />
              </div>
            </div>
          </Panel>

          {/* Stats comparison */}
          <Panel>
            <SectionHeader title="HEAD TO HEAD" />
            <CompareRow label="DEV SCORE"   val1={primaryScore}                         val2={compareData.score} />
            <CompareRow label="REPOS"        val1={primaryUser.public_repos}              val2={compareData.user.public_repos} />
            <CompareRow label="STARS"        val1={primaryStars}                          val2={compareData.stars} />
            <CompareRow label="FOLLOWERS"    val1={primaryUser.followers}                 val2={compareData.user.followers} />
            <CompareRow label="FORKS"        val1={primaryRepos.reduce((a,r)=>a+r.forks_count,0)} val2={compareData.repos.reduce((a,r)=>a+r.forks_count,0)} />
          </Panel>

          {/* Language overlap */}
          <Panel>
            <SectionHeader title="LANGUAGE COMPARISON" />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {[
                { label: primaryUser.login, langs: primaryLangs, color: "var(--blue)" },
                { label: compareData.user.login, langs: compareData.langs, color: "var(--orange)" },
              ].map(({ label, langs, color }) => (
                <div key={label}>
                  <div style={{ fontFamily: "monospace", fontSize: 9, color, letterSpacing: 2, marginBottom: 12 }}>
                    {label.toUpperCase()}
                  </div>
                  {langs.slice(0, 6).map((l, i) => {
                    const tot = langs.reduce((a, x) => a + x.count, 0);
                    const pct = Math.round((l.count / tot) * 100);
                    return (
                      <div key={i} style={{ marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontFamily: "monospace", fontSize: 10, color: l.color }}>{l.name}</span>
                          <span style={{ fontFamily: "monospace", fontSize: 10, color: "var(--text-ghost)" }}>{pct}%</span>
                        </div>
                        <ProgressBar value={pct} color={l.color} height={2} />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}
