const mongoose = require("mongoose");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const potmanLoginMiddleware = async (req, res, next) => {
  try {
    // console.log(req.headers.authorization, "req.headers.authorization");
    //this next() --works on- res.json() - if no token provided-- echarao token na thakle - console e - error dei

    //token na dile tar error
    // if (!req.cookies.jwt) {
    //   next("No token provided");
    // }

    // //get token -- for browser
    // const token = req.cookies.jwt;

    //ekhane browser + postman dutor j kono ekta jate paoa jai
    // const token = req.cookies.jwt || req.headers.authorization.split(" ")[1];

    if (!req.headers.authorization) {
      next("No token provided");
    }

    // get token -- for postman
    const token = req.headers.authorization.split(" ")[1];

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
    req.userDetail = userDetail; //routes are acessing this variable

    next();
  } catch (err) {
    console.log(err);
    next(err);
  }
};

//
module.exports = { potmanLoginMiddleware };
