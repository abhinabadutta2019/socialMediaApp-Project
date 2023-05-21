const mongoose = require("mongoose");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

//
const verifyAdmin = async (req, res, next) => {
  try {
    // console.log(req.headers.authorization, "req.headers.authorization");
    //this check not working - if no token provided
    if (!req.headers.authorization) {
      next("No token provided");
    }

    const token = req.headers.authorization.split(" ")[1];
    //

    //jwt.verify verify gives id
    let decoded;
    try {
      decoded = jwt.verify(token, `${process.env.JWT_SECRET}`);
      // console.log(decoded, "decoded");
    } catch (err) {
      next(err);
    }

    const userDetail = await User.findById({ _id: decoded });
    // console.log(userDetail, "userDetail");
    if (!userDetail) {
      next("User not found in database");
    }
    //exporting from middleware to access from route
    // req.userDetail = userDetail; //routes are acessing this variable

    //if admin
    if (!userDetail.isAdmin === true) {
      next("User is not an Admin");
    }
    //
    req.adminUser = userDetail;

    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports = { verifyAdmin };
