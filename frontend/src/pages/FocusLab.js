import insights from "../data/insights.json";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// Small KPI card
const Kpi = ({ label, value, suffix }) => (
  <div className="card text-center">
    <p className="text-2xl font-semibold text-brand">
      {value}
      {suffix}
    </p>
    <p className="text-sm text-ink-muted mt-1">{label}</p>
  </div>
);

const FocusLab = () => {
  const { kpis, by_sleep, by_screen_quartile, by_band } = insights;

  // Shape the screen-time data for the chart (label the quartiles).
  const screenData = by_screen_quartile.map((q) => ({
    name:
      q.quartile === 1
        ? "Least screen"
        : q.quartile === 4
        ? "Most screen"
        : `Q${q.quartile}`,
    productivity: q.avg_productivity,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Focus Lab</h1>
        <p className="text-ink-muted text-sm mt-1">
          Insights from a study of {kpis.total_students.toLocaleString()}{" "}
          students — what lifestyle habits line up with productivity. Built with
          a PostgreSQL + SQL data pipeline.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Kpi label="Avg productivity" value={kpis.avg_productivity} />
        <Kpi label="Avg study hours" value={kpis.avg_study_hours} suffix="h" />
        <Kpi label="Avg sleep hours" value={kpis.avg_sleep_hours} suffix="h" />
        <Kpi label="Avg screen time" value={kpis.avg_screen_time} suffix="h" />
      </div>

      {/* Headline insight: screen time vs productivity */}
      <div className="card">
        <h3 className="text-base font-semibold mb-1">
          More screen time, less productivity
        </h3>
        <p className="text-sm text-ink-muted mb-4">
          Students grouped into four equal buckets by daily screen time.
          Productivity falls steadily as screen time rises.
        </p>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={screenData}>
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[40, 60]} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="productivity" radius={[6, 6, 0, 0]}>
                {screenData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#007A33" : "#A8E6CE"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two supporting insights side by side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sleep */}
        <div className="card">
          <h3 className="text-base font-semibold mb-3">Sleep &amp; productivity</h3>
          <div className="space-y-3">
            {by_sleep.map((s) => (
              <div key={s.category}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{s.category} sleepers</span>
                  <span className="text-ink-muted">{s.avg_productivity}</span>
                </div>
                <div className="h-2 bg-sage-light rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand rounded-full"
                    style={{ width: `${s.avg_productivity}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-ink-muted mt-3">
            Under-sleepers score lowest — there's a clear sleep sweet spot.
          </p>
        </div>

        {/* Bands */}
        <div className="card">
          <h3 className="text-base font-semibold mb-3">
            High vs low performers
          </h3>
          <div className="space-y-3 text-sm">
            {by_band
              .slice()
              .sort((a, b) => b.avg_study - a.avg_study)
              .map((b) => (
                <div
                  key={b.band}
                  className="flex justify-between border-b border-line pb-2 last:border-0"
                >
                  <span className="font-medium">{b.band}</span>
                  <span className="text-ink-muted">
                    {b.avg_study}h study · {b.avg_screen}h screen
                  </span>
                </div>
              ))}
          </div>
          <p className="text-xs text-ink-muted mt-3">
            High performers study more and spend less time on screens.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FocusLab;