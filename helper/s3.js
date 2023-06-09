require("dotenv").config();
const fs = require("fs");
const AWS = require("aws-sdk");
// const S3 = require("aws-sdk/clients/s3");
//
const bucketName = `${process.env.YOUR_BUCKET_NAME}`;
const accessKeyId = `${process.env.YOUR_ACCESS_KEY_ID}`;
const secretAccessKey = `${process.env.YOUR_SECRET_ACCESS_KEY}`;
const region = `${process.env.YOUR_REGION}`;

//
const s3 = new AWS.S3({
  region,
  accessKeyId,
  secretAccessKey,
});

//
async function uploadFileToS3(file) {
  //
  const fileContent = fs.readFileSync(file.path);
  //
  const params = {
    Bucket: bucketName,
    Key: file.filename,
    Body: fileContent,
  };
  //
  try {
    const response = await s3.upload(params).promise();
    console.log("File uploaded successfully:", response);
    //
    return response.Location; // Return the uploaded file URL
  } catch (err) {
    console.log("Error uploading s3 file:", err);
  }
}
// exports.uploadFileToS3 = uploadFileToS3;
module.exports = {
  uploadFileToS3,
};
