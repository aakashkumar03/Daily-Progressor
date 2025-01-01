const express = require("express");
const app = express();
const env = require("dotenv");
env.config();
const port = 3000; // Each services are recognized by a PORT number

// to implement ejs layout
const expressLayouts = require("express-ejs-layouts");
const connectDB = require("./config/mongoose");



// to implement flash middleware for notifications
const flash = require("connect-flash");
const customMware = require("./config/flash-middleware");

//middleware used to parse the data coming from the ejs form
app.use(express.urlencoded({ extended: true }));
connectDB()

//adding static files
app.use(express.static("./assets"));
app.use(expressLayouts);

// extract style and scripts from sub pages into the layout
app.set("layout extractStyles", true);
app.set("layout extractScripts", true);


//Express Session
const session = require("express-session");
app.use(
    session({
      secret: "secret",
      resave: true,
      saveUninitialized: true,
    })
  );


// setting up flash middleware
app.use(flash());
app.use(customMware.setFlash);

// use express router
app.use("/", require("./routes"));

// set up the view engine
app.set("view engine", "ejs");
app.set("views", "./views");

// running express server
app.listen(port, function (err) {
  if (err) {
    console.log(`Error in running the server: ${err}`);
  }

  console.log(`Server is running on port: ${port}`);
});
