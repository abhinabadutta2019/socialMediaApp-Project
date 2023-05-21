const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const router = express.Router();
const { hashPass } = require("../helper/utils");
///////////////////////////////////////////////
//jwt.verify--middleware
//
const verifyLoggedInUser = async (req, res, next) => {
  //
  // console.log("1");
  //
  try {
    let token;
    //checking if token provided or not
    if (req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
    } else if (!token) {
      next("No token provided");
    }

    //

    //jwt.verify verify gives id
    let decoded;
    try {
      decoded = jwt.verify(token, `${process.env.JWT_SECRET}`);
      // console.log(decoded, "decoded");
    } catch (err) {
      next(err.message);
    }

    let userDetail;

    userDetail = await User.findById({ _id: decoded });
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

//////////////////////////////////////////////
//--/user
//create / register- user
router.post("/register", async (req, res) => {
  try {
    //comming from helper/utils/hashPass function
    let hashedPassword = await hashPass(req.body.password);

    const newUser = new User({
      username: req.body.username,
      password: hashedPassword,
    });
    //this works
    const user = await newUser.save();

    res.json({ user: user });
    // res.send();
  } catch (err) {
    console.log(err);
    res.json({ err: err });
  }
});
/////////////////////////////////////////////
//login route ( it is to check password and genarate token)
router.post("/login", async (req, res) => {
  try {
    const inputUsername = req.body.username;
    let inputPassword = req.body.password;
    let stringPassword = inputPassword.toString(); //password converted to string
    //
    const user = await User.findOne({ username: inputUsername });
    if (!user) {
      return res.json({ message: "username not found" });
      //
    } else {
      // console.log(user);
      // console.log(stringPassword, "stringPassword");
      const hashedPassword = user.password;

      //bcrypt-used for password hashing
      const match = await bcrypt.compare(stringPassword, hashedPassword);

      // checking if password is correct
      if (!match) {
        return res.json({ message: "passsword not matched" });
      } else {
        //jwt.sign()
        let payload = user.id;
        // const token = jwt.sign(payload, "secret");
        const token = jwt.sign(payload, `${process.env.JWT_SECRET}`);
        // console.log(token, "token");

        res.json({ user: user, token: token }); //sending token from here
      }
    }
  } catch (err) {
    console.log(err);
    res.json({ err: err });
  }
});
//
//update user with user id
//$2a$10$F/MmgZ0O6HvWlOqVnS8NfuQaaFLtQU8qZBOJcn10A9PRGTZyQ4ngq
router.post("/update", verifyLoggedInUser, async (req, res) => {
  try {
    let user = req.userDetail;
    //

    console.log(user, "user at first");
    let newUserObj = { ...user._doc };
    //this was working
    // let newUserObj = user.toObject();
    //
    // console.log(newUserObj, "newUserObj");
    //

    //
    console.log(req.body, "req.body");
    newUserObj = req.body;

    console.log(newUserObj, "newUserObj 1.5");

    if (req.body.password) {
      const hashedPassword = await hashPass(req.body.password);
      newUserObj.password = hashedPassword;
      console.log(newUserObj.password, "newUserObj.password");
    }
    //update whole req.body
    //this was working
    user = await User.findByIdAndUpdate(
      user.id,
      { $set: newUserObj },
      { new: true }
    );
    console.log(newUserObj, "newUserObj 2");
    // console.log(user, "user");

    res.json({ user });
  } catch (err) {
    console.log(err);
    res.json({ err: err });
  }
});

//verify token
router.get("/verifyToken", verifyLoggedInUser, async (req, res) => {
  try {
    const user = req.userDetail; //req.userDetail--getting from middleware
    //
    console.log(user.id, `getting from routeName :${req.url}`);

    res.send(user);
  } catch (e) {
    console.log(e);
    res.send(e);
  }
});

//--/user
//follow a user
router.put("/follow/:id", verifyLoggedInUser, async (req, res) => {
  // console.log(req.userDetail.id);

  let currentUser;
  //

  if (req.userDetail) {
    currentUser = req.userDetail;
    //
    // console.log(currentUser.id, "currentUser.id");
  }

  try {
    //cant follow same
    if (req.params.id == currentUser.id) {
      return res.send({ message: "can't follow itself" });
    }

    //
    //

    //check if params object id is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.send({ message: "req.params.id - not a valid ObjectId" });
    }
    const followingUser = await User.findById(req.params.id);

    // console.log(countPresence);
    if (followingUser == null) {
      return res.send({
        message: "req.params.id (followingUser) not found in database",
      });
    } else {
      //if present in follower array
      if (!currentUser.followings.includes(followingUser.id)) {
        await followingUser.updateOne({ $push: { followers: currentUser.id } });
        await currentUser.updateOne({
          $push: { followings: followingUser.id },
        });
        return res.send({ message: "follow successful" });
      } else {
        res.send({ message: "Already following" });
      }

      res.send();
    }
  } catch (e) {
    res.send(e);
  }
});
//follow a user
router.put("/unfollow/:id", verifyLoggedInUser, async (req, res) => {
  try {
    //
    let currentUser;
    //verifyJwt authentication middleware
    if (req.userDetail) {
      //currentUser is the user logged in
      currentUser = req.userDetail;
    }
    //
    //check if params object id is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.send({ message: "req.params.id - not a valid ObjectId" });
    }
    //
    const followingUser = await User.findById(req.params.id);
    // currentUser = await User.findById(req.body.userId);

    if (req.params.id == currentUser.id) {
      return res.send({ message: "can't follow itself" });
    }

    //
    if (!followingUser) {
      return res.send({
        message: " followingUser(req.params.id) id not found in database",
      });
    }
    //if followingUser Id (req.params.id) - present in  currentUser.followings
    if (currentUser.followings.includes(followingUser.id)) {
      // console.log(followingUser.id, "followingUser.id");
      // console.log(currentUser.id, "currentUser.id");
      await currentUser.updateOne({ $pull: { followings: followingUser.id } });
      await followingUser.updateOne({ $pull: { followers: currentUser.id } });
      //
      return res.send({ message: "unfollow successful" });
    }

    //
    else {
      return res.send({ message: "Not following this user" });
    }
  } catch (e) {
    res.send(e);
  }
});

//delete user if authenticated
router.delete("/authDelete", verifyLoggedInUser, async (req, res) => {
  try {
    //from middleware
    // req.userDetail
    //
    await User.findByIdAndDelete(req.userDetail.id);
    res.send({ message: `deleted` });
  } catch (e) {
    console.log(e);
    res.send(e);
  }
});

//delete user
router.delete("/delete/:id", async (req, res) => {
  let user = await User.findById(req.params.id);

  console.log(req.params.id, "req.params.id");

  if (!user) {
    return res.send({ message: "user not present in database" });
  }

  // else{}

  try {
    {
      await User.findByIdAndDelete(req.params.id);
      res.send({ message: `deleted  ` });
    }
  } catch (e) {
    res.send(e);
  }
});
//
//etar jonno error aschilo
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
module.exports = router;
