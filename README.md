<div align="center">

# ⌁ GitHubStats

### Terminal-style analytics for any GitHub developer profile

![GitHubStats](https://img.shields.io/badge/GitHubStats-Terminal%20UI-4a9eff?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)
![Gemini AI](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-4a9eff?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-00ff88?style=flat-square)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)

**Drop in a GitHub username. Get repo health scores, language breakdowns, a 90-day**
**activity heatmap, AI-written insights, and head-to-head developer comparisons —**
**all rendered as a retro terminal dashboard.**

[Features](#-features) · [Quick start](#-quick-start) · [Deploy](#-deploy-to-vercel) · [Architecture](#-project-structure) · [FAQ](#-faq)

</div>

---

## ✦ Overview

GitHubStats turns a single GitHub username into a full analytics dashboard: profile
stats, a weighted 0–100 developer score, per-repo health scoring, a language radar
chart, a 90-day public-activity heatmap with streak tracking, an AI-generated
recruiter-style summary, and a side-by-side comparison tool against any other
developer — all wrapped in a CRT-green terminal aesthetic with scanlines and
blinking cursors.

It's a single Next.js app, no database, no backend to host — it talks directly to
the GitHub REST API client-side and proxies one request to Google's Gemini API
server-side (so your AI key never reaches the browser).

---

## ✦ Features

| | |
|---|---|
| 🖥️ **Terminal UI** | Monospace type, rectangular cards, scanline overlay, blinking cursor — built to feel like a CLI tool, not a SaaS dashboard |
| 👤 **Profile analysis** | Avatar, bio, location, company, blog link, join year, repo/follower/gist counts |
| 🎯 **Developer score** | A weighted 0–100 score from repo count, stars (log-scaled), followers, profile completeness, and original-vs-forked ratio — shown as an animated circular gauge |
| 🩺 **Repo health scoring** | Every repo gets a 0–100 health badge from description, license, recency, stars, open issues, and topic coverage |
| 🌐 **Language analytics** | Horizontal bar chart, percentage breakdown bars, and a radar chart across your top 6 languages |
| 📅 **Activity heatmap** | 90-day grid of public GitHub events with current streak, longest streak, most active weekday, and most active hour |
| 🤖 **AI insights** | Gemini reads the profile and writes six sections: strengths, tech stack assessment, consistency, open-source involvement, a recruiter summary, and improvement suggestions |
| ⚔️ **Developer comparison** | Head-to-head bars for score, repos, stars, followers, and forks against a second username, plus a side-by-side language breakdown |
| 🔗 **Shareable compare links** | `?u=you&vs=them` deep-links straight into a loaded comparison — copy-link button included |
| 🗂️ **Repo explorer** | Searchable, sortable (stars/updated/name/health/forks), fork-filterable grid of every public repo |
| 🎨 **Theme toggle** | Blue or amber CRT palette, persisted across sessions |
| 🖼️ **Share card export** | One click renders a downloadable PNG stat card for socials |
| 📄 **JSON report export** | Download a structured report of the analyzed profile (score, stats, top repos, languages) |
| 🕘 **Search history** | Recently analyzed profiles saved locally for one-click revisits |
| ⚡ **Session caching** | GitHub API responses cached for 5 minutes so revisiting a profile doesn't burn rate-limit calls |
| 📱 **Responsive nav** | Real CSS media queries — tabs collapse into a hamburger menu below 720px |

---

## ✦ Quick start

### 1. Clone and install

```bash
git clone <your-repo-url>
cd githubstats
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```env
# Optional — raises the GitHub API rate limit from 60 to 5,000 req/hr.
# Create at: https://github.com/settings/tokens
# Scopes needed: public_repo, read:user
NEXT_PUBLIC_GITHUB_TOKEN=ghp_your_token_here

# Required for the AI Insights tab. Free, no credit card.
# Get a key at: https://aistudio.google.com/apikey
GEMINI_API_KEY=your_gemini_key_here
```

> `.env.local` is already listed in `.gitignore` — it will never be committed.
> If you ever need to double-check, run `git status` and confirm it's not listed.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and search any GitHub username.

---

## ✦ Deploy to Vercel

### Option A — Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option B — Vercel dashboard

1. Push the repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo. Vercel auto-detects Next.js and uses the committed `vercel.json`.
3. Before the first deploy (or any time after, followed by a redeploy), go to **Settings → Environment Variables** and add:
   - `GEMINI_API_KEY` — required for the AI tab
   - `NEXT_PUBLIC_GITHUB_TOKEN` — optional, raises GitHub's rate limit
4. Deploy.

> **Why this step matters:** `.env.local` only exists on your machine and is
> gitignored on purpose. Vercel builds from your repo, not your filesystem, so
> it never sees that file — env vars have to be entered in the dashboard
> directly. If you add or change one after the project already exists, trigger
> a redeploy; Vercel doesn't retroactively inject new vars into a running build.

---

## ✦ Project structure

```
githubstats/
├── pages/
│   ├── _app.js                # App wrapper, imports global styles
│   ├── _document.js           # HTML <head> (fonts, meta)
│   ├── index.js                # Search page + dashboard (all tabs render from here)
│   └── api/
│       └── ai-insights.js      # Gemini API proxy — keeps GEMINI_API_KEY server-side only
├── components/
│   ├── UI.js                   # Shared primitives: Panel, StatBox, CircularScore,
│   │                           #   HealthBadge, Tag, ProgressBar, Cursor, Skeleton
│   ├── Navbar.js                # Sticky top nav, responsive tabs, theme toggle
│   ├── LoadingScreen.js         # Animated boot-sequence loader
│   ├── ReposTab.js              # Searchable/sortable repo grid
│   ├── LanguagesTab.js          # Bar chart + radar chart + language index
│   ├── ActivityTab.js           # 90-day heatmap + streak stats
│   ├── CompareTab.js            # Head-to-head developer comparison
│   └── AITab.js                 # Parses and displays the Gemini response
├── lib/
│   ├── utils.js                 # GitHub REST client, caching, scoring algorithms,
│   │                            #   activity stats, share-card + JSON export
│   └── theme.js                 # Theme persistence hook (blue / amber)
├── styles/
│   └── globals.css              # CSS variables, theme overrides, responsive nav,
│                                 #   scanline + animation keyframes
├── vercel.json                  # Vercel build/deploy config + API CORS headers
├── next.config.js               # Next.js config (image domains)
├── .env.example                 # Template for required/optional env vars
└── .env.local                   # Your real keys — gitignored, never committed
```

---

## ✦ How the scoring works

**Developer score (0–100)** — a weighted blend of:
- Repo count (capped contribution)
- Total stars across all repos, log-scaled so one viral repo doesn't dominate
- Followers, also log-scaled
- Ratio of described, non-fork repos
- Profile completeness (bio, blog, company, location, Twitter, email)
- Count of original (non-forked) repositories

**Repo health (0–100)** — per repository, from:
- Has a description
- Has a license
- Isn't a fork
- Recency of last update (more recent = higher)
- Star count tiers
- Open issue count (fewer = higher)
- Topic/tag coverage

Both are pure functions in `lib/utils.js` (`calcDevScore`, `calcRepoHealth`) — tune the
weights there if you want a different scoring philosophy.

---

## ✦ API rate limits

| Mode | Limit |
|---|---|
| GitHub REST, no token | 60 requests/hour |
| GitHub REST, with `NEXT_PUBLIC_GITHUB_TOKEN` | 5,000 requests/hour |
| Gemini (`gemini-2.5-flash`), free tier | Generous daily quota, no card required — see [Google's current limits](https://ai.google.dev/gemini-api/docs/rate-limits) |

A 5-minute `sessionStorage` cache on GitHub REST calls (`lib/utils.js`) also cuts
down on repeat calls when revisiting the same profile in one session.

---

## ✦ Environment variables reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_GITHUB_TOKEN` | No | GitHub personal access token. Raises the rate limit; only needs `public_repo` and `read:user` scopes. **Note:** the `NEXT_PUBLIC_` prefix means this is bundled into client-side JS and visible in devtools — don't reuse a token that has write access elsewhere. |
| `GEMINI_API_KEY` | For the AI tab | Free Google Gemini API key. Get one at [aistudio.google.com/apikey](https://aistudio.google.com/apikey). Used only server-side in `pages/api/ai-insights.js`. |
| `GEMINI_MODEL` | No | Overrides the default `gemini-2.5-flash` model (e.g. `gemini-2.5-flash-lite` for higher free-tier throughput). |

---

## ✦ Tech stack

- **[Next.js 14](https://nextjs.org)** — framework, pages router, API routes
- **[React 18](https://react.dev)** — UI
- **[Recharts](https://recharts.org)** — bar chart + radar chart on the Languages tab
- **GitHub REST API** — profile, repos, public events
- **[Google Gemini](https://ai.google.dev) (2.5 Flash)** — AI insights, free tier
- **JetBrains Mono** — terminal typography throughout
- **Vercel** — hosting/deployment target

No database, no auth, no server state — everything is fetched live and cached only in `sessionStorage`/`localStorage`.

---

## ✦ FAQ

**Does this need a backend or database?**
No. It's a static-friendly Next.js app; the only server-side code is the one API route that proxies Gemini calls so your key isn't exposed in the browser.

**Why is `NEXT_PUBLIC_GITHUB_TOKEN` exposed to the client but `GEMINI_API_KEY` isn't?**
The GitHub calls happen client-side (browser → GitHub API directly) for simplicity, and the token only carries read-only public-data scopes, so exposure is low-risk. The Gemini key is a paid-capable credential with no equivalent low-risk scope, so it's kept server-side only, behind `/api/ai-insights`.

**The AI tab says "API key not configured" — what now?**
Add `GEMINI_API_KEY` to `.env.local` (locally) or your Vercel project's environment variables (in production), then restart the dev server or redeploy.

**Can I swap the AI provider?**
Yes — `pages/api/ai-insights.js` is a single isolated route. Any provider with a chat-completion style endpoint can replace the `fetch` call inside it without touching the rest of the app.

**I'm hitting GitHub rate limits fast.**
Add `NEXT_PUBLIC_GITHUB_TOKEN` — it takes the limit from 60/hr to 5,000/hr. See [Quick start](#-quick-start) for how to generate one.

---

## ✦ License

MIT — do whatever you want with it.

---

<div align="center">

See [CHANGELOG.md](./CHANGELOG.md) for the full revision history.

</div>