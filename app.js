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

//////////////////////////////////////////////
const app = express();
app.use(express.json());

//

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

app.use("/user", userRoutes);
app.use("/post", postRoutes);

//
app.use((req, res, next) => {
  res.status(404).render("404"); // Assuming you have a view called "404.ejs" for the error page
});

app.listen(process.env.PORT, () => {
  console.log(`Server Started at ${process.env.PORT}`);
});
