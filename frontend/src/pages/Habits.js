import { useState, useEffect } from "react";
import API from "../services/api";

const Habits = () => {
  const [name, setName] = useState("");
  const [habits, setHabits] = useState([]);
  const [target, setTarget] = useState("");
  const fetchHabits = async () => {
    try {
      const res = await API.get("/habits");
      setHabits(res.data);
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleAddHabit = async () => {
    try {
      await API.post("/habits", { name, target });

      setName("");
      setTarget("");
      fetchHabits();

    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };
   const handleComplete = async (id) => {
  try {
    console.log("Clicked habit:", id);

    const res = await API.put(`/habits/${id}/complete`);;

    console.log("Response:", res.data);

    fetchHabits();
  } catch (error) {
    console.error(error.response?.data || error.message);
  }
};

  return (
    <div style={{
  maxWidth: "600px",
  margin: "50px auto",
  textAlign: "center"
}}>
      <h2>Habits</h2>

      <input
        type="text"
        placeholder="Enter habit"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="number"
        placeholder="Target days"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
      />
      <button onClick={handleAddHabit}>Add Habit</button>

      <ul style={{ marginTop: "20px", listStyle: "none", padding: 0 }}>
  {habits.map((habit) => (
    <li
      key={habit._id}
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
      <span>
        {habit.name} (🔥 {habit.streak})
      </span>

      <button onClick={() => handleComplete(habit._id)}>
        ✔
      </button>
    </li>
  ))}
</ul>
    </div>
  );
};

export default Habits;