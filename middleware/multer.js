const express = require("express");
const multer = require("multer");
// const fs = require("fs");

//
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);

    //
    console.log(file.fieldname, "file.fieldname");
    // //
    console.log(uniqueSuffix, "uniqueSuffix");
  },
});

const upload = multer({ storage: storage });
//
module.exports = upload;
