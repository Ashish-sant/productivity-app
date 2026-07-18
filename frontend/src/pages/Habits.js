import { useState, useEffect } from "react";
import API from "../services/api";

const Habits = () => {
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");

  const fetchHabits = async () => {
    try {
      const res = await API.get("/habits");
      setHabits(res.data);
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleAddHabit = async () => {
    if (!name.trim() || !target) {
      setError("Please enter a habit name and target days.");
      return;
    }

    try {
      setAdding(true);
      setError("");
      await API.post("/habits", { name: name.trim(), target: parseInt(target) });
      setName("");
      setTarget("");
      fetchHabits();
    } catch (err) {
      setError(
        "Failed to add habit: " + (err.response?.data?.message || err.message)
      );
    } finally {
      setAdding(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      await API.put(`/habits/${id}/complete`);
      fetchHabits();
    } catch (err) {
      console.error(err.response?.data || err.message);
    }
  };

  // Has this habit already been marked complete today?
  const isCompletedToday = (habit) => {
    if (!habit.lastCompletedDate) return false;
    const last = new Date(habit.lastCompletedDate);
    const today = new Date();
    return last.toDateString() === today.toDateString();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-1">Habits</h1>
      <p className="text-ink-muted text-sm mb-6">
        Build streaks toward your target and keep momentum going.
      </p>

      {/* Add-habit card */}
      <div className="card mb-6">
        {error && (
          <div className="mb-3 rounded-lg bg-danger-soft text-danger text-sm px-3 py-2">
            {error}
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="e.g. Read 20 minutes"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError("");
            }}
            onKeyDown={(e) => e.key === "Enter" && handleAddHabit()}
            className="input flex-1"
          />
          <input
            type="number"
            min="1"
            placeholder="Target days"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddHabit()}
            className="input sm:w-36"
          />
          <button
            onClick={handleAddHabit}
            disabled={adding}
            className="btn-primary sm:w-auto"
          >
            {adding ? "Adding..." : "Add habit"}
          </button>
        </div>
      </div>

      {/* List states: loading → empty → habits */}
      {loading ? (
        <p className="text-center text-ink-muted py-10">Loading habits...</p>
      ) : habits.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-ink-soft font-medium">No habits yet</p>
          <p className="text-ink-muted text-sm mt-1">
            Add a habit above and start building your streak.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {habits.map((habit) => {
            const target = habit.target || 30;
            const progress = Math.min((habit.streak / target) * 100, 100);
            const reached = habit.streak >= target;
            const doneToday = isCompletedToday(habit);

            return (
              <div key={habit._id} className="card">
                {/* Header row: name + streak badge */}
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-ink">{habit.name}</p>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-peach text-peach-dark">
                    🔥 {habit.streak} day{habit.streak === 1 ? "" : "s"}
                  </span>
                </div>

                {/* Progress bar toward target */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-ink-muted mb-1">
                    <span>
                      {habit.streak} / {target} days
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-2 bg-sage-light rounded-full overflow-hidden">
                    <div
                      className={reached ? "h-full bg-brand" : "h-full bg-mint"}
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Complete action */}
                <button
                  onClick={() => handleComplete(habit._id)}
                  disabled={doneToday}
                  className={[
                    "w-full py-2 rounded-lg text-sm font-medium transition-colors",
                    doneToday
                      ? "bg-sage text-brand cursor-default"
                      : "bg-brand text-white hover:bg-brand-hover",
                  ].join(" ")}
                >
                  {doneToday ? "✓ Done today" : "Mark complete"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Habits;