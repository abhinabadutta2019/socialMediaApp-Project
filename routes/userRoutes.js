const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const router = express.Router();
const { verifyLoggedInUser } = require("../middleware/verifyLoggedInUser"); //login middleware
// const { verifyAdmin } = require("../middleware/verifyAdmin");//admin login middleware
const {
  postmanLoginMiddleware,
} = require("../middleware/postmanLoginMiddleware");
const { hashPass, deleteFromUserArray } = require("../helper/utils");

//
const path = require("path");
//
const s3 = require("../helper/s3");

// Import the Image model
const Image = require("../models/imageModel");
const upload = require("../middleware/multer");
// Import the upload middleware from app.js
// const upload = require("../app");

///////////////////////////////////////////////
//--/user

//
router.get("/upload", (req, res) => {
  try {
    res.render("upload");
  } catch (err) {
    res.json(err);
  }
});
//
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const imagePath = `/images/${req.file.filename}`;
    const newImage = new Image({
      imagePath: imagePath,
    });
    const image = await newImage.save();
    console.log(image, "image, from /upload (post) route");
    res.send({ image: image });
  } catch (err) {
    res.json(err);
  }
});
//
router.get("/showImage/:id", async (req, res) => {
  try {
    console.log(req.url, "req.url");
    const oneImage = await Image.findById(req.params.id);
    res.render("showImage", { imagePath: oneImage.imagePath });
  } catch (err) {
    res.json(err);
  }
});

//frontend - updateProfileImage
router.get("/updateProfileImage", verifyLoggedInUser, (req, res) => {
  try {
    res.render("updateProfileImage");
  } catch (err) {
    res.json(err);
  }
});

//../updateProfileImage
router.post(
  "/updateProfileImage",
  verifyLoggedInUser,
  upload.single("image"),
  async (req, res) => {
    try {
      // console.log();
      const user = req.userDetail;

      const oldUser = { ...user };
      // console.log(oldUser._doc.imagePath, "oldUser");
      const oldImagePath = oldUser._doc.imagePath;
      //
      if (req.file) {
        // const imagePath = `/images/${req.file.filename}`;
        // user.imagePath = imagePath;
        const uploadedFileUrl = await s3.uploadFileToS3(req.file);
        user.imagePath = uploadedFileUrl;

        //
        console.log(uploadedFileUrl, "^^uploadedFileUrl");
      }

      //
      // Update the imagePath in the user document
      // user.imagePath = imagePath;
      await user.save();
      // console.log(user);
      const updatedImagePath = user.imagePath;

      res.json({
        updatedImagePath: updatedImagePath,
        oldImagePath: oldImagePath,
      });
    } catch (err) {
      console.log(err);
      res.json(err);
    }
  }
);

