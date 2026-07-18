const Habit = require("../models/Habit");

// CREATE HABIT
exports.createHabit = async (req, res) => {
  try {
    const { name, target } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Habit name is required" });
    }

    const habit = new Habit({
      name,
      target,
      userId: req.user.id,
    });

    await habit.save();

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

    const now = new Date();

    // Build a fresh midnight copy for TODAY without mutating `now`.
    const todayMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    let streak = habit.streak;

    if (habit.lastCompletedDate) {
      // Build a fresh midnight copy for the LAST completion date too.
      const last = new Date(habit.lastCompletedDate);
      const lastMidnight = new Date(
        last.getFullYear(),
        last.getMonth(),
        last.getDate()
      );

      const diffDays =
        (todayMidnight - lastMidnight) / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        // Completed on consecutive day → continue the streak
        streak += 1;
      } else if (diffDays > 1) {
        // A day (or more) was missed → streak resets
        streak = 1;
      }
      // diffDays === 0 (same day) → do nothing, no double count
    } else {
      // First ever completion
      streak = 1;
    }

    habit.streak = streak;
    habit.lastCompletedDate = now; // store the real timestamp, not a mutated one

    await habit.save();

    res.json(habit);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL HABITS (user-specific)
exports.getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(habits);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};