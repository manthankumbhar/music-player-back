const aws = require("aws-sdk");
const fs = require("fs");
require("dotenv").config();
const crypto = require("crypto");
const { promisify } = require("util");
const randomBytes = promisify(crypto.randomBytes);

const region = process.env.AWS_BUCKET_REGION;
const bucketName = process.env.AWS_BUCKET_NAME;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new aws.S3({
  region,
  accessKeyId,
  secretAccessKey,
  signatureVersion: "v4",
});

async function generateUploadURL() {
  const rawBytes = await randomBytes(16);
  const songName = rawBytes.toString("hex");

  const params = {
    Bucket: bucketName,
    Key: songName,
    Expires: 300,
  };

  const uploadURL = await s3.getSignedUrlPromise("putObject", params);
  console.log(uploadURL);
  return uploadURL;
}

exports.generateUploadURL = generateUploadURL;

async function downloadURL(fileKey) {
  const params = {
    Bucket: bucketName,
    Key: fileKey,
    Expires: 300,
  };

  const downloadURL = await s3.getSignedUrlPromise("getObject", params);
  console.log(downloadURL);
  return downloadURL;
}

exports.downloadURL = downloadURL;
