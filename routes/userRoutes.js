const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const router = express.Router();

//
//create / regester- user
router.post("/regester", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    password: req.body.password,
  });
  //
  try {
    const user = await newUser.save();
    res.send(user);
  } catch (e) {
    console.log(e);
  }
});
// get one user by id
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.send(user);
  } catch (e) {
    res.send(e);
  }
});
//

//
module.exports = router;
