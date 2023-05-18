const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const router = express.Router();

///////////////////////////////////////////////
//jwt.verify--middleware
//
const verifyJwt = async (req, res, next) => {
  //bearer token theke- token part - split
  const token = req.headers.authorization.split(" ")[1];
  //
  try {
    //jwt.verify verify gives id
    let decoded;
    try {
      decoded = jwt.verify(token, `${process.env.JWT_SECRET}`);
      // console.log(decoded, "decoded");
    } catch (e) {
      return res.status(401).send("Invalid Token");
    }

    // if (!decoded) {
    //   return req.send(`token secret not correct or Invalid token`);
    // }
    // decoded = "64650010343898cc7e6ff601"; //hard coding userid to test error
    //
    // console.log(decoded, "decoded");
    //
    let userDetail;

    userDetail = await User.findById({ _id: decoded });
    // console.log(userDetail, "userDetail");
    if (!userDetail) {
      return res.send("User not found in database");
      // next(userDetail); //??( ekhane next use kore-- error pass kora ki possible?)
    }
    //exporting from middleware to access from route
    req.userDetail = userDetail; //routes are acessing this variable

    next();
  } catch (e) {
    return res.send(`Invalid Token from verifyJwt-middleware`);
    // next();
  }
};

////////////////////////////////////////////
//taking passsword from route and converting to hashed password

const hashBcrypt = async (req, res, next) => {
  try {
    if (!req.body.password) {
      console.log("no passsword in req.body--from hashBcrypt middleware ");
      next();
    } else {
      let password = req.body.password;
      let stringPassword = password.toString();
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(stringPassword, saltRounds);
      //
      req.hashedPassword = hashedPassword;
      //
      if (hashedPassword) {
        console.log("middleware hashedPassword");
      }
      next();
    }
  } catch (e) {
    return res.send(`error from hashBcrypt middleware`);
  }
};

//////////////////////////////////////////////
//--/user
//create / register- user
router.post("/register", hashBcrypt, async (req, res) => {
  //req.hashedPassword from hashBcrypt middleware
  let hashedPassword = req.hashedPassword;

  const newUser = new User({
    username: req.body.username,
    password: hashedPassword,
  });
  // console.log(newUser.password);
  //
  try {
    const user = await newUser.save();
    res.send(user);
    // res.send();
  } catch (e) {
    //trying basic error handeling
    // console.log(`error.code-${e.code},Reason-Duplicate Username`);
    res.send(e);
  }
});
/////////////////////////////////////////////
//login route ( it is to check password and genarate token)
router.post("/login", async (req, res) => {
  const inputUsername = req.body.username;
  let inputPassword = req.body.password;
  let stringPassword = inputPassword.toString(); //password converted to string

  try {
    const user = await User.findOne({ username: inputUsername });
    // console.log(user);
    // console.log(stringPassword, "stringPassword");
    const hashedPassword = user.password;

    //bcrypt-used for password hashing
    const match = await bcrypt.compare(stringPassword, hashedPassword);

    // checking if password is correct
    if (!match) {
      return res.send({ message: "passsword not matched" });
    } else {
      //jwt.sign()
      let payload = user.id;
      // const token = jwt.sign(payload, "secret");
      const token = jwt.sign(payload, `${process.env.JWT_SECRET}`);
      // console.log(token, "token");

      res.send({ user: user, token: token }); //sending token from here
    }
  } catch (e) {
    console.log(e);
    res.send(e);
  }
});
//
//update user with user id
router.post("/update", verifyJwt, hashBcrypt, async (req, res) => {
  try {
    //getting from id---thiw was working-- for this --"/update/:id"-- when sending id with url
    // let user = await User.findById(req.params.id);

    //try token middleware theke

    let user = req.userDetail;
    if (!user) {
      return res.send(
        `verifyJwt middleware - not passing user routeName ${req.url}`
      );
    } else {
      // console.log(`verifyJwt middleware working from ${req.url}`);

      //if req.body contains password
      if (req.body.password) {
        //middleware hash password
        let hashedPassword = req.hashedPassword;
        // console.log(`hashBcrypt middleware from routeName ${req.url}`);

        // //
        let updatePassword = await user.updateOne({
          $set: { password: hashedPassword },
        });
        console.log(`password updated from routeName ${req.url}`);
      }
      //////////
      //update username
      if (req.body.username) {
        // console.log(req.body.username, "req.body.username");
        let updatedUsername = await user.updateOne({
          $set: { username: req.body.username },
        });
        console.log(`username updated from routeName ${req.url}`);
      }

      console.log(req.body, "req.body");

      res.send(user);
    }
  } catch (e) {
    console.log(e);
    res.send(e);
  }
});

//verify token
router.get("/verifyToken", verifyJwt, async (req, res) => {
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
