import { Panel, SectionHeader, StatBox } from "./UI";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function cellColor(count) {
  if (count === 0) return undefined; // falls back to default .heatmap-cell background
  if (count === 1) return "color-mix(in srgb, var(--green) 35%, var(--bg-raised))";
  if (count <= 3) return "color-mix(in srgb, var(--green) 65%, var(--bg-raised))";
  return "var(--green)";
}

export default function ActivityTab({ activity, loading }) {
  if (loading) {
    return (
      <Panel style={{ textAlign: "center", padding: "64px 24px" }}>
        <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text-muted)" }}>
          loading activity…
        </div>
      </Panel>
    );
  }

  if (!activity) {
    return (
      <Panel style={{ padding: "48px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: "monospace", fontSize: 12, color: "var(--red)" }}>
          Activity unavailable.
        </div>
      </Panel>
    );
  }

  const { days, currentStreak, longestStreak, mostActiveDay, mostActiveHour, totalEvents } = activity;

  // Label the first day of each month that appears in the grid.
  let lastMonth = -1;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Panel>
        <SectionHeader title="ACTIVITY STREAKS" cmd="gh events analyze --days 90" />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <StatBox label="Current Streak" value={`${currentStreak}d`} color="var(--green)" />
          <StatBox label="Longest Streak" value={`${longestStreak}d`} color="var(--yellow)" />
          <StatBox label="Most Active Day" value={mostActiveDay} color="var(--blue)" />
          <StatBox
            label="Most Active Hour"
            value={`${String(mostActiveHour).padStart(2, "0")}:00`}
            color="var(--purple)"
          />
          <StatBox label="Public Events" value={totalEvents} color="var(--orange)" sub="last ~90 days" />
        </div>
      </Panel>

      <Panel>
        <SectionHeader title="90-DAY ACTIVITY MAP" cmd="gh activity heatmap" />
        <div style={{ fontFamily: "monospace", fontSize: 10, color: "var(--text-ghost)", marginBottom: 14 }}>
          Based on public events only — GitHub doesn&apos;t expose full contribution history without
          an authenticated GraphQL request. Private activity isn&apos;t reflected here.
        </div>
        <div style={{ overflowX: "auto", paddingBottom: 6 }}>
          <div className="heatmap-grid">
            {days.map((d) => {
              const date = new Date(d.date);
              const showLabel = date.getDate() <= 7 && date.getMonth() !== lastMonth;
              if (showLabel) lastMonth = date.getMonth();
              return (
                <div
                  key={d.date}
                  className="heatmap-cell"
                  title={`${d.date}: ${d.count} event${d.count !== 1 ? "s" : ""}`}
                  style={{ background: cellColor(d.count) }}
                />
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 10, fontFamily: "monospace", fontSize: 9, color: "var(--text-ghost)" }}>
            {MONTHS.map((m, i) => (
              <span key={i} style={{ display: days.some((d) => new Date(d.date).getMonth() === i) ? "inline" : "none" }}>
                {m}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16, fontFamily: "monospace", fontSize: 9, color: "var(--text-ghost)" }}>
          LESS
          <span className="heatmap-cell" style={{ background: cellColor(0) }} />
          <span className="heatmap-cell" style={{ background: cellColor(1) }} />
          <span className="heatmap-cell" style={{ background: cellColor(2) }} />
          <span className="heatmap-cell" style={{ background: cellColor(4) }} />
          MORE
        </div>
      </Panel>
    </div>
  );
}
