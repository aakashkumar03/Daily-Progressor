const mongoose = require("mongoose");

const HabitSchema = new mongoose.Schema(
  {
    // Content of the habit
    content: {
      type: String,
      required: true,
    },
    // User who added the habit
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // dates array to keep track of all the dates and status on that day
    dates: [
      {
        date: String,
        complete: {
          // status of the habit
          type: String,
          enum: ["yes", "no", "none"],
        },
      },
    ],
    // This is the favorite flag, to check whether the habit is added to favorite list or not
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Habit = mongoose.model("Habit", HabitSchema);

module.exports = Habit;
