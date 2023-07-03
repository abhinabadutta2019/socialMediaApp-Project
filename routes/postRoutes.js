const express = require("express");
const mongoose = require("mongoose");
const Post = require("../models/postModel");
const User = require("../models/userModel");
const router = express.Router();
const { verifyLoggedInUser } = require("../middleware/verifyLoggedInUser");

const {
  postmanLoginMiddleware,
} = require("../middleware/postmanLoginMiddleware");

//multer
const upload = require("../middleware/multer");
//
const s3 = require("../helper/s3");
//
const multer = require("../middleware/multer");
const aws = require("../helper/s3");
//
//----/post
//

//
//
router.get("/create", verifyLoggedInUser, async (req, res) => {
  //
  try {
    res.render("createPost");
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});
//
//----/post
////prettier-ignore
//create a post
router.post(
  "/create",
  verifyLoggedInUser,
  multer.single("image"),
  async (req, res) => {
    try {
      // multer.array---req.files diyei multiple files upload hoyeche kina check korte hocche
      //multer.single--- hole req.file

      // console.log(req.body, "req.body");
      // console.log(req.files, "req.files");

      //
      const user = req.userDetail;

      if (!user) {
        return res.json("User not logged in");
      }

      //
      // console.log(req.body, "req.body");

      if (req.body.description.length < 3) {
        return res.json({ message: "post description is too short" });
      }
      //
      let newPost;

      //
      console.log(req.file, "req.files");
      //
      if (!req.file) {
        console.log("inside if");
        //create new post
        newPost = new Post({
          userId: user._id.toString(),
          description: req.body.description,
        });
      } else if (req.file) {
        console.log("inside else if");
        //
        const image = req.file;

        const uploadResponse = await aws.uploadFileToS3(image);
        //
        console.log(uploadResponse.Location, "uploadResponse.Location");

        newPost = new Post({
          userId: user._id.toString(),
          description: req.body.description,
          // photoPath: user.photoPath.push(uploadResponse.Location),
          photoPath: uploadResponse.Location,
        });
      }

      //save to database
      const post = await newPost.save();

      // res.json({ post: post });
      res.json({ message: "post created" });
      // res.send();
    } catch (err) {
      console.log(err);
      res.json(err);
    }
  }
);

//

//users- own -posts
router.get("/ownposts", verifyLoggedInUser, async (req, res) => {
  //
  try {
    console.log(req.url, "req.url");
    //
    const user = req.userDetail;

    // console.log(user._id.toString());

    const myPosts = await Post.find({});

    // //
    const myArray = [];
    for (let i = 0; i < myPosts.length; i++) {
      const onePost = myPosts[i];
      //
      if (user._id.toString() == onePost.userId.toString()) {
        const { __v, userId, ...others } = onePost._doc;
        // console.log(others, "others");
        myArray.push(others);
      }
    }
    // res.json();
    // if (myArray.length == 0) {
    //   return res.json({ message: "this user has no post" });
    //   // res.render("ownPosts");
    // }
    // res.json({ myArray: myArray });
    res.render("ownPosts", { myArray: myArray });
  } catch (err) {
    res.json(err);
  }
});

//update post frontend (get request)
router.get("/update/:id", verifyLoggedInUser, async (req, res) => {
  try {
    res.render("updatePost");
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

//update a post

router.put("/update/:id", verifyLoggedInUser, async (req, res) => {
  try {
    //
    // console.log(req.url, "req.url");
    const user = req.userDetail;
    //
    // console.log(user.id);

    //

    if (req.body.description.length < 3) {
      return res.json({ message: "post description is too short" });
    }

    // console.log(req.body, "req.body");
    //

    //check if params object id is valid
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.json({ message: "req.params.id - not a valid ObjectId" });
    }
    //
    const post = await Post.findById(req.params.id);

    //
    // console.log(post.userId.toString(), "post.userId.toString()");
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

    // if (!req.body.description) {
    //   return res.json({ message: "req.body.description is not defined " });
    // }
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

    // res.json({ updatedPost });
    res.json({ message: "post updated" });
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

//delete a post
router.delete("/delete/:id", verifyLoggedInUser, async (req, res) => {
  try {
    console.log(req.url, "deleteParentId");
    // console.log();
    //
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

    // res.json({ deletedPost: deletedPost, deletedBy: user });

    res.json({ message: "post delete success" });
    // res.send(post);
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

    res.json({ message: "Liked" });
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

//user delete hole-- post er liked array thke -- sei user er id delete hoye jabe-- eta-- user er delete block e korte hobe

//timeline
router.get("/timeline/all", verifyLoggedInUser, async (req, res) => {
  try {
    console.log(req.url, "req.url");

    //
    const user = req.userDetail;

    // console.log(req.userDetail, "req.userDetail");
    //
    const newUser = { ...user._doc };
    // console.log(newUser);
    const { _id, password, __v, ...visiblePart } = newUser;
    // console.log(visiblePart);
    ///////////////////////////////////////////////

    //
    /////////////////////////////////

    //populating post - with userId
    const allPosts = await Post.find({}).populate("userId");

    // console.log(allPosts, "allPosts");
    //araay- of ids that user is following

    // if not own post
    let notOwnPost = [];
    //

    for (let i = 0; i < allPosts.length; i++) {
      const onePost = allPosts[i];

      // console.log(
      //   onePost.userId._id.toString(),
      //   "onePost.userId._id.toString()"
      // );

      // console.log(user._id.toString(), "user._id.toString()");

      // if not own post

      if (
        onePost.userId &&
        onePost.userId._id &&
        onePost.userId._id.toString() !== user._id.toString()
      ) {
        //
        // console.log(onePost, "onePost");
        //
        notOwnPost.push(onePost);
      }
      // console.log(onePost.userId.username);
    }
    // console.log(notOwnPost, "notOwnPost before");

    // //sorting
    notOwnPost.sort(function (a, b) {
      const random = 0.5 - Math.random();
      if (random < 0) {
        return -1;
      } else if (random > 0) {
        return 1;
      } else {
        return 0;
      }
    });
    // //
    // console.log(notOwnPost, "notOwnPost after");

    //length 10 er beshi hole - just 10 would be shown
    if (notOwnPost.length > 10) {
      notOwnPost = notOwnPost.slice(0, 10);
    }

    // //

    //
    // res.json({
    //   userProfile: visiblePart,
    //   postsNotByYou: notOwnPost,
    // });

    //
    res.render("timeline", {
      userProfile: visiblePart,
      postsNotByYou: notOwnPost,
    });
    //

    //
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

//post liked users details
router.get("/postLiked/:id", verifyLoggedInUser, async (req, res) => {
  //
  try {
    console.log(req.url, "req.url");
    //from string to object id
    const postObjectId = new mongoose.Types.ObjectId(`${req.params.id}`);
    //
    const postLikedBy = await Post.aggregate([
      //
      {
        $match: { _id: postObjectId },
      },
      {
        $lookup: {
          from: "users",
          localField: "likes",
          foreignField: "_id",
          as: "likedBy_info",
        },
      },
    ]);
    // console.log(postLikedBy[0].likes, "postLikedBy");
    // for (let i = 0; i < postLikedBy[0].likedBy_info.length; i++) {
    //   const element = postLikedBy[0].likedBy_info[i];
    //   console.log(element, "element");
    // }
    res.render("postLiked", { postLikedBy: postLikedBy });
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

//someone's all posts
router.get("/strangerOwnPost/:id", async (req, res) => {
  //
  try {
    //
    const peopleId = req.params.id;

    //the strangerUser
    const strangerUser = await User.findById({ _id: peopleId });

    console.log(strangerUser, "strangerUser");

    //
    const allPosts = await Post.find({}).populate("userId");
    //

    // const userPosts = await Post.find({ userId: req.params.id });

    let userPosts = [];
    // let postedBy;
    //
    for (let index = 0; index < allPosts.length; index++) {
      const onePost = allPosts[index];

      //
      //
      if (
        onePost.userId &&
        onePost.userId._id &&
        onePost.userId._id.toString() == peopleId
      ) {
        //
        // console.log(onePost.userId.username, "onePost");
        // postedBy = onePost.userId.username;
        //
        userPosts.push(onePost);
      }
    }

    // console.log(userPosts, "userPosts");
    // console.log(postedBy, "postedBy");
    //
    res.render("strangerPostList", {
      userPosts: userPosts,
      postedBy: strangerUser.username,
    });
    // res.json({ userPosts: userPosts });
    //
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

//reference link-for syntax-
//https://stackoverflow.com/questions/38051977/what-does-populate-in-mongoose-mean
// populate method test( working)
// router.get("/populate/:id", async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.id).populate("userId");
//     //
//     console.log(post.userId._id.toString(), "post.userId._id.toString()");
//     res.send(post);
//   } catch (e) {
//     res.send(e);
//   }
// });

//
// get one post by id
// router.get("/:id", async (req, res) => {
//   try {
//     const post = await Post.findById(req.params.id);
//     res.send(post);
//   } catch (e) {
//     res.send(e);
//   }
// });
//
//
module.exports = router;
