const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  description: {
    type: String,
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

//
const Post = mongoose.model("Post", postSchema);
//
module.exports = Post;
