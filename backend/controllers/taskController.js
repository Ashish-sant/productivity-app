const Task = require("../models/Task");

// CREATE TASK
exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority } = req.body;

    // Basic validation
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = await Task.create({
      userId: req.user.id, // from JWT middleware
      title,
      description,
      dueDate,
      priority,
    });

    res.status(201).json(task);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL TASKS (for logged-in user)
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id })
      .sort({ createdAt: -1 }); // latest first

    res.json(tasks);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// UPDATE TASK
exports.updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    // Find task
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check ownership
    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update task
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      req.body,
      { new: true }
    );

    res.json(updatedTask);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// DELETE TASK
exports.deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Ownership check
    if (task.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Task.findByIdAndDelete(taskId);

    res.json({ message: "Task deleted successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};