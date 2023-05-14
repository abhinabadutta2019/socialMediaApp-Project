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
    res.send(e);
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
//
module.exports = router;
