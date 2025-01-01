const express = require("express");

const router = express.Router();
const habitsController = require("../controllers/habit_controller");


// Dashboard which will show all the habits and daily/weekly view
router.get("/dashboard", habitsController.getDashboardPage);

// To add a new habit
router.post("/add-habit/:id", habitsController.addHabits);

// To remove an habit
router.get("/remove", habitsController.removeHabit);

// Add/Remove habit to/from favorites
router.get("/favorite", habitsController.addRemoveFavorite);

// Update the status of habit
router.get("/status-update", habitsController.updateStatus);

// Toggle daily/weekly view
router.post("/toggle-view", habitsController.toggleView);

router.use("/users", require("./users"));

module.exports = router;
