const express = require("express");
const router = express.Router();

const usersController = require("../controllers/user_controller");

// sign-in & sign-up route
router.get("/sign-up", usersController.signUp);
router.get("/sign-in", usersController.signIn);

// Logout route
router.get("/log-out", usersController.logOut);

// Create a user - handling singUp functionality
router.post("/create", usersController.create);

// handle signIn user
router.post("/create-session", usersController.createSession);

module.exports = router;
