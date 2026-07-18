import { useEffect, useState } from "react";
import API from "../services/api";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Reusable card classes (replaces the repeated inline hover handlers).
const cardCls =
  "card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-1";

// A small stat block: big number + label.
const Stat = ({ value, label, color }) => (
  <div className="text-center">
    <p className={`text-3xl font-semibold ${color}`}>{value}</p>
    <p className="text-sm text-ink-muted mt-1">{label}</p>
  </div>
);

// A skeleton placeholder shown while data loads.
const Skeleton = () => (
  <div className="card animate-pulse h-32 bg-sage-light" />
);

const Dashboard = () => {
  const [taskStats, setTaskStats] = useState(null);
  const [habitStats, setHabitStats] = useState(null);
  const [score, setScore] = useState(null);
  const [insights, setInsights] = useState([]);
  const [trend, setTrend] = useState(null);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch all analytics endpoints in parallel instead of one-by-one.
      const [taskRes, habitRes, scoreRes, insightRes, trendRes, habitsListRes] =
        await Promise.all([
          API.get("/analytics/tasks"),
          API.get("/analytics/habits"),
          API.get("/analytics/score"),
          API.get("/analytics/insights"),
          API.get("/analytics/trend"),
          API.get("/habits"),
        ]);

      setTaskStats(taskRes.data);
      setHabitStats(habitRes.data);
      setScore(scoreRes.data);
      setInsights(insightRes.data.insights);
      setTrend(trendRes.data);
      setHabits(habitsListRes.data);
    } catch (error) {
      console.error("ERROR:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const chartData = taskStats
    ? [
        { name: "Completed", value: taskStats.completedTasks },
        { name: "Pending", value: taskStats.pendingTasks },
      ]
    : [];

  const completionPct =
    taskStats && taskStats.totalTasks > 0
      ? (taskStats.completedTasks / taskStats.totalTasks) * 100
      : 0;

  // New user with no data at all → friendly empty state.
  const isEmpty =
    taskStats?.totalTasks === 0 && habitStats?.totalHabits === 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-ink-muted text-sm mt-1">
          Overview of your productivity
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Skeleton />
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      ) : isEmpty ? (
        <div className="card text-center py-12">
          <p className="text-ink-soft font-medium text-lg">
            Nothing to show yet
          </p>
          <p className="text-ink-muted text-sm mt-1">
            Add some tasks and habits, and your productivity overview will
            appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Top row: task stats + distribution chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {taskStats && (
              <div className={cardCls}>
                <h3 className="text-base font-semibold mb-4">Task stats</h3>
                <div className="flex justify-between">
                  <Stat
                    value={taskStats.totalTasks}
                    label="Total"
                    color="text-ink"
                  />
                  <Stat
                    value={taskStats.completedTasks}
                    label="Completed"
                    color="text-brand"
                  />
                  <Stat
                    value={taskStats.pendingTasks}
                    label="Pending"
                    color="text-peach-dark"
                  />
                </div>
                <div className="mt-5">
                  <p className="text-sm text-ink-soft mb-1">Completion rate</p>
                  <div className="h-3 bg-sage-light rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full transition-all"
                      style={{ width: `${completionPct}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {taskStats && (
              <div className={cardCls}>
                <h3 className="text-base font-semibold mb-2 text-center">
                  Task distribution
                </h3>
                <div style={{ width: "100%", height: 220 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label
                      >
                        <Cell fill="#007A33" />
                        <Cell fill="#FFCCBC" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Habit stats + streaks */}
          {habitStats && (
            <div className={cardCls}>
              <h3 className="text-base font-semibold mb-4">Habit stats</h3>
              <div className="flex justify-between mb-5">
                <Stat
                  value={habitStats.totalHabits}
                  label="Total"
                  color="text-ink"
                />
                <Stat
                  value={habitStats.activeHabits}
                  label="Active"
                  color="text-brand-soft"
                />
                <Stat
                  value={habitStats.averageStreak}
                  label="Avg streak"
                  color="text-peach-dark"
                />
              </div>

              {habits.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-line">
                  <p className="text-sm font-medium text-ink-soft pt-2">
                    Streaks
                  </p>
                  {habits.map((habit) => {
                    const target = habit.target || 30;
                    const pct = Math.min((habit.streak / target) * 100, 100);
                    return (
                      <div key={habit._id} className="flex items-center gap-3">
                        <span className="w-28 truncate text-sm">
                          {habit.name}
                        </span>
                        <div className="flex-1 h-2 bg-sage-light rounded-full overflow-hidden">
                          <div
                            className="h-full bg-mint rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs text-ink-muted w-12 text-right">
                          {habit.streak}/{target}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Productivity score */}
          {score && (
            <div className={`${cardCls} text-center`}>
              <h3 className="text-base font-semibold mb-2">
                Productivity score
              </h3>
              <p className="text-5xl font-semibold text-brand">
                {score.productivityScore}
              </p>
            </div>
          )}

          {/* Insights */}
          {insights.length > 0 && (
            <div className={cardCls}>
              <h3 className="text-base font-semibold mb-3">Insights</h3>
              <ul className="space-y-2">
                {insights.map((item, index) => (
                  <li key={index} className="flex gap-2 text-ink-soft text-sm">
                    <span className="text-brand">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Weekly trend */}
          {trend && (
            <div className={cardCls}>
              <h3 className="text-base font-semibold mb-3">Weekly trend</h3>
              <div className="flex gap-8 mb-3">
                <div>
                  <p className="text-xs text-ink-muted">Last week</p>
                  <p className="text-xl font-semibold">{trend.lastWeekRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-ink-muted">Previous week</p>
                  <p className="text-xl font-semibold">{trend.prevWeekRate}%</p>
                </div>
              </div>
              <span
                className={[
                  "inline-block text-xs font-medium px-2 py-1 rounded-full capitalize",
                  trend.trend === "improving"
                    ? "bg-mint text-brand"
                    : trend.trend === "declining"
                    ? "bg-danger-soft text-danger"
                    : "bg-sage text-ink-soft",
                ].join(" ")}
              >
                {trend.trend}
              </span>
              <p className="text-sm text-ink-soft mt-3 italic">
                {trend.message}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;