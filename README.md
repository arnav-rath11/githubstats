# GitHubStats — Terminal Analytics Engine

> Analyze any GitHub developer profile in seconds. AI-powered insights, repo health scores, language analytics, and developer comparisons — all in a premium terminal UI.

![GitHubStats](https://img.shields.io/badge/GitHubStats-Terminal%20UI-4a9eff?style=flat-square&fontColor=040810)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square)
![Gemini AI](https://img.shields.io/badge/Gemini-2.5%20Flash-4a9eff?style=flat-square)

---

## Features

- **Terminal UI** — Monospace fonts, rectangle cards, scanline overlay, blinking cursors
- **GitHub Profile Analysis** — Stats, repos, followers, stars, forks
- **Repository Health Scoring** — 0–100 score based on README, license, activity, stars
- **Language Analytics** — Bar charts, radar chart, percentage breakdowns
- **AI Insights** — Gemini-powered analysis: strengths, tech stack, recruiter summary
- **Developer Comparison** — Side-by-side head-to-head stats
- **Search History** — Recently analyzed profiles stored locally
- **Developer Score** — Animated circular 0–100 score
- **Activity Heatmap** — 90-day public activity grid with current/longest streak and most-active day/hour
- **Theme Toggle** — Switch between blue and amber terminal palettes (persisted)
- **Share Card Export** — Download a PNG stat card for socials
- **JSON Report Export** — Download a structured report of the analyzed profile
- **Shareable Compare Links** — `?u=username&vs=other` deep-links straight into a comparison
- **Session Caching** — GitHub API responses cached for 5 minutes to save rate-limit calls

---

## Changelog (this revision)

- **Fixed:** Navbar used an invalid `"@media(...)"` key inside an inline React `style` object, which React silently ignores — this broke mobile layout (tabs never hid, hamburger never showed). Replaced with real CSS media queries (`globals.css`) and class toggling.
- **Fixed:** `Skeleton` referenced a `shimmer` animation that was never defined in `globals.css`.
- **Added:** Activity tab (heatmap + streaks) — see `components/ActivityTab.js`.
- **Added:** Theme toggle (`lib/theme.js`) — most hardcoded hex colors were refactored to use the existing CSS variables in `globals.css` so the whole UI re-themes consistently.
- **Added:** Share card + JSON report export (`lib/utils.js`: `downloadShareCard`, `downloadReport`).
- **Added:** URL-based deep-linking for both the analyzed profile and an active comparison.
- **Added:** Lightweight `sessionStorage` caching for GitHub REST calls.

---

## Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd githubstats
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Optional — increases GitHub API rate limit from 60 to 5000 req/hr
# Create at: https://github.com/settings/tokens
# Scopes needed: public_repo, read:user
NEXT_PUBLIC_GITHUB_TOKEN=ghp_your_token_here

# Required for AI Insights tab
# Get a free key (no card required) at: https://aistudio.google.com/apikey
GEMINI_API_KEY=your_gemini_key_here
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

### Option A: Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option B: Vercel Dashboard

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → New Project → Import your repo
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_GITHUB_TOKEN` (optional)
   - `GEMINI_API_KEY` (required for AI tab — free, no card required)
4. Deploy

---

## Project Structure

```
githubstats/
├── pages/
│   ├── _app.js              # App wrapper
│   ├── _document.js         # HTML head
│   ├── index.js             # Main page (search + dashboard)
│   └── api/
│       └── ai-insights.js   # Gemini API proxy (keeps key server-side)
├── components/
│   ├── UI.js                # Shared components (Panel, StatBox, etc.)
│   ├── Navbar.js            # Top navigation bar
│   ├── LoadingScreen.js     # Terminal loading sequence
│   ├── ReposTab.js          # Repository explorer
│   ├── LanguagesTab.js      # Language analytics
│   ├── CompareTab.js        # Developer comparison
│   └── AITab.js             # AI insights display
├── lib/
│   └── utils.js             # GitHub API, scoring, utilities
├── styles/
│   └── globals.css          # Global styles + CSS variables
├── vercel.json              # Vercel deployment config
├── next.config.js           # Next.js config
└── .env.local               # Environment variables (gitignored)
```

---

## API Rate Limits

| Mode | Rate Limit |
|------|-----------|
| Without token | 60 requests/hour |
| With `NEXT_PUBLIC_GITHUB_TOKEN` | 5,000 requests/hour |

Create a token at [github.com/settings/tokens](https://github.com/settings/tokens) — only needs `public_repo` and `read:user` scopes.

---

## Tech Stack

- **Next.js 14** — Framework
- **React 18** — UI
- **Recharts** — Charts (BarChart, RadarChart)
- **GitHub REST API** — Profile + repo data
- **Google Gemini (2.5 Flash)** — AI insights (free tier, via Gemini API)
- **JetBrains Mono** — Terminal typography
- **Vercel** — Deployment

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_GITHUB_TOKEN` | No | GitHub PAT for higher rate limits |
| `GEMINI_API_KEY` | For AI tab | Free Gemini API key for AI insights — get one at aistudio.google.com/apikey |

---

## License

MIT
