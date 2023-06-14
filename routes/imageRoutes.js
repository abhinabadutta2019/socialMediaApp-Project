const express = require("express");
const mongoose = require("mongoose");
const Image = require("../models/imageModel");
const router = express.Router();
const multer = require("../middleware/multer");
const aws = require("../helper/s3");
require("aws-sdk/lib/maintenance_mode_message").suppress = true;

const fs = require("fs");
const path = require("path");
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

    //abosolute path with path,__dirname
    //this link helped
    //https://stackoverflow.com/questions/30845416/how-to-go-back-1-folder-level-with-dirname

    const absPath = path.join(__dirname, `../images/${req.file.filename}`);

    //
    console.log(absPath, "absPath");

    //readFileSync needs absolute file path
    const result = fs.readFileSync(absPath);

    // console.log(result, "result");
    ////////////
    console.log(req.file, "req.file");

    //absPath vs photoPath
    //abspath backward slash diye hocche(\), Localhost er link cdrive er link thakche, ei jonno hoyto browser e dekhacche na

    const newImage = new Image({
      photoPath: photoPath,
    });
    const image = await newImage.save();

    res.json({ image: image });

    //readFileSync file-- post man e show korbe
    // res.end(result);
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

    // res.json();
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
