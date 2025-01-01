const User = require("../models/user");

// render the sign up page
module.exports.signUp = function (req, res) {
  return res.render("user_sign_up", {
    title: "Habit Tracker | Sign Up",
  });
};

// render the sign in page
module.exports.signIn = function (req, res) {
  return res.render("user_sign_in", {
    title: "Habit Tracker | Sign In",
  });
};

// get the sign up data and create an user
module.exports.create = async function (req, res) {
  try {
    // #region Validation
    // Validate if both the entered password matches or not
    if (req.body.password != req.body.confirm_password) {
      req.flash("error", "Passwords do not match");
      return res.redirect("back");
    }

    const userExists = await User.findOne({ email: req.body.email });

    // If email already exists
    if (userExists) {
      req.flash("error", "Email already exists, Please SignIn to continue");
      return res.redirect("back");
    }

    // Create an user, if all the above validation pass
    const user = User.create({
      email: req.body.email,
      name: req.body.name,
      password: req.body.password,
    });

    req.flash("success", "You have signed up, login to continue!");
    return res.redirect("/users/sign-in");
  } catch (err) {
    console.log(err);
    req.flash("error", err);
    return res.redirect("back");
  }
};

// sign in and create a session for the user
module.exports.createSession = async function (req, res) {
  try {
    const { password, email } = req.body;
    const user = await User.findOne({ email, password });

    // if either of the email/password is wrong
    if (!user) {
      req.flash("error", "Invalid Email/Password");
      return res.redirect("back");
    }

    // redirect to dashboard page
    req.flash("success", "Logged in Successfully");
    return res.redirect(`/dashboard?user=${user._id}`);

  } catch (error) {
    req.flash("error", "Something went wrong !");
    return res.redirect("back");
  }
};

// to handle logout of a user
module.exports.logOut = (req, res) => {
  req.flash("success", "Logged Out.");
  res.redirect("/users/sign-in");
};
