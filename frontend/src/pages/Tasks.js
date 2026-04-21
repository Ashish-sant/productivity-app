import { useState, useEffect } from "react";
import API from "../services/api";

const Tasks = () => {
  const [title, setTitle] = useState("");
  const [tasks, setTasks] = useState([]);

  const handleAddTask = async () => {
  if (!title.trim()) return; // 🔥 important

  try {
    await API.post("/tasks", { title });

    setTitle("");
    fetchTasks();
  } catch (error) {
    console.error(error.response?.data || error.message);
  }
};

  const fetchTasks = async () => {
    try {
      const res = await API.get("/tasks");
      setTasks(res.data);
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/tasks/${id}`);
      fetchTasks(); // refresh list
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

  return (
    <div style={{
  maxWidth: "600px",
  margin: "50px auto",
  textAlign: "center"
}}>
      <h2 style={{ marginBottom: "20px" }}>Tasks</h2>

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
  <input
    type="text"
    placeholder="Enter task"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
    style={{ flex: 1, padding: "8px" }}
  />

  <button
  onClick={handleAddTask}
  disabled={!title.trim()}
  style={{ opacity: title.trim() ? 1 : 0.5 }}
>
  Add
</button>
</div>

        <ul style={{ marginTop: "20px", listStyle: "none", padding: 0 }}>
  {tasks.map((task) => (
    <li
      key={task._id}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px",
        border: "1px solid #ddd",
        borderRadius: "6px",
        marginBottom: "10px",
      }}
    >
      <span
  style={{
    textDecoration:
      task.status === "completed" ? "line-through" : "none",
    cursor: "pointer",
  }}
>
  {task.title}
</span>

      <div>
        <button
          onClick={() => handleToggle(task)}
          style={{ marginRight: "10px" }}
        >
          ✔
        </button>

        <button onClick={() => handleDelete(task._id)}>
          ❌
        </button>
      </div>
    </li>
  ))}
</ul>
    </div>
  );
};

export default Tasks;