const mongoose = require("mongoose");
const User = require("../models/user");
const Habit = require("../models/habit");

const { ObjectId } = mongoose.Types;

// storing loggedIn user email
var loggedInUserEmail = "";

// to get the day & date of the nth previous day from today
function getNthDay(n) {
  let d = new Date();
  var day;

  // Get the date of nth day
  d.setDate(d.getDate() - n);
  // converting the date to 'YYYY-MM-DD' format
  let date = d.toJSON().slice(0, 10);

  switch (d.getDay()) {
    case 0:
      day = "Sun";
      break;
    case 1:
      day = "Mon";
      break;
    case 2:
      day = "Tue";
      break;
    case 3:
      day = "Wed";
      break;
    case 4:
      day = "Thu";
      break;
    case 5:
      day = "Fri";
      break;
    case 6:
      day = "Sat";
      break;
  }

  // Passing the data as {date : '2023-03-02' , day : 'Thu'}
  return { date, day };
}

// Use to load the dashboard page of the user
module.exports.getDashboardPage = async (req, res) => {
  try {
    const { user: userId } = req.query;

    // Find the user
    const user = await User.findOne({ _id: userId });
    loggedInUserEmail = user.email;

    // If the user not found, then show the error
    if (!user) {
      req.flash("error", "User Not found, Bad Request");
      return res.redirect("/users/sign-in");
    }

    // making a days array of all 7 days i.e. today and previous 6 days
    var days = [];

    // to get today's and past 6 days details
    for (let i = 6; i >= 0; i--) {
      days.push(getNthDay(i));
    }

    // Find all the habits of the logged in user
    let habits = await Habit.find({ user: userId });

    // render the dashboard page with habits , user and days data
    return res.render("dashboard", { habits, user, days });
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong !");
    return res.redirect("back");
  }
};

// Controller to add habits
module.exports.addHabits = async (req, res) => {
  try {
    const { content } = req.body;
    const { id: LoggedInUserId } = req.params;

    // If content is empty, throw the notification
    if (!content) {
      return req.flash("error", "Content Can not be empty");
    }

    // If Content is not empty,  check if it's already present or not
    const habitExists = await Habit.findOne({
      content,
      user: new ObjectId(LoggedInUserId),
    });

    if (habitExists) {
      // If habit is already present then update it
      let dates = habitExists.dates;

      //  converting the date to 'YYYY-MM-DD' format
      let today = new Date(Date.now()).toJSON().slice(0, 10);

      dates.find(async (item, ind) => {
        if (item.date == today) {
          // If user is adding the habit and it is already present for the current date

          req.flash("error", "Entered habit is already exists");
          return res.redirect("back");
        } else {
          // if the habit is already present but not for the current date,
          // then just push today's date into the dates array for this habit

          dates.push({ date: today, complete: "none" });
          habitExists.dates = dates;
          // save the habit
          await habitExists.save();

          req.flash("success", `Habit added for the date - ${today}`);
          return res.redirect("back");
        }
      });
    } else {
      // Else - Habit is not present, then Add it
      let dates = [];
      let today = new Date(Date.now()).toJSON().slice(0, 10);

      // Push today's date into dates array, with status as unmarked/none
      dates.push({ date: today, complete: "none" });

      // Create the habit
      const newHabit = Habit.create({
        content,
        user: LoggedInUserId,

        dates,
      });

      req.flash("success", "Habit added successfully");
      return res.redirect("back");
    }
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong !");
    return res.redirect("back");
  }
};

// Controller to handle remove habits
module.exports.removeHabit = async (req, res) => {
  try {
    // To remove the Item from the list
    const { id: habitId } = req.query;

    const deletedItem = await Habit.deleteOne({
      _id: habitId,
    });

    req.flash("success", "Habit Deleted Successfully");
    return res.redirect("back");
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong !");
    return res.redirect("back");
  }
};

// Controller to handle add/remove to/from favorites
module.exports.addRemoveFavorite = async (req, res) => {
  try {
    const { id: habitId } = req.query;

    // Find the habit
    const habit = await Habit.findOne({ _id: habitId });

    // Habit is present, then add/remove it to/from the fav list
    // Toggling the favorite option
    habit.favorite = !habit.favorite;
    await habit.save();

    let notification = habit.favorite
      ? "Habit added to favorites"
      : "Habit removed from Favorites";

    req.flash("success", notification);

    return res.redirect("back");
  } catch (error) {
    console.log(error);
    req.flash("error", "Something Went Wrong !!");
    return res.redirect("back");
  }
};

//  Controller to handle update the status of the habit , toggling the status from completed -> incomplete -> Unmarked
module.exports.updateStatus = async (req, res) => {
  // To update the status of the habit
  const { id, date } = req.query;

  // Find the habit
  const habit = await Habit.findById(id);

  if (!habit) {
    req.flash("error", "something went wrong");
    return res.redirect("back");
  }

  // Update the status
  let dates = habit.dates;
  let found = false;

  dates.find((item) => {
    // find the data for the provided date
    if (item.date === date) {
      // Toggle the status
      const status =
        item.complete === "yes"
          ? "no"
          : item.complete === "no"
          ? "none"
          : "yes";

      item.complete = status;
      found = true;
    }
  });

  /* This is to handle the weekly view for today and previous 6 days, where if the record is not present for any of the previous 6 days, 
  then while trying to update the status , we are inserting the record */
  if (!found) {
    dates.push({ date, complete: "yes" });
  }

  habit.dates = dates;
  await habit.save();

  console.log(req.query, habit);
  return res.redirect("back");
};

module.exports.toggleView = async (req, res) => {
  // To toggle daily and weekly view
  try {
    // Find the user
    const user = await User.findOne({ email: loggedInUserEmail });

    // toggle the view
    user.viewType = user.viewType === "daily" ? "weekly" : "daily";

    await user.save();

    return res.redirect("back");
  } catch (error) {
    console.log(error);
    req.flash("error", "Something went wrong, Please check with IT team");
    return res.redirect("back");
  }
};
