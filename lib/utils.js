// ─── CONSTANTS ───────────────────────────────────────────────────────────────
export const LANG_COLORS = {
  JavaScript:  "#f7df1e",
  TypeScript:  "#3178c6",
  Python:      "#3572A5",
  Rust:        "#dea584",
  Go:          "#00ADD8",
  C:           "#555555",
  "C++":       "#f34b7d",
  Java:        "#b07219",
  Ruby:        "#701516",
  Swift:       "#ffac45",
  Kotlin:      "#A97BFF",
  HTML:        "#e34c26",
  CSS:         "#563d7c",
  Shell:       "#89e051",
  PHP:         "#777bb4",
  Dart:        "#00B4AB",
  Scala:       "#DC322F",
  Haskell:     "#5e5086",
  Elixir:      "#6e4a7e",
  Lua:         "#000080",
  R:           "#198CE7",
  Zig:         "#ec915c",
  Other:       "#4a9eff",
};

// ─── FORMAT ───────────────────────────────────────────────────────────────────
export const fmt = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n ?? 0);
};

export const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
};

// ─── CACHE ───────────────────────────────────────────────────────────────────
// Lightweight sessionStorage cache so re-visiting the same profile/page during
// a session doesn't burn extra GitHub API rate-limit calls.
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function cacheGet(key) {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return undefined;
    const { t, v } = JSON.parse(raw);
    if (Date.now() - t > CACHE_TTL) return undefined;
    return v;
  } catch { return undefined; }
}

function cacheSet(key, v) {
  if (typeof window === "undefined") return;
  try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), v })); } catch {}
}

// ─── GITHUB API ───────────────────────────────────────────────────────────────
const getHeaders = () => {
  const headers = { Accept: "application/vnd.github+json" };
  const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

export async function githubREST(path) {
  const cacheKey = `ghstats_cache:${path}`;
  const cached = cacheGet(cacheKey);
  if (cached !== undefined) return cached;

  const r = await fetch(`https://api.github.com${path}`, { headers: getHeaders() });
  if (r.status === 404) throw new Error(`User not found: ${path.split("/")[2]}`);
  if (r.status === 403) throw new Error("GitHub API rate limit exceeded. Add a GITHUB_TOKEN to increase limits.");
  if (r.status === 401) throw new Error("Invalid GitHub token. Check your NEXT_PUBLIC_GITHUB_TOKEN.");
  if (!r.ok) throw new Error(`GitHub API error ${r.status}: ${r.statusText}`);
  const data = await r.json();
  cacheSet(cacheKey, data);
  return data;
}

export async function fetchAllRepos(username) {
  let page = 1;
  let all = [];
  while (true) {
    const chunk = await githubREST(
      `/users/${username}/repos?per_page=100&page=${page}&sort=updated&type=public`
    );
    all = all.concat(chunk);
    if (chunk.length < 100 || page >= 5) break;
    page++;
  }
  return all;
}

// ─── ACTIVITY (public events) ─────────────────────────────────────────────────
// GitHub's events API only exposes the last ~90 days / 300 events of PUBLIC
// activity (no token required). Good enough for a "recent activity" view —
// full historical contribution calendars require the GraphQL API + a token.
export async function fetchUserEvents(username) {
  let all = [];
  for (let page = 1; page <= 3; page++) {
    const chunk = await githubREST(`/users/${username}/events/public?per_page=100&page=${page}`);
    all = all.concat(chunk);
    if (chunk.length < 100) break;
  }
  return all;
}

export function calcActivityStats(events) {
  const byDate = {};
  events.forEach((e) => {
    const day = e.created_at?.slice(0, 10);
    if (!day) return;
    byDate[day] = (byDate[day] || 0) + 1;
  });

  // Build the last 90 days (oldest -> newest) so the heatmap always renders
  // a consistent grid even on days with zero activity.
  const days = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: byDate[key] || 0 });
  }

  // Streaks (consecutive days with at least one event), walking backward from today.
  let currentStreak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].count > 0) currentStreak++;
    else break;
  }
  let longestStreak = 0, run = 0;
  days.forEach((d) => {
    run = d.count > 0 ? run + 1 : 0;
    longestStreak = Math.max(longestStreak, run);
  });

  // Most active weekday / hour, from raw event timestamps.
  const weekdayCounts = Array(7).fill(0);
  const hourCounts = Array(24).fill(0);
  events.forEach((e) => {
    if (!e.created_at) return;
    const d = new Date(e.created_at);
    weekdayCounts[d.getDay()]++;
    hourCounts[d.getHours()]++;
  });
  const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const mostActiveDay = WEEKDAYS[weekdayCounts.indexOf(Math.max(...weekdayCounts))];
  const mostActiveHour = hourCounts.indexOf(Math.max(...hourCounts));

  return {
    days,
    currentStreak,
    longestStreak,
    mostActiveDay,
    mostActiveHour,
    totalEvents: events.length,
  };
}

