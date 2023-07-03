const AWS = require("aws-sdk");
const fs = require("fs");
require("dotenv").config();

const bucketName = `${process.env.YOUR_BUCKET_NAME}`;
const accessKeyId = `${process.env.YOUR_ACCESS_KEY_ID}`;
const secretAccessKey = `${process.env.YOUR_SECRET_ACCESS_KEY}`;
const region = `${process.env.YOUR_REGION}`;

//
const s3 = new AWS.S3({
  region: region,
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
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

  console.log(fileContent, "^^ from s3.js fileContent");
  try {
    const response = await s3.upload(params).promise();
    console.log(response, "response from function");

    //delete after upload
    fs.unlinkSync(file.path);

    //

    //resolve hole tokhon return korbe, resolve hoa obhdi wait korbe
    return response;
    // return;
  } catch (err) {
    console.log(err);
  }
}

//
module.exports = {
  uploadFileToS3,
};
