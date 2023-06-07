const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  imagePath: {
    type: String, // Store the local path as a string
    required: true,
  },
});

//
const Image = mongoose.model("Image", imageSchema);
//
module.exports = Image;
