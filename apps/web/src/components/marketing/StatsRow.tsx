import { STATS } from "@ai-voice-leads/shared";

export function StatsRow() {
  return (
    <div className="stats-row">
      {STATS.map((s) => (
        <div key={s.label} className="stat-card">
          <p className="stat-value">{s.value}</p>
          <p className="stat-label muted">{s.label}</p>
        </div>
      ))}
    </div>
  );
}
