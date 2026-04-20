const express = require("express");
const router = express.Router();

const { createHabit, completeHabit, getHabits } = require("../controllers/habitController");
const authMiddleware = require("../middleware/authMiddleware");

// Create Habit
router.post("/", authMiddleware, createHabit);
router.put("/:id/complete", authMiddleware, completeHabit);
router.get("/", authMiddleware, getHabits);
module.exports = router;