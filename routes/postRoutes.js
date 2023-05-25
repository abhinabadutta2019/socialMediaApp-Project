const express = require("express");
const mongoose = require("mongoose");
const Post = require("../models/postModel");
const router = express.Router();
const { verifyLoggedInUser } = require("../middleware/verifyLoggedInUser");
//----/post
//create a post
router.post("/create", verifyLoggedInUser, async (req, res) => {
  try {
    //user login (route) token required to create post
    // console.log(req.url, "req.url");
    //
    const user = req.userDetail;

    if (!user) {
      return res.json("User not logged in");
    }

    //create new post
    const newPost = new Post({
      userId: user._id.toString(),
      description: req.body.description,
    });
    //save to database
    const post = await newPost.save();

    res.json({ post });
    // res.send();
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

//update a post

router.put("/update/:id", verifyLoggedInUser, async (req, res) => {
  try {
    // console.log(req.params.id, "req.params");
    const user = req.userDetail;

    //

    //check if params object id is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.json({ message: "req.params.id - not a valid ObjectId" });
    }
    //
    const post = await Post.findById(req.params.id);
    //if post id not found in collection
    if (!post) {
      return res.json({ message: "req.params.id not found in database" });
    }

    // console.log(user.id, "user.id");
    // console.log(post.userId, "post.userId");

    //check if looged in user created this post
    if (user.id !== post.userId.toString()) {
      return res.json({
        message: "this user not created the post, so it can't be updated  ",
      });
    }

    //
    const copyPost = { ...post._doc };
    //

    if (!req.body.description) {
      return res.json({ message: "req.body.description is not defined " });
    }
    //updating the description
    copyPost.description = req.body.description;

    //updating in database
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $set: copyPost,
      },
      { new: true }
    );

    res.json({ updatedPost });
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

//delete a post
router.delete("/delete/:id", verifyLoggedInUser, async (req, res) => {
  try {
    // console.log(req.params.id);
    const user = req.userDetail;
    //
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.json({ message: "req.params.id - not a valid ObjectId" });
    }
    //
    const post = await Post.findById(req.params.id);
    //
    if (!post) {
      return res.json({
        message: "req.params.id not found in Post collection ",
      });
    }
    //if not User's post or user is not ADMIN
    if (post.userId.toString() !== user.id && user.isAdmin !== true) {
      // console.log(user.isAdmin == true);
      return res.json({
        message: "post (req.params.id) is not created by this user",
      });
    }
    //
    const deletedPost = await Post.findByIdAndDelete(post._id.toString());
    // console.log(deletedPost._id);

    res.json({ deletedPost: deletedPost, deletedBy: user });
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

//like a post
router.put("/like/:id", verifyLoggedInUser, async (req, res) => {
  try {
    const user = req.userDetail;
    // console.log(req.params);
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.json({ message: "req.params.id - not a valid ObjectId" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.json({
        message: " req.params.id not found in post collection",
      });
    }
    //
    if (user._id.toString() == post.userId.toString()) {
      return res.json({ message: "User cant like own Post" });
      // console.log(user._id.toString(), "user._id.toString()");
      // console.log(post.userId.toString(), "post.userId.toString()");
    }
    //
    // console.log(post.likes, "Array - post.likes");

    //jodi thake Un-Like
    if (post.likes.includes(user._id.toString())) {
      await post.updateOne({
        $pull: { likes: user._id.toString() },
      });

      return res.json({ message: "un-liked" });
    }

    //for  Like in general block
    await post.updateOne({
      $push: { likes: user._id.toString() },
    });

    res.json({ message: "Liked", post: post });
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

//user delete hole-- post er liked array thke -- sei user er id delete hoye jabe-- eta-- user er delete block e korte hobe

//timeline
router.get("/timeline/all", verifyLoggedInUser, async (req, res) => {
  try {
    const user = req.userDetail;
    //
    const newUser = { ...user._doc };
    // console.log(newUser);
    const { _id, password, __v, ...visiblePart } = newUser;
    // console.log(visiblePart);

    //user's own post
    const userPosts = await Post.find({ userId: user._id.toString() });
    //...............

    //posts of Users it follows
    const allPosts = await Post.find({});
    //araay- of ids that user is following
    const userFollowings = user.followings;
    // console.log(userFollowings);

    // posts of Users it follows
    const followingsPostArray = [];
    for (let i = 0; i < allPosts.length; i++) {
      const onePost = allPosts[i];
      // console.log(onePost.userId);
      //
      if (userFollowings.includes(onePost.userId.toString())) {
        // console.log(onePost);
        followingsPostArray.push(onePost);
      }
    }
    // console.log(allPosts);
    //
    // console.log(followingsPostArray, "followingsPostArray");

    res.json({
      userProfile: visiblePart,
      userPosts: userPosts,
      postsByYouFollow: followingsPostArray,
    });
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});
//reference link-for syntax-
//https://stackoverflow.com/questions/38051977/what-does-populate-in-mongoose-mean
// populate method test( working)
router.get("/populate/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate("userId");
    res.send(post);
  } catch (e) {
    res.send(e);
  }
});

// get one post by id
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.send(post);
  } catch (e) {
    res.send(e);
  }
});
//
module.exports = router;
