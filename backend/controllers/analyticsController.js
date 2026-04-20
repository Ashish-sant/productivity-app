const Task = require("../models/Task");

// TASK ANALYTICS
exports.getTaskStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalTasks = await Task.countDocuments({ userId });

    const completedTasks = await Task.countDocuments({
      userId,
      status: "completed",
    });

    const pendingTasks = totalTasks - completedTasks;

    const completionRate =
      totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      completionRate: completionRate.toFixed(2),
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const Habit = require("../models/Habit");

// HABIT ANALYTICS
exports.getHabitStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const habits = await Habit.find({ userId });

    const totalHabits = habits.length;

    const activeHabits = habits.filter(h => h.streak > 0).length;

    const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);

    const averageStreak =
      totalHabits === 0 ? 0 : totalStreak / totalHabits;

    res.json({
      totalHabits,
      activeHabits,
      averageStreak: averageStreak.toFixed(2),
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PRODUCTIVITY SCORE
exports.getProductivityScore = async (req, res) => {
  try {
    const userId = req.user.id;

    // TASK DATA
    const totalTasks = await Task.countDocuments({ userId });

    const completedTasks = await Task.countDocuments({
      userId,
      status: "completed",
    });

    const taskCompletion =
      totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

    // HABIT DATA
    const habits = await Habit.find({ userId });

    const totalHabits = habits.length;

    const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);

    const averageStreak =
      totalHabits === 0 ? 0 : totalStreak / totalHabits;

    let habitScore = averageStreak * 10;

    if (habitScore > 100) habitScore = 100;

    // FINAL SCORE
    const productivityScore =
      taskCompletion * 0.6 + habitScore * 0.4;

    res.json({
      taskCompletion: taskCompletion.toFixed(2),
      habitScore: habitScore.toFixed(2),
      productivityScore: productivityScore.toFixed(2),
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// SMART INSIGHTS
exports.getInsights = async (req, res) => {
  try {
    const userId = req.user.id;

    // TASK DATA
    const totalTasks = await Task.countDocuments({ userId });

    const completedTasks = await Task.countDocuments({
      userId,
      status: "completed",
    });

    const taskCompletion =
      totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

    // HABIT DATA
    const habits = await Habit.find({ userId });

    const totalHabits = habits.length;

    const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);

    const averageStreak =
      totalHabits === 0 ? 0 : totalStreak / totalHabits;

    let habitScore = averageStreak * 10;
    if (habitScore > 100) habitScore = 100;

    // INSIGHTS ARRAY
    const insights = [];

    // TASK INSIGHTS
    if (taskCompletion === 0) {
      insights.push("You haven't completed any tasks yet. Start small!");
    } else if (taskCompletion < 50) {
      insights.push("Your task completion is low. Try focusing on priorities.");
    } else {
      insights.push("Great job completing your tasks!");
    }

    // HABIT INSIGHTS
    if (habitScore === 0) {
      insights.push("You haven't started any habits yet.");
    } else if (habitScore < 50) {
      insights.push("Your habits need more consistency.");
    } else {
      insights.push("Excellent habit consistency!");
    }

    // COMBINED INSIGHT
    if (taskCompletion > 70 && habitScore > 70) {
      insights.push("You are highly productive! Keep it up 🔥");
    }

    res.json({ insights });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// WEEKLY TREND
exports.getWeeklyTrend = async (req, res) => {
  try {
    const userId = req.user.id;

    const today = new Date();

    const lastWeekStart = new Date();
    lastWeekStart.setDate(today.getDate() - 7);

    const prevWeekStart = new Date();
    prevWeekStart.setDate(today.getDate() - 14);

    // LAST WEEK TASKS
    const lastWeekTasks = await Task.find({
      userId,
      createdAt: { $gte: lastWeekStart },
    });

    const lastWeekCompleted = lastWeekTasks.filter(
      t => t.status === "completed"
    ).length;

    const lastWeekRate =
      lastWeekTasks.length === 0
        ? 0
        : (lastWeekCompleted / lastWeekTasks.length) * 100;

    // PREVIOUS WEEK TASKS
    const prevWeekTasks = await Task.find({
      userId,
      createdAt: {
        $gte: prevWeekStart,
        $lt: lastWeekStart,
      },
    });

    const prevWeekCompleted = prevWeekTasks.filter(
      t => t.status === "completed"
    ).length;

    const prevWeekRate =
      prevWeekTasks.length === 0
        ? 0
        : (prevWeekCompleted / prevWeekTasks.length) * 100;

    // TREND
    let trend = "same";
    let message = "Your productivity is consistent.";

    if (lastWeekTasks.length === 0 && prevWeekTasks.length === 0) {
      trend = "no-data";
      message = "No activity in the last two weeks. Start adding tasks!";
    } 
    else if (lastWeekRate > prevWeekRate) {
      trend = "improving";
      message = "Your productivity improved this week 🔥";
    } 
    else if (lastWeekRate < prevWeekRate) {
      trend = "declining";
      message = "Your productivity dropped. Try to refocus.";
    }

    if (lastWeekRate > prevWeekRate) {
      trend = "improving";
      message = "Your productivity improved this week 🔥";
    } else if (lastWeekRate < prevWeekRate) {
      trend = "declining";
      message = "Your productivity dropped. Try to refocus.";
    }

    res.json({
      lastWeekRate: lastWeekRate.toFixed(2),
      prevWeekRate: prevWeekRate.toFixed(2),
      trend,
      message,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};