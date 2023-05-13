const express = require("express");
const mongoose = require("mongoose");
const Post = require("../models/postModel");
const router = express.Router();

//----/post
//create a post
router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savedPost = await newPost.save();
    res.send(savedPost);
  } catch (e) {
    console.log(e);
  }
});

// get one user by id
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
