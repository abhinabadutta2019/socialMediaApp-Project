const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const router = express.Router();

//--/user
//create / register- user
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    password: req.body.password,
  });
  //
  try {
    const user = await newUser.save();
    res.send(user);
  } catch (e) {
    //trying basic error handeling
    console.log(`error.code-${e.code},Reason-Duplicate Username`);
    res.send(e);
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
//--/user
//follow a user
router.put("/follow/:id", async (req, res) => {
  try {
    //
    const followingUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.body.userId);

    //currentUser er id- collection e thakte hobe
    if (currentUser !== null && req.params.id !== req.body.userId) {
      // console.log("currentUser present");
      // }

      ////////////////////////////////////////////////////////////////////////////////
      //This logic used in unfollow route
      // if (!currentUser.followings.includes(followingUser.id)) {
      //   // console.log(followingUser.id, "followingUser.id");
      //   // console.log(currentUser.id, "currentUser.id");
      //   await currentUser.updateOne({ $push: { followings: followingUser.id } });
      //   await followingUser.updateOne({ $push: { followers: currentUser.id } });
      //   //
      //   res.send(followingUser);
      // } else {
      //   res.send({ message: "Already following" });
      // }
      // console.log(currentUser);
      /////////////////////////////////////////////////////////////////////////////

      //loop to check if (would-be-follower) id present in the array
      let countPresence = 0;
      for (let i = 0; i < followingUser.followers.length; i++) {
        const follower = followingUser.followers[i];
        //
        if (req.body.userId == follower) {
          countPresence = countPresence + 1;
        }
      }
      // console.log(countPresence);
      //if not present in follower array
      if (countPresence == 0) {
        //
        await followingUser.updateOne({ $push: { followers: currentUser.id } });
        await currentUser.updateOne({
          $push: { followings: followingUser.id },
        });
        res.send({ message: "follow successful" });
      }
      //if present in follower array
      else if (countPresence > 0) {
        res.send({ message: "Already following" });
      }
      //////////////////////////////////////////////////////////////////
      res.send();
    }
    //if null
    else if (currentUser == null) {
      res.send({ message: "Not found" });
    }
    //if two ids same
    else if (req.params.id == req.body.userId) {
      res.send({ message: "can't follow itself" });
    }
  } catch (e) {
    res.send(e);
  }
});
//follow a user
router.put("/unfollow/:id", async (req, res) => {
  try {
    //
    const followingUser = await User.findById(req.params.id);
    const currentUser = await User.findById(req.body.userId);
    //
    if (currentUser.followings.includes(followingUser.id)) {
      // console.log(followingUser.id, "followingUser.id");
      // console.log(currentUser.id, "currentUser.id");
      await currentUser.updateOne({ $pull: { followings: followingUser.id } });
      await followingUser.updateOne({ $pull: { followers: currentUser.id } });
      //
      res.send(followingUser);
    }

    //
    else {
      res.send({ message: "Not following this user" });
    }
  } catch (e) {
    res.send(e);
  }
});
//
module.exports = router;