// ─── SHARE CARD ───────────────────────────────────────────────────────────────
// Renders a downloadable PNG "stat card" for sharing on socials.
export async function downloadShareCard({ user, devScore, totalStars, totalForks, langData }) {
  const W = 1000, H = 560;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#040810";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#1a2535";
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, W - 40, H - 40);

  // Avatar
  try {
    const img = await new Promise((resolve, reject) => {
      const im = new Image();
      im.crossOrigin = "anonymous";
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = user.avatar_url;
    });
    ctx.drawImage(img, 56, 56, 120, 120);
    ctx.strokeStyle = "#4a9eff";
    ctx.lineWidth = 3;
    ctx.strokeRect(56, 56, 120, 120);
  } catch {}

  ctx.fillStyle = "#e8f0ff";
  ctx.font = "700 30px 'JetBrains Mono', monospace";
  ctx.fillText(user.name || user.login, 200, 95);
  ctx.fillStyle = "#4a9eff";
  ctx.font = "400 18px 'JetBrains Mono', monospace";
  ctx.fillText(`@${user.login}`, 200, 128);
  ctx.fillStyle = "#2a4060";
  ctx.font = "400 12px monospace";
  ctx.fillText("GITHUBSTATS — DEVELOPER ANALYTICS ENGINE", 200, 156);

  // Score
  ctx.fillStyle = "#4a9eff";
  ctx.font = "900 64px 'JetBrains Mono', monospace";
  ctx.fillText(String(devScore), W - 230, 130);
  ctx.fillStyle = "#2a4060";
  ctx.font = "700 14px monospace";
  ctx.fillText("DEV SCORE / 100", W - 230, 158);

  // Stat row
  const stats = [
    ["REPOS", fmt(user.public_repos)],
    ["STARS", fmt(totalStars)],
    ["FORKS", fmt(totalForks)],
    ["FOLLOWERS", fmt(user.followers)],
  ];
  const colW = (W - 112) / stats.length;
  stats.forEach(([label, val], i) => {
    const x = 56 + i * colW;
    ctx.strokeStyle = "#1a2535";
    ctx.lineWidth = 1;
    ctx.strokeRect(x, 220, colW - 16, 100);
    ctx.fillStyle = "#4a6080";
    ctx.font = "700 11px monospace";
    ctx.fillText(label, x + 16, 250);
    ctx.fillStyle = "#e8f0ff";
    ctx.font = "800 30px 'JetBrains Mono', monospace";
    ctx.fillText(String(val), x + 16, 295);
  });

  // Top languages
  ctx.fillStyle = "#4a6080";
  ctx.font = "700 11px monospace";
  ctx.fillText("TOP LANGUAGES", 56, 360);
  let lx = 56;
  (langData || []).slice(0, 5).forEach((l) => {
    ctx.fillStyle = l.color;
    ctx.font = "700 14px monospace";
    const text = l.name;
    ctx.fillText(text, lx, 392);
    lx += ctx.measureText(text).width + 36;
  });

  ctx.fillStyle = "#1e3a5a";
  ctx.font = "400 11px monospace";
  ctx.fillText("generated by githubstats", 56, H - 40);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${user.login}-githubstats-card.png`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── EXPORT REPORT ────────────────────────────────────────────────────────────
export function downloadReport({ user, repos, devScore, langData, totalStars, totalForks }) {
  const report = {
    generatedAt: new Date().toISOString(),
    username: user.login,
    name: user.name,
    devScore,
    stats: {
      publicRepos: user.public_repos,
      followers: user.followers,
      following: user.following,
      totalStars,
      totalForks,
    },
    topLanguages: langData.map((l) => ({ name: l.name, repoCount: l.count })),
    topRepos: [...repos]
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 10)
      .map((r) => ({
        name: r.name,
        url: r.html_url,
        stars: r.stargazers_count,
        forks: r.forks_count,
        language: r.language,
        healthScore: calcRepoHealth(r),
      })),
  };
  const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${user.login}-githubstats-report.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── SCORING ─────────────────────────────────────────────────────────────────
export function calcDevScore(user, repos) {
  let score = 0;
  // Repo count
  score += Math.min(user.public_repos * 1.2, 18);
  // Stars
  const totalStars = repos.reduce((a, r) => a + r.stargazers_count, 0);
  score += Math.min(Math.log10(totalStars + 1) * 8, 18);
  // Followers
  score += Math.min(Math.log10(user.followers + 1) * 6, 15);
  // Described repos
  const described = repos.filter((r) => r.description && !r.fork).length;
  score += Math.min((described / Math.max(repos.length, 1)) * 14, 14);
  // Profile completeness
  if (user.bio)              score += 5;
  if (user.blog)             score += 4;
  if (user.company)          score += 4;
  if (user.location)         score += 4;
  if (user.twitter_username) score += 3;
  if (user.email)            score += 3;
  // Has original repos
  const originals = repos.filter((r) => !r.fork).length;
  score += Math.min(originals * 0.5, 10);

  return Math.min(Math.round(score), 100);
}

export function calcRepoHealth(repo) {
  let score = 0;
  if (repo.description)                    score += 15;
  if (repo.license)                        score += 20;
  if (!repo.fork)                          score += 10;
  const daysSince = (Date.now() - new Date(repo.updated_at)) / 86400000;
  if (daysSince < 30)       score += 20;
  else if (daysSince < 180) score += 12;
  else if (daysSince < 365) score += 6;
  if (repo.stargazers_count > 50)          score += 15;
  else if (repo.stargazers_count > 10)     score += 8;
  if (repo.open_issues_count === 0)        score += 10;
  else if (repo.open_issues_count < 5)     score += 6;
  if (repo.topics?.length > 2)             score += 10;
  else if (repo.topics?.length > 0)        score += 5;
  return Math.min(score, 100);
}

export function getHealthBadge(score) {
  if (score >= 80) return { label: "EXCELLENT", color: "#00ff88" };
  if (score >= 60) return { label: "GOOD",      color: "#4a9eff" };
  if (score >= 40) return { label: "AVERAGE",   color: "#ffd700" };
  return              { label: "NEEDS WORK",    color: "#ff4466" };
}

export function getLangData(repos) {
  const counts = {};
  repos.forEach((r) => {
    if (r.language) counts[r.language] = (counts[r.language] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({
      name,
      count,
      color: LANG_COLORS[name] || LANG_COLORS.Other,
    }));
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
