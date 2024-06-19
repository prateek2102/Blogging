require("dotenv").config();

const express = require("express");
const expressLayout = require("express-ejs-layouts");
const methodOverride = require('method-override')
const cookieParser = require("cookie-parser");
const MongoStore = require("connect-mongo");
const session = require("express-session"); // Add this line to import express-session

const connectDB = require("./server/config/db");
const app = express();

const PORT = 3000 || process.env.PORT;

//Connecting DB

connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
    }),
  })
);

const path = require("path");

// Set the views directory
app.set("views", path.join(__dirname, "views"));
//Middleware Templating engine
app.use(expressLayout);
app.set("layout", "./layouts/main");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.static("views"));
app.use(methodOverride('_method'))

app.use("/", require("./server/routes/main"));
app.use("/", require("./server/routes/admin"));

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
