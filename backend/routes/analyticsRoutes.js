const express = require("express");
const router = express.Router();

const { 
  getTaskStats, 
  getHabitStats, 
  getProductivityScore, 
  getInsights,
  getWeeklyTrend 
} = require("../controllers/analyticsController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/tasks", authMiddleware, getTaskStats);
router.get("/habits", authMiddleware, getHabitStats);
router.get("/score", authMiddleware, getProductivityScore);
router.get("/insights", authMiddleware, getInsights);
router.get("/trend", authMiddleware, getWeeklyTrend);
module.exports = router;