import { useState, useEffect } from "react";
import API from "../services/api";

// Priority badge styles — high stands out (danger), medium uses the peach
// accent sparingly, low is a quiet sage. Encodes urgency at a glance.
const priorityStyles = {
  high: "bg-danger-soft text-danger",
  medium: "bg-peach text-peach-dark",
  low: "bg-sage text-ink-soft",
};

const Tasks = () => {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState("all"); // all | pending | completed

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
    } catch (error) {
      console.error(error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!title.trim()) return;

    try {
      setAdding(true);
      // Send the fields the backend already supports (title/priority/dueDate).
      await API.post("/tasks", {
        title: title.trim(),
        priority,
        dueDate: dueDate || undefined,
      });
      setTitle("");
      setPriority("medium");
      setDueDate("");
      fetchTasks();
    } catch (error) {
      console.error(error.response?.data || error.message);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      fetchTasks();
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };

  const handleToggle = async (task) => {
    try {
      await API.put(`/tasks/${task._id}`, {
        ...task,
        status: task.status === "completed" ? "pending" : "completed",
      });
      fetchTasks();
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Format an ISO date to something readable, and flag overdue tasks.
  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });

  const isOverdue = (task) => {
    if (!task.dueDate || task.status === "completed") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(task.dueDate) < today;
  };

  // Apply the active filter to the list.
  const visibleTasks = tasks.filter((t) => {
    if (filter === "all") return true;
    return t.status === filter;
  });

  const filters = ["all", "pending", "completed"];

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold mb-1">Tasks</h1>
      <p className="text-ink-muted text-sm mb-6">
        Add, prioritize, and track what needs doing.
      </p>

      {/* Add-task card */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
            className="input flex-1"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="input sm:w-32"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="input sm:w-40"
          />
          <button
            onClick={handleAddTask}
            disabled={!title.trim() || adding}
            className="btn-primary sm:w-auto"
          >
            {adding ? "Adding..." : "Add"}
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={[
              "px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors",
              filter === f
                ? "bg-brand text-white"
                : "text-ink-soft hover:bg-sage-light",
            ].join(" ")}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List states: loading → empty → tasks */}
      {loading ? (
        <p className="text-center text-ink-muted py-10">Loading tasks...</p>
      ) : visibleTasks.length === 0 ? (
        <div className="card text-center py-10">
          <p className="text-ink-soft font-medium">
            {filter === "all"
              ? "No tasks yet"
              : `No ${filter} tasks`}
          </p>
          <p className="text-ink-muted text-sm mt-1">
            {filter === "all"
              ? "Add your first task above to get started."
              : "Try a different filter."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {visibleTasks.map((task) => {
            const completed = task.status === "completed";
            return (
              <li
                key={task._id}
                className="card flex items-center gap-3 py-3"
              >
                {/* Toggle circle */}
                <button
                  onClick={() => handleToggle(task)}
                  aria-label={
                    completed ? "Mark as pending" : "Mark as completed"
                  }
                  className={[
                    "shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                    completed
                      ? "bg-brand border-brand text-white"
                      : "border-line-strong hover:border-brand",
                  ].join(" ")}
                >
                  {completed && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>

                {/* Title + meta */}
                <div className="flex-1 min-w-0">
                  <p
                    className={[
                      "truncate",
                      completed ? "line-through text-ink-muted" : "text-ink",
                    ].join(" ")}
                  >
                    {task.title}
                  </p>
                  {task.dueDate && (
                    <p
                      className={[
                        "text-xs mt-0.5",
                        isOverdue(task) ? "text-danger" : "text-ink-muted",
                      ].join(" ")}
                    >
                      {isOverdue(task) ? "Overdue · " : "Due "}
                      {formatDate(task.dueDate)}
                    </p>
                  )}
                </div>

                {/* Priority badge */}
                {task.priority && (
                  <span
                    className={[
                      "shrink-0 text-xs font-medium px-2 py-0.5 rounded-full capitalize",
                      priorityStyles[task.priority] || priorityStyles.low,
                    ].join(" ")}
                  >
                    {task.priority}
                  </span>
                )}

                {/* Delete */}
                <button
                  onClick={() => handleDelete(task._id)}
                  aria-label="Delete task"
                  className="shrink-0 w-8 h-8 rounded-lg text-ink-muted
                             hover:bg-danger-soft hover:text-danger
                             transition-colors flex items-center justify-center"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Tasks;