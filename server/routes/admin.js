const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const adminLayout = "../views/layouts/admin";

const jwtSecret = process.env.JWT_SECRET;
// Admin login page
router.get("/admin", async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "First Blog about Nodejs",
    };

    res.render("admin/index", { locals, layout: adminLayout });
  } catch (error) {
    console.log(error);
  }
});

// chceck login
const authMiddleWare = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (Error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// Admin login
// Testing purposes
// router.post('/admin', async (req, res) => {
//   try {
//     const { username, password} = req.body;

//     if(req.body.username ==='admin' && req.body.password === 'password')
//       {
//     res.send('Logged in')
//   }
// else{
//   res.send("JA be ")
// }}
//   catch(error){
//       console.log(error);
//   }
// });

router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

// Dashboard Route
router.get("/dashboard", authMiddleWare, async (req, res) => {
  try {
    res.render("admin/dashboard");
  } catch (Error) {}
});

// adMIN RESGITER
router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const user = await User.create({ username, password: hashedPassword });
      res.status(201).json({ message: "USer Created", User });
    } catch (error) {
      if (error.code === 11000) {
        res.status(409).json({ message: "User already in use" });
      }
    }
    res.status(500).json({ message: "Internal Server Error" });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
