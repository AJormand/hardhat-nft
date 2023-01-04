const pinataSDK = require("@pinata/sdk");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const pinataApiKey = process.env.PINATA_API_KEY;
const pinataApiSecret = process.env.PINATA_API_SECRET;
const pinata = new pinataSDK(pinataApiKey, pinataApiSecret);

async function storeImages(imagesFilePath) {
  console.log("key ", pinataApiKey);
  console.log("secret ", pinataApiSecret);

  const fullImagesPath = path.resolve(imagesFilePath);
  const files = fs.readdirSync(fullImagesPath);
  console.log(files);
  let responses = [];

  console.log("uploading to Pinata...");
  for (fileIndex in files) {
    const readableStreamForFile = fs.createReadStream(
      `${fullImagesPath}/${files[fileIndex]}`
    );
    const options = {
      pinataMetadata: {
        name: files[fileIndex],
      },
    };
    try {
      console.log(`trying to upload ${fileIndex}`);
      const response = await pinata.pinFileToIPFS(
        readableStreamForFile,
        options
      );
      responses.push(response);
    } catch (err) {
      console.log(err);
    }
  }
  return { responses, files };
}

async function storeTokenUriMetadata(metadata) {
  try {
    const response = await pinata.pinJSONToIPFS(metadata);
    return response;
  } catch (err) {
    console.log(err);
  }

  return null;
}

module.exports = { storeImages, storeTokenUriMetadata };
