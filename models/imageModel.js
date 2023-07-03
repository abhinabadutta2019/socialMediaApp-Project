const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  photoPath: {
    type: String,
    required: false,
  },
});

//
const Image = mongoose.model("Image", imageSchema);
module.exports = Image;
