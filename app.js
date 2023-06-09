const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const AWS = require("aws-sdk");
//for aws
require("aws-sdk/lib/maintenance_mode_message").suppress = true;

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

//Configure AWS SDK with your credentials and region
AWS.config.update({
  accessKeyId: `${process.env.YOUR_ACCESS_KEY_ID}`,
  secretAccessKey: `${process.env.YOUR_SECRET_ACCESS_KEY}`,
  // region: "YOUR_REGION",
});
//aws related
// Create an instance of the S3 service
const s3 = new AWS.S3();
//
async function uploadFileToS3() {
  //
  const params = {
    Body: "new world",
    Bucket: "abhinaba-nodejs-uploads",
    Key: "a-text-file.txt",
  };

  //
  try {
    const response = await s3.putObject(params).promise();
    console.log("File uploaded successfully:", response);
  } catch (error) {
    console.error("Error uploading file:", error);
  }
}

//
// Call the async function to upload the file
uploadFileToS3();
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
