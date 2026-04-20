const Habit = require("../models/Habit");

// CREATE HABIT
exports.createHabit = async (req, res) => {
  try {
    const { name, target } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Habit name is required" });
    }

    const habit = await Habit.create({
      userId: req.user.id,
      name,
    });

    res.status(201).json(habit);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// MARK HABIT COMPLETE
exports.completeHabit = async (req, res) => {
  try {
    const habitId = req.params.id;

    const habit = await Habit.findById(habitId);

    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    // Check ownership
    if (habit.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const today = new Date();
    const lastDate = habit.lastCompletedDate;

    // Normalize dates (remove time part)
    const todayDate = new Date(today.setHours(0, 0, 0, 0));

    let streak = habit.streak;

    if (lastDate) {
      const lastCompleted = new Date(lastDate.setHours(0, 0, 0, 0));

      const diffTime = todayDate - lastCompleted;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        // Continue streak
        streak += 1;
      } else if (diffDays > 1) {
        // Streak broken
        streak = 1;
      }
      // if same day → do nothing
    } else {
      // First time completion
      streak = 1;
    }

    habit.streak = streak;
    habit.lastCompletedDate = today;

    await habit.save();

    res.json(habit);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL HABITS (user-specific)
exports.getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id })
      .sort({ createdAt: -1 });

    res.json(habits);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};