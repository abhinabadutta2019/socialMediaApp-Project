// const mongoose = require("mongoose");
// const User = require("../models/userModel");
// const jwt = require("jsonwebtoken");

//
const verifyAdmin = async (req, res, next) => {
  try {
    const user = req.userDetail;

    if (!user.isAdmin === true) {
      next("User is not an admin");
    }
    //
    req.adminUser = user; //routes are acessing this variable

    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports = { verifyAdmin };
