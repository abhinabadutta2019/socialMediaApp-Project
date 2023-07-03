const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const Post = require("../models/postModel");
//
let hashPass = async (passString) => {
  try {
    let stringPassword = passString.toString();
    let saltRounds = 10;
    let hashedPassword = await bcrypt.hash(stringPassword, saltRounds);
    if (!hashedPassword) {
      throw new Error("Password not hashed");
    }
    console.log(hashedPassword, "hashedPassword from hashPass");
    return hashedPassword;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

//used in /authDelete route
//used to delete - 'deleteUserid', from all users followers array and followings array-
const deleteFromUserArray = async function (deleteUserid) {
  try {
    //
    //from this--
    const allUsers = await User.find({});
    //
    for (let index = 0; index < allUsers.length; index++) {
      const oneUser = allUsers[index];

      //delete from any users follower array
      if (oneUser.followers.includes(deleteUserid)) {
        //
        await oneUser.updateOne({
          $pull: { followers: deleteUserid },
        });
      }

      //delete from any users following array
      if (oneUser.followings.includes(deleteUserid)) {
        //
        await oneUser.updateOne({
          $pull: { followings: deleteUserid },
        });
      }
    }

    //
    // Delete user's posts
    await Post.deleteMany({ userId: deleteUserid });
    //........................
    //delete user._id from all the post.likes array -
    const allPosts = await Post.find({});
    //

    for (let j = 0; j < allPosts.length; j++) {
      const onePost = allPosts[j];
      //if likes-array has - - deleteUserid
      if (onePost.likes.includes(deleteUserid)) {
        await onePost.updateOne({
          $pull: { likes: deleteUserid },
        });
        // console.log("Hi");
      }
    }
  } catch (e) {
    console.log(e);
    res.send(e);
  }
};

//cookie/ token -related

module.exports = {
  hashPass,
  deleteFromUserArray,
};
