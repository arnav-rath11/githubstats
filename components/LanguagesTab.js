import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";
import { Panel, SectionHeader, ProgressBar } from "./UI";

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--bg-base)",
      border: "1px solid var(--border)",
      padding: "10px 14px",
      fontFamily: "monospace",
      fontSize: 11,
    }}>
      <div style={{ color: payload[0].payload.color || "var(--blue)" }}>
        {payload[0].payload.name}
      </div>
      <div style={{ color: "var(--text-dim)", marginTop: 4 }}>
        {payload[0].value} repos
      </div>
    </div>
  );
};

export default function LanguagesTab({ langData }) {
  const total = langData.reduce((a, l) => a + l.count, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Bar chart + breakdown */}
      <Panel>
        <SectionHeader title="LANGUAGE DISTRIBUTION" cmd="gh lang analyze --all" />
        <div style={{
          display: "flex",
          gap: 32,
          flexWrap: "wrap",
          alignItems: "flex-start",
        }}>
          {/* Chart */}
          <div style={{ flex: "1 1 300px", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={langData}
                layout="vertical"
                margin={{ left: 0, right: 20, top: 5, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  tick={{ fontFamily: "monospace", fontSize: 9, fill: "var(--text-ghost)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={95}
                  tick={{ fontFamily: "monospace", fontSize: 11, fill: "var(--text-dim)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--bg-raised)" }} />
                <Bar dataKey="count" radius={0} maxBarSize={20}>
                  {langData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Percentage bars */}
          <div style={{ flex: "1 1 220px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {langData.map((l, i) => {
                const pct = Math.round((l.count / total) * 100);
                return (
                  <div key={i}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{
                        fontFamily: "monospace",
                        fontSize: 11,
                        color: l.color,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}>
                        <span style={{
                          display: "inline-block",
                          width: 7,
                          height: 7,
                          background: l.color,
                          borderRadius: 0,
                        }} />
                        {l.name}
                      </span>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--text-ghost)" }}>
                        {pct}%
                        <span style={{ color: "var(--border)", marginLeft: 8 }}>
                          {l.count} repo{l.count !== 1 ? "s" : ""}
                        </span>
                      </span>
                    </div>
                    <ProgressBar value={pct} color={l.color} height={2} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Panel>

      {/* Radar chart */}
      <Panel>
        <SectionHeader title="SKILL RADAR" cmd="gh lang radar --top 6" />
        <div style={{ height: 340 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={langData.slice(0, 6)} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke="var(--border)" strokeDasharray="4 4" />
              <PolarAngleAxis
                dataKey="name"
                tick={{ fontFamily: "monospace", fontSize: 10, fill: "var(--text-muted)" }}
              />
              <Radar
                name="repos"
                dataKey="count"
                stroke="var(--blue)"
                fill="var(--blue)"
                fillOpacity={0.12}
                strokeWidth={1.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* Language cards */}
      <Panel>
        <SectionHeader title="LANGUAGE INDEX" cmd="gh lang list" />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {langData.map((l, i) => {
            const pct = Math.round((l.count / total) * 100);
            return (
              <div key={i} style={{
                border: `1px solid ${l.color}33`,
                background: "var(--bg-deep)",
                padding: "12px 16px",
                flex: "1 1 140px",
              }}>
                <div style={{
                  fontFamily: "monospace",
                  fontSize: 12,
                  color: l.color,
                  marginBottom: 6,
                  fontWeight: 700,
                }}>
                  {l.name}
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 20, color: "#e8f0ff", fontWeight: 800, marginBottom: 4 }}>
                  {pct}
                  <span style={{ fontSize: 11, color: "var(--text-ghost)" }}>%</span>
                </div>
                <div style={{ fontFamily: "monospace", fontSize: 9, color: "var(--text-ghost)", marginBottom: 8 }}>
                  {l.count} repo{l.count !== 1 ? "s" : ""}
                </div>
                <ProgressBar value={pct} color={l.color} height={2} />
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}
