import { useEffect, useState } from "react";
import API from "../services/api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
const Dashboard = () => {
  const [taskStats, setTaskStats] = useState(null);
  const [habitStats, setHabitStats] = useState(null);
  const [score, setScore] = useState(null);
  const [insights, setInsights] = useState([]);
  const [trend, setTrend] = useState(null);
  const [habits, setHabits] = useState([]);
  const chartData = taskStats
  ? [
      { name: "Completed", value: taskStats.completedTasks },
      { name: "Pending", value: taskStats.pendingTasks },
    ]
  : [];
  const cardStyle = {
  background: "white",
  padding: "20px",
  borderRadius: "10px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  transition: "all 0.2s ease",
};

  const fetchData = async () => {
    try {
      const taskRes = await API.get("/analytics/tasks");
      console.log("Task:", taskRes.data);

      const habitRes = await API.get("/analytics/habits");
      console.log("Habit:", habitRes.data);

      const scoreRes = await API.get("/analytics/score");
      console.log("Score:", scoreRes.data);

      const insightRes = await API.get("/analytics/insights");
      const trendRes = await API.get("/analytics/trend");
      const habitsListRes = await API.get("/habits");
      setHabits(habitsListRes.data);
      setTrend(trendRes.data);
      setInsights(insightRes.data.insights);
      setTaskStats(taskRes.data);
      setHabitStats(habitRes.data);
      setScore(scoreRes.data);

    } catch (error) {
      console.error("ERROR:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
   <div style={{
  maxWidth: "900px",
  margin: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "20px"
}}>
      <h1 style={{ marginBottom: "10px" }}>Dashboard </h1>
<p style={{ color: "#6b7280", marginBottom: "10px" }}>
  Overview of your productivity
</p>

     {taskStats && (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "20px",
      marginTop: "20px",
    }}
  >

    {/* Task Stats */}
    <div style={cardStyle}
    onMouseEnter={(e) => {
  e.currentTarget.style.transform = "translateY(-4px)";
  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = "translateY(0)";
  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
}}
    >
      <h3 style={{ marginBottom: "15px" }}>📋 Task Stats</h3>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {[
          { label: "Total", value: taskStats.totalTasks, color: "#111827" },
          { label: "Completed", value: taskStats.completedTasks, color: "#22c55e" },
          { label: "Pending", value: taskStats.pendingTasks, color: "#ef4444" },
        ].map((item, index) => (
          <div key={index} style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "28px", margin: 0, color: item.color }}>
              {item.value}
            </h1>
            <p style={{ fontSize: "14px", color: "#6b7280" }}>
              {item.label}
            </p>
          </div>
        ))}
        
      </div>
      <div style={{ marginTop: "20px" }}>
  <p style={{ fontSize: "14px", marginBottom: "5px" }}>
    Completion Rate
  </p>

  <div
    style={{
      background: "#e5e7eb",
      borderRadius: "10px",
      height: "20px",
      overflow: "hidden",
    }}
  >
    <div
      style={{
        width: `${taskStats.totalTasks === 0 ? 0 : (taskStats.completedTasks / taskStats.totalTasks) * 100}%`,
        background: "#22c55e",
        height: "100%",
      }}
    ></div>
  </div>
</div>
    </div>

    {/* Chart */}
    <div style={{ ...cardStyle, textAlign: "center" }}
    onMouseEnter={(e) => {
  e.currentTarget.style.transform = "translateY(-4px)";
  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = "translateY(0)";
  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
}}
    >
      <h3>📊 Task Distribution</h3>

      <PieChart width={250} height={250}>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={80}
          dataKey="value"
          label
        >
          <Cell fill="#22c55e" />
          <Cell fill="#ef4444" />
        </Pie>

        <Tooltip />
        <Legend />
      </PieChart>
    </div>

  </div>
)}
{habitStats && (
  <div
    style={{ ...cardStyle, marginTop: "20px" }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-4px)";
      e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
    }}
  >
    <h3 style={{ marginBottom: "15px" }}>🔥 Habit Stats</h3>

    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
      {[
        { label: "Total", value: habitStats.totalHabits, color: "#111827" },
        { label: "Active", value: habitStats.activeHabits, color: "#3b82f6" },
        { label: "Avg Streak", value: habitStats.averageStreak, color: "#f59e0b" },
      ].map((item, index) => (
        <div key={index} style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "28px", margin: 0, color: item.color }}>
            {item.value}
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280" }}>
            {item.label}
          </p>
        </div>
      ))}
    </div>

    {/* Habit Streaks */}
    {habits.length > 0 && (
      <div>
        <h3 style={{ marginBottom: "10px" }}>🔥 Habit Streaks</h3>

        {habits.map((habit) => (
          <div
            key={habit._id}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <span style={{ width: "100px" }}>
              🔥 {habit.name}
            </span>

            <div
              style={{
                flex: 1,
                background: "#e5e7eb",
                borderRadius: "6px",
                height: "20px",
                margin: "0 10px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${Math.min((habit.streak / habit.target) * 100, 100)}%`,
                  background: "#f59e0b",
                  height: "100%",
                }}
              ></div>
            </div>

            <span>
              ({habit.streak} / {habit.target})
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
)}
      {/* Productivity Score */}
      {score && (
  <div style={{ ...cardStyle, marginTop: "20px", textAlign: "center" }}
  onMouseEnter={(e) => {
  e.currentTarget.style.transform = "translateY(-4px)";
  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = "translateY(0)";
  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
}}
  >
    <h3>⚡ Productivity Score</h3>
    <h1 style={{ fontSize: "40px", color: "#2563eb" }}>
      {score.productivityScore}
    </h1>
  </div>
)}

      {insights.length > 0 && (
  <div style={{ ...cardStyle, marginTop: "20px" }}
  onMouseEnter={(e) => {
  e.currentTarget.style.transform = "translateY(-4px)";
  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = "translateY(0)";
  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
}}
  >
    <h3 style={{ marginBottom: "10px" }}>🧠 Insights</h3>

    <ul style={{ paddingLeft: "20px", lineHeight: "1.8" }}>
      {insights.map((item, index) => (
        <li key={index} style={{ marginBottom: "5px" }}>
          {item}
        </li>
      ))}
    </ul>
  </div>
)}
      {/* Weekly Trend */}
      {trend && (
  <div style={{ ...cardStyle, marginTop: "20px" }}
  onMouseEnter={(e) => {
  e.currentTarget.style.transform = "translateY(-4px)";
  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.12)";
}}
onMouseLeave={(e) => {
  e.currentTarget.style.transform = "translateY(0)";
  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
}}
  >
    <h3 style={{ marginBottom: "10px" }}>📈 Weekly Trend</h3>

    <p>Last Week: {trend.lastWeekRate}%</p>
    <p>Previous Week: {trend.prevWeekRate}%</p>

    <p
      style={{
        fontWeight: "bold",
        color:
          trend.trend === "improving"
            ? "green"
            : trend.trend === "declining"
            ? "red"
            : "gray",
      }}
    >
      Status: {trend.trend}
    </p>

    <p style={{ marginTop: "10px", fontStyle: "italic" }}>
      {trend.message}
    </p>
  </div>
)}
    </div>
  );
};

export default Dashboard;