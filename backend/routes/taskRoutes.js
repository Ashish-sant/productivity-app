const express = require("express");
const router = express.Router();

const { createTask, getTasks, updateTask, deleteTask } = require("../controllers/taskController");
const authMiddleware = require("../middleware/authMiddleware");

// Create Task
router.post("/", authMiddleware, createTask);

// Get All Tasks
router.get("/", authMiddleware, getTasks);

router.put("/:id", authMiddleware, updateTask);

router.delete("/:id", authMiddleware, deleteTask);
module.exports = router;