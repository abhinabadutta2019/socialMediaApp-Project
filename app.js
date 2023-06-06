const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

//
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
//
const path = require("path");
//////////////////////////////////////////
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });
//////////////////////////////////////////////
const app = express();
app.use(express.json());
//
dotenv.config();

//middlewares- of recently installed npm's
app.use(express.static("public"));
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
app.use("/images", express.static("images"));
//
app.get("/upload", (req, res) => {
  res.render("upload");
});
//
app.post("/upload", upload.single("image"), (req, res) => {
  res.send("image uploaded");
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
