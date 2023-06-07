const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
//
// const fs = require("fs");

//
const Image = require("./models/imageModel");

//
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");

//
const path = require("path");

//

//////////////////////////////////////////
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "images"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});
const upload = multer({ storage: storage });
//////////////////////////////////////////////
const app = express();
app.use(express.json());

//
dotenv.config();

//this line was vital to show image on frontend
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(cookieParser());
// view engine
app.set("view engine", "ejs");

//mongoDB cloud
let uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.te788iv.mongodb.net/socialApp-15-may?retryWrites=true&w=majority`;
//
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//home page would redirect to login url
app.get("/", (req, res) => {
  try {
    res.redirect("/user/login");
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});
//geeks for geeks- to see uploaded file on browser
// app.use("/images", express.static("images"));
//
app.get("/upload", (req, res) => {
  try {
    res.render("upload");
  } catch (err) {
    res.json(err);
  }
});
//
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const imagePath = `/images/${req.file.filename}`; // Get the relative path of the image
    //
    console.log(imagePath, "imagePath");

    // Save the imagePath to MongoDB
    const newImage = new Image({
      imagePath: imagePath,
    });
    const image = await newImage.save();
    res.send({ image: image });
  } catch (err) {
    res.json(err);
  }
});
//
app.get("/showImage/:id", async (req, res) => {
  try {
    const oneImage = await Image.findById(req.params.id);
    res.render("showImage", { imagePath: oneImage.imagePath });
  } catch (err) {
    res.json(err);
  }
});
//
app.use("/user", userRoutes);
app.use("/post", postRoutes);

//
app.use((req, res, next) => {
  res.status(404).render("404"); // Assuming you have a view called "404.ejs" for the error page
});

app.listen(process.env.PORT, () => {
  console.log(`Server Started at ${process.env.PORT}`);
});
