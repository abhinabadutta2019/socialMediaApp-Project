const express = require("express");
const mongoose = require("mongoose");
const Image = require("../models/imageModel");
const router = express.Router();
const multer = require("../middleware/multer");
const aws = require("../helper/s3");
require("aws-sdk/lib/maintenance_mode_message").suppress = true;

// const fs = require("fs");
//--/image
//
//
router.post("/upload", multer.single("file"), async (req, res) => {
  //
  try {
    if (!req.file) {
      return res.json({ message: "no file uploaded" });
    }
    //this line solved
    const photoPath = `/images/${req.file.filename}`;

    console.log(req.file, "req.file");

    const newImage = new Image({
      photoPath: photoPath,
    });
    const image = await newImage.save();

    res.json({ image: image });
    // res.json();
  } catch (err) {
    console.log(err);
    res.json({ err: err });
  }
});

//
router.post("/uploadtoS3", multer.single("file"), async (req, res) => {
  //
  try {
    //
    if (!req.file) {
      return res.json({ message: "no file uploaded" });
    }
    //
    const file = req.file;

    //
    const uploadResponse = await aws.uploadFileToS3(file);
    //
    console.log(uploadResponse.Location, "uploadResponse.Location");
    //

    const newImage = new Image({
      photoPath: uploadResponse.Location,
    });
    //
    const image = await newImage.save();

    res.json({ image: image });

    res.json();
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

//show image
router.get("/showImage/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    console.log(image.photoPath, "image.photoPath");
    res.render("showImage", { image: image });
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

//
module.exports = router;
