const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/userModel");

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
  } catch (e) {
    console.log(e);
    res.send(e);
  }
};

module.exports = {
  hashPass,
  deleteFromUserArray,
};
