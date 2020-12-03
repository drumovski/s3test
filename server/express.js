const express = require("express")
const fetch = require('node-fetch');
const cors = require('cors');
const app = express()
const port = 3001

app.use(express.json()); //Used to parse JSON bodies
// app.use(express.urlencoded()); //Parse URL-encoded bodies

const whitelist = ['http://localhost:3000', 'http://localhost:3001']
app.use(cors({
  credentials: true,
  origin: function (origin, callback) {
    // Check each url in whitelist and see if it includes the origin (instead of matching exact string)
    const whitelistIndex = whitelist.findIndex((url) => url.includes(origin))
    console.log("found whitelistIndex", whitelistIndex)
    callback(null, whitelistIndex > -1)
  }
}));

// S3 code from  https://medium.com/@khelif96/uploading-files-from-a-react-app-to-aws-s3-the-right-way-541dd6be689
var aws = require('aws-sdk');
require('dotenv').config(); // Configure dotenv to load in the .env file// Configure aws with your accessKeyId and your secretAccessKey
aws.config.update({
  region: 'ap-southeast-2', // Put your aws region here
  accessKeyId: process.env.AWSAccessKeyId,
  secretAccessKey: process.env.AWSSecretKey
})
const S3_BUCKET = process.env.Bucket
// Now lets export this function so we can call it from somewhere else
const sign_s3 = (req, res) => {
  const s3 = new aws.S3();
  // Create a new instance of S3
  const fileName = req.body.fileName;
  const fileType = req.body.fileType;
  // Set up the payload of what we are sending to the S3 api
  const s3Params = {
    Bucket: S3_BUCKET,
    Key: fileName,
    Expires: 500,
    ContentType: fileType,
    ACL: 'public-read'
  };
  console.log(s3Params)
  // Make a request to the S3 API to get a signed URL which we can use to upload our file
  s3.getSignedUrl('putObject', s3Params, (err, data) => {
    if (err) {
      console.log(err);
      res.json({
        success: false,
        error: err
      })
    }
    // Data payload of what we are sending back, the url of the signedRequest and a URL where we can access the content after its saved. 
    const returnData = {
      signedRequest: data,
      url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
    };
    // Send it all back    
    res.json({
      success: true,
      data: {
        returnData
      }
    });
  });
}

app.post('/sign_s3', sign_s3)

//finished s3 part


app.get('/', (req, res) => {
  res.send("hello")
})





app.listen(port, () => console.log(`listening on port ${port}!`))