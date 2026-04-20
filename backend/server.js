const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// Test route
app.get("/", (req, res) => {
  res.send("API Running...");
});

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log("MongoDB Connected");
  app.listen(5000, () => console.log("Server running on port 5000"));
})
.catch(err => console.log(err));
const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);
const authMiddleware = require("./middleware/authMiddleware");

app.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "You are authorized", user: req.user });
});

const taskRoutes = require("./routes/taskRoutes");

app.use("/api/tasks", taskRoutes);

const habitRoutes = require("./routes/habitRoutes");

app.use("/api/habits", habitRoutes);
const analyticsRoutes = require("./routes/analyticsRoutes");

app.use("/api/analytics", analyticsRoutes);