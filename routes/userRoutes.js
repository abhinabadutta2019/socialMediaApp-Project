const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const router = express.Router();
const { verifyLoggedInUser } = require("../middleware/verifyLoggedInUser"); //login middleware
const { verifyAdmin } = require("../middleware/verifyAdmin");
const { hashPass } = require("../helper/utils");
///////////////////////////////////////////////
// {
//   "username": "vijay",
//   "password": 124,

// }
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
      isAdmin: req.body.isAdmin,
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
//
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

  try {
    let currentUser = req.userDetail;
    //to test
    // console.log(currentUser.id, "currentUser.id");
    // console.log(currentUser._id.toString(), "currentUser._id.toString()");

    //check if params object id is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.json({ message: "req.params.id - not a valid ObjectId" });
    }

    //cant follow same
    if (req.params.id == currentUser._id.toString()) {
      return res.json({ message: "can't follow itself" });
    }
    //finding jei user k follow korte chai
    const followingUser = await User.findById(req.params.id);

    //if (followingUser==null)
    if (!followingUser) {
      return res.json({
        message: "req.params.id (followingUser) not found in database",
      });
    }
    //
    // console.log(followingUser.id, "followingUser.id");
    // console.log(followingUser._id.toString(), "followingUser._id.toString()");
    //if not present in follower array
    if (currentUser.followings.includes(followingUser._id.toString())) {
      return res.json({ message: "Already following" });
    }
    //eta genarel ( else block)- koyekta if(!) logic baad diye eta tei asbe
    await followingUser.updateOne({
      $push: { followers: currentUser._id.toString() },
    });
    await currentUser.updateOne({
      $push: { followings: followingUser._id.toString() },
    });
    return res.json({ message: "follow successful" });
  } catch (err) {
    console.log(err);
    res.json({
      err: err,
    });
  }
});
//follow a user
router.put("/unfollow/:id", verifyLoggedInUser, async (req, res) => {
  try {
    //
    let currentUser = req.userDetail;

    //check if params object id is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.json({ message: "req.params.id - not a valid ObjectId" });
    }

    if (req.params.id == currentUser._id.toString()) {
      return res.json({ message: "can't follow itself" });
    }
    //
    const followingUser = await User.findById(req.params.id);
    // currentUser = await User.findById(req.body.userId);

    //if (followingUser==null)
    if (!followingUser) {
      return res.json({
        message: " followingUser(req.params.id) id not found in database",
      });
    }
    //if followingUser Id (req.params.id) - present in  currentUser.followings
    if (!currentUser.followings.includes(followingUser.id)) {
      return res.json({ message: "Not following this user" });
    }
    // console.log(followingUser.id, "followingUser.id");
    // console.log(followingUser._id.toString(), "followingUser._id.toString()");
    // console.log(currentUser.id, "currentUser.id");

    //

    //eta genarel ( else block)- koyekta if(!) logic baad diye eta tei asbe
    await currentUser.updateOne({
      $pull: { followings: followingUser._id.toString() },
    });
    await followingUser.updateOne({
      $pull: { followers: currentUser._id.toString() },
    });
    //
    return res.json({ message: "unfollow successful" });
  } catch (err) {
    console.log(err);
    res.json({ err: err });
  }
});

//delete user if authenticated/ or user logged in
router.delete("/authDelete", verifyLoggedInUser, async (req, res) => {
  try {
    //from middleware
    // req.userDetail
    //
    await User.findByIdAndDelete(req.userDetail.id);
    res.json({ message: `deleted` });
  } catch (err) {
    console.log(err);
    res.json({ err: err });
  }
});

//delete as admin
router.get("/adminDelete", verifyLoggedInUser, async (req, res) => {
  //
  try {
    //ei part ta login token theke asbe (req.userDetail)
    const user = req.userDetail;

    //
    if (!user.isAdmin == true) {
      // console.log(req.body.id);
      return res.json({
        message: "only admin can use this route to delete other user",
      });
    }

    //check if valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.body.id)) {
      return res.json({ message: "req.body.id - not a valid ObjectId" });
    }

    const bodyUser = await User.findById(req.body.id);
    //
    if (!bodyUser) {
      return res.json({ message: "req.body.id not present in database" });
    }

    //deleted user
    const deletedUser = await User.findByIdAndDelete(req.body.id);

    //deleted by--custom keys
    const { _id, password, ...others } = user._doc;
    // console.log({ deletedBy: others, user: user });

    res.json({ deletedBy: others, deletedUser });
  } catch (err) {
    res.json({ err });
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
