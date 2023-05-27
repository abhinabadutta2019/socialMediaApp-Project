const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
//
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
//
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

app.listen(process.env.PORT, () => {
  console.log(`Server Started at ${process.env.PORT}`);
});

app.use("/user", userRoutes);
app.use("/post", postRoutes);
