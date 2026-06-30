# Changelog

All notable changes to GitHubStats are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.3.0] — AI provider: Gemini

### Changed
- Replaced the AI Insights backend with **Google Gemini (`gemini-2.5-flash`)**, called via `pages/api/ai-insights.js`. Free tier, no credit card required.
- Renamed the env var from `GROQ_API_KEY` to `GEMINI_API_KEY` (`.env.example`, `.env.local`, README).
- Added optional `GEMINI_MODEL` env var to override the default model (e.g. `gemini-2.5-flash-lite` for higher free-tier throughput).
- Updated `AITab.js` labels and the "AI engine running" copy to reflect Gemini instead of Groq.
- Updated README badges, tech stack, and env var tables.

### Removed
- All Groq and prior Anthropic/Claude references, endpoints, and env vars.

---

## [1.2.0] — AI provider: Groq *(superseded by 1.3.0)*

### Changed
- Replaced the original Anthropic (`claude-sonnet-4-6`) AI backend with **Groq** (`openai/gpt-oss-120b`), an OpenAI-compatible, genuinely free API with no credit card required.
- Renamed the env var from `ANTHROPIC_API_KEY` to `GROQ_API_KEY`.
- Updated request/response shape in `ai-insights.js` to match Groq's chat-completions format (`choices[0].message.content` instead of Anthropic's `content[]` block array).

---

## [1.1.0] — Feature pass + mobile bug fix

### Fixed
- **Mobile navbar was broken.** The desktop-tabs/mobile-hamburger toggle relied on an inline React `style` object containing `"@media(max-width:640px)": { display: "none" }` — React silently ignores unknown style keys, so this never worked. All nav tabs were always rendered at once and the hamburger button was permanently hidden, causing the navbar to overflow on small screens. Replaced with real CSS media queries (`.nav-tabs-desktop` / `.nav-mobile-toggle` in `globals.css`) and class-based toggling in `Navbar.js`.
- `Skeleton` (in `UI.js`) referenced a `shimmer` keyframe animation that was never defined anywhere in `globals.css`, so loading skeletons rendered as a static gray block instead of animating. Added the missing `@keyframes shimmer`.
- Fixed a latent bug in `CompareTab.js`'s compare button: `onClick={handleCompare}` passed the raw DOM click event as `handleCompare`'s first argument, which could shadow the intended override-username parameter. Changed to `onClick={() => handleCompare()}`.

### Added
- **Activity tab** (`components/ActivityTab.js`) — 90-day heatmap of public GitHub events, current streak, longest streak, most active weekday, and most active hour. Derived from the public events API (`/users/:username/events/public`), which is the only activity data available without an authenticated GraphQL request.
- **Theme toggle** (`lib/theme.js`) — switches between a blue and an amber CRT palette, persisted in `localStorage`. Most hardcoded hex colors across components were refactored to reference the CSS variables already defined in `globals.css` (`--blue`, `--green`, `--text-muted`, etc.) so the whole UI re-themes consistently instead of just one component.
- **Share card export** (`lib/utils.js`: `downloadShareCard`) — renders a downloadable PNG stat card (avatar, dev score, key stats, top languages) via `<canvas>`, for sharing on socials.
- **JSON report export** (`lib/utils.js`: `downloadReport`) — downloads a structured JSON report of the analyzed profile: score, stats, top languages, and top 10 repos with health scores.
- **Shareable compare links** — the URL now syncs to `?u=username&vs=other`, so visiting that link auto-loads the profile and runs the comparison. A "copy shareable link" button was added to `CompareTab.js`.
- **Session caching** (`lib/utils.js`) — GitHub REST responses are cached in `sessionStorage` for 5 minutes, cutting down on repeat API calls when revisiting a profile or switching tabs.
- `color-mix()`-based alpha blending replaced the old `${hexColor}NN` string-concatenation trick for translucent borders (`HealthBadge`, `Tag`, AI section cards) — that trick silently broke once colors became CSS variables instead of literal hex strings, since `var(--green)44` isn't valid CSS.

---

## [1.0.0] — Initial release

### Added
- Terminal-style dashboard: profile overview, statistics, top repositories, language snapshot.
- Animated circular **developer score** (0–100), derived from repo count, stars, followers, profile completeness, and original-vs-forked ratio.
- **Repository health scoring** (0–100) per repo, based on description, license, recency, stars, open issues, and topic coverage.
- **Repos tab** — searchable, sortable (stars / updated / name / health / forks), with a fork-visibility toggle.
- **Languages tab** — horizontal bar chart, percentage breakdown bars, and a 6-language radar chart (via Recharts).
- **Compare tab** — head-to-head stat bars against a second GitHub username, plus side-by-side language breakdowns.
- **AI Insights tab** — Anthropic Claude (`claude-sonnet-4-6`)-generated analysis across six sections: strengths, tech stack, consistency, open source, recruiter summary, and improvements.
- Animated boot-sequence **loading screen** with step-by-step status.
- **Search history**, stored in `localStorage`, for quick re-analysis of recent profiles.
- Scanline overlay, blinking cursor, and JetBrains Mono typography for the full retro-terminal aesthetic.
- `vercel.json` with Next.js framework detection and permissive CORS headers on `/api/*`.