//frontend routes
router.get("/register", async (req, res) => {
  try {
    res.render("register");
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

//login page for frontend
router.get("/login", async (req, res) => {
  try {
    res.render("login");
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

//logging out
router.get("/logout", async (req, res) => {
  try {
    //just a paylode - that would get deleted
    let payload = "deleteJwt";
    //
    const token = jwt.sign(payload, `${process.env.JWT_SECRET}`);
    //to delete the token from browser
    res.cookie("jwt", token, {
      maxAge: 1,
    });

    //this to redirect
    res.json({ message: "logout success" });
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

//login (post) fire hole
router.get("/personalDetails", verifyLoggedInUser, async (req, res) => {
  try {
    console.log("from /personalDetails route");
    //from middleware
    const user = req.userDetail;

    res.render("personalDetails", { user: user });
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

//
router.get("/allUsers", verifyLoggedInUser, async (req, res) => {
  try {
    //from middleware
    const user = req.userDetail;

    // console.log(user._id.toString(), "user._id.toString()");

    //get all user
    const eachUser = await User.find({});

    let allUsers = [];
    //loggeged in user out of the list
    for (let index = 0; index < eachUser.length; index++) {
      const oneUser = eachUser[index];
      // console.log(oneUser, "oneUser");
      if (oneUser._id.toString() !== user._id.toString()) {
        //
        // console.log(oneUser._id.toString(), "oneUser._id.toString()");

        allUsers.push(oneUser);
      }
    }

    //now sort all user
    allUsers.sort(function (a, b) {
      const random = 0.5 - Math.random();
      if (random < 0) {
        return -1;
      } else if (random > 0) {
        return 1;
      } else {
        return 0;
      }
    });

    //just 2 would be shown
    if (allUsers.length > 2) {
      allUsers = allUsers.slice(0, 2);
    }

    // res.json(allUsers);
    res.render("allUsers", { allUsers: allUsers });
  } catch (err) {
    res.json(err);
  }
});

//--/user
//create / register- user
router.post("/register", upload.single("image"), async (req, res) => {
  try {
    //
    if (req.body.username.length < 3 || req.body.password.length < 3) {
      return res.json({ message: "username or password is too small" });
    }

    //if no image
    let imagePath = null;

    if (req.file) {
      // If an image is uploaded, save AWS/s3 url
      const uploadedFileUrl = await s3.uploadFileToS3(req.file);
      imagePath = uploadedFileUrl;

      //
      console.log(uploadedFileUrl, "uploadedFileUrl");
    }

    //comming from helper/utils/hashPass function
    const hashedPassword = await hashPass(req.body.password);

    const newUser = new User({
      username: req.body.username,
      password: hashedPassword,
      // isAdmin: req.body.isAdmin,
      //
      imagePath: imagePath,
    });

    //this works
    const user = await newUser.save();

    //creating token

    const payload = user._id.toString();

    // const token = jwt.sign(payload, "secret");
    const token = jwt.sign(payload, `${process.env.JWT_SECRET}`);

    res.cookie("jwt", token);
    //

    res.json({ message: "user created" });
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
    const inputPassword = req.body.password;
    const stringPassword = inputPassword.toString(); //password converted to string
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
        //
        res.cookie("jwt", token);
        //
        console.log(token, "token");

        //trying redirect from here
        // res.render("personalDetails", { user: user });
        res.json({ message: "login success" });
      }
    }
  } catch (err) {
    console.log(err);
    res.json({ err: err });
  }
});
//
//update user with login token
router.post("/updatePassword", verifyLoggedInUser, async (req, res) => {
  try {
    //
    let user = req.userDetail;
    // console.log(user, "user at first");
    const newUserObj = { ...user._doc };

    if (req.body.password.length < 3) {
      return res.send({ message: "password is too small" });
    }

    //hashPass-my written middleware
    const hashedPassword = await hashPass(req.body.password);
    newUserObj.password = hashedPassword;
    // console.log(newUserObj.password, "newUserObj.password");

    //this was working
    let updatedUser = await User.findByIdAndUpdate(
      user.id,
      { $set: newUserObj },
      { new: false }
    );

    ///////////////////
    //just a paylode - that would get deleted
    let payload = "deleteJwt";
    //
    const token = jwt.sign(payload, `${process.env.JWT_SECRET}`);
    //to delete the token from browser
    res.cookie("jwt", token, {
      maxAge: 1,
    });

    // update successful hote-- trying to delete token and login again

    // console.log(newUserObj, "newUserObj- after update");
    res.json({ message: "password updated" });
  } catch (err) {
    console.log(err);
    res.json({ err: err });
  }
});

//update as admin
router.post("/adminUpdate", verifyLoggedInUser, async (req, res) => {
  try {
    const user = req.userDetail;
    //

    //check if admin
    if (!user.isAdmin == true) {
      return res.json({ message: "user is not an admin" });
    }
    //Body te thakbe jei id ke update korte chai

    //check if valid ObjectId ( )
    if (!mongoose.Types.ObjectId.isValid(req.body.id)) {
      return res.json({ message: "req.body.id - not a valid ObjectId" });
    }
    //
    const bodyUser = await User.findById(req.body.id);
    //
    if (!bodyUser) {
      return res.json({ message: "req.body.id not present in database" });
    }

    //
    const newUserObj = { ...bodyUser._doc };

    //
    if (req.body.username) {
      newUserObj.username = req.body.username;
    }

    //hashPass function- my created from helper/utlis
    if (req.body.password) {
      newUserObj.password = await hashPass(req.body.password);
    }

    //make other user admin
    //true/false set korte--"isAdmin": "true", "isAdmin": "false"--"string er moddhe pathate hobe"
    if (req.body.isAdmin) {
      newUserObj.isAdmin = req.body.isAdmin;
    }

    //
    const userUpdatedAs = await User.findByIdAndUpdate(
      bodyUser.id,
      { $set: newUserObj },
      { new: true }
    );

    res.json({ userUpdatedAs: userUpdatedAs, updatedBy: user });
  } catch (err) {
    console.log(err, "err");
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
    // console.log(req.params.id);
    //////
    const currentUser = req.userDetail;
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
    const currentUser = req.userDetail;

    //check if params object id is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.json({ message: "req.params.id - not a valid ObjectId" });
    }

    if (req.params.id == currentUser._id.toString()) {
      return res.json({ message: "can't unfollow itself" });
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
    //req.userDetail from middleware
    //deleteUserid to string
    const deleteUserid = req.userDetail._id.toString();
    //

    //this user is to delete
    const thisUserGetsDeleted = await User.findByIdAndDelete(deleteUserid);

    //used to delete - 'deleteUserid', from all users followers array and followings array
    //calling from helper/utlis
    deleteFromUserArray(deleteUserid);

    //just a paylode - that would get deleted
    let payload = "deleteJwt";
    //
    const token = jwt.sign(payload, `${process.env.JWT_SECRET}`);
    //to delete the token from browser
    res.cookie("jwt", token, {
      maxAge: 1,
    });

    // res.json({ thisUserGetsDeleted: thisUserGetsDeleted });
    return res.json({ message: "delete successful" });
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

    const deleteUserid = req.body.id;

    //check if valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(deleteUserid)) {
      return res.json({ message: "req.body.id - not a valid ObjectId" });
    }

    const bodyUser = await User.findById(deleteUserid);
    //
    if (!bodyUser) {
      return res.json({ message: "req.body.id not present in database" });
    }

    //deleted user
    const deletedUser = await User.findByIdAndDelete(deleteUserid);

    //deleted by--details of that admin who has deleted
    const { _id, password, ...others } = user._doc;

    // console.log({ deletedBy: others, user: user });

    //
    //used to delete - 'deleteUserid', from all users followers array and followings array
    //calling from helper/utlis
    deleteFromUserArray(deleteUserid);

    res.json({ deletedUser, deletedBy: others });
    // res.send();
  } catch (err) {
    res.json({ err });
  }
});

//
//all user page - theke - details e click korle - eta fire hobe
router.get("/getUser/:id", verifyLoggedInUser, async (req, res) => {
  try {
    console.log(req.params, "req.params");
    const user = await User.findById(req.params.id);
    // console.log(user, "user");

    //
    res.render("getUser", { user: user });
    // res.json({ user: user });
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

//aggregate lookup method used
router.get("/followingsList/:id", verifyLoggedInUser, async (req, res) => {
  //
  try {
    // console.log(req.params.id, "req.params.id");
    //from string to object id
    const createdId = new mongoose.Types.ObjectId(`${req.params.id}`);

    // console.log(typeof createdId, "createdId");
    // //

    //
    const userFollowings = await User.aggregate([
      //
      {
        $match: { _id: createdId },
      },

      {
        $lookup: {
          from: "users",
          localField: "followings",
          foreignField: "_id",
          as: "followings_info",
        },
      },
    ]);
    //
    // console.log(userFollowings[0].followings_info, "user");

    // for (
    //   let index = 0;
    //   index < userFollowings[0].followings_info.length;
    //   index++
    // ) {
    //   const element = userFollowings[0].followings_info[index];
    //   console.log(element, "element");
    // }

    // res.json(userFollowings);
    res.render("followingsDetails", { userFollowings: userFollowings });
  } catch (err) {
    //
    console.log(err);
    res.json({ err });
  }
});

//used populate method
router.get("/followersList/:id", verifyLoggedInUser, async (req, res) => {
  try {
    console.log(req.url);
    //
    //
    const user = await User.findById(req.params.id).populate("followers");

    // console.log(user.followers, "user.followers");
    //
    const followersList = user.followers;
    //
    res.render("followersDetails", { followersList: followersList });
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

///////////////////////////////////////////////
//etar jonno error aschilo
// get one user by id
// router.get("/:id", async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     res.send(user);
//   } catch (e) {
//     res.send(e);
//   }
// });
//
//
//user delete hole-- post er liked array thke -- sei user er id delete hoye jabe-- eta-- user er delete block e korte hobe
//delete user
// router.delete("/delete/:id", async (req, res) => {
//   let user = await User.findById(req.params.id);

//   console.log(req.params.id, "req.params.id");

//   if (!user) {
//     return res.send({ message: "user not present in database" });
//   }

//   // else{}

//   try {
//     {
//       await User.findByIdAndDelete(req.params.id);
//       res.send({ message: `deleted  ` });
//     }
//   } catch (e) {
//     res.send(e);
//   }
// });
//
//login success page route
// router.get("/loginSuccess", verifyLoggedInUser, async (req, res) => {
//   try {
//     res.render("loginSuccess");
//   } catch (err) {
//     console.log(err);
//     res.json(err);
//   }
// });
//
module.exports = router;
