const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const path = require("path");
//
//
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
//.
const imageRoutes = require("./routes/imageRoutes");
//
const path = require("path");

//

//////////////////////////////////////////

//////////////////////////////////////////////
const app = express();
app.use(express.json());

//
dotenv.config();

//middlewares- of recently installed npm's

app.use(cookieParser());
// view engine
app.set("view engine", "ejs");
//

//this line was vital to show image on frontend
//this is for absolute path
// app.use("/images", express.static(path.join(__dirname, "images")));

//this line was vital to show image on frontend
//this is for relative path
app.use("/images", express.static("./images"));

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
    res.redirect("/user/register");
  } catch (err) {
    console.log(err);
    res.json(err);
  }
});

app.use("/user", userRoutes);
app.use("/post", postRoutes);
//-
app.use("/image", imageRoutes);

//
app.use((req, res, next) => {
  res.status(404).render("404"); // Assuming you have a view called "404.ejs" for the error page
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server Started at ${port}`);
});
