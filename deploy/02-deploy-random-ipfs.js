const { network } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const {
  storeImages,
  storeTokenUriMetadata,
} = require("../utils/uploadToPinata");

const imagesLocation = "./images/randomNft";

const metadataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      trait_type: "Cuteness",
      value: 100,
    },
  ],
};

let tokenUris = [
  "https://ipfs.io/ipfs/QmSbccn9wZssYdvYicxqQ48TxLpBqWY55RBKWtaxTHisqo",
  "https://ipfs.io/ipfs/QmS3nZpKdSMe41Hf9QS3H52t9DrnAYcnMqBv73bEwu47t3",
  "https://ipfs.io/ipfs/QmVLVcQfQz78c4CPoZXhhaPXBZmy7swyf1SGsLqktNVqCs",
];

const FUND_AMOUNT = "1000000000000000000000";

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  //get the IPFS hashes of our images
  //1. with our own IPFS node
  //2. https://pinata.cloud
  //3. NFT.storage

  if (process.env.UPLOAD_TO_PINATA == "true") {
    tokenUris = await handleTokenUris();
  }

  let vrfCoordinatorV2Address, vrfCoordinatorV2Mock, subscriptionId;

  if (developmentChains.includes(network.name)) {
    vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
    const tx = await vrfCoordinatorV2Mock.createSubscription();
    const txRecipt = await tx.wait(1);
    subscriptionId = txRecipt.events[0].args.subId;
    await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
    subscriptionId = networkConfig[chainId].subscriptionId;
  }

  log("---------------------------------------");

  const args = [
    vrfCoordinatorV2Address,
    subscriptionId,
    networkConfig[chainId]["gasLane"],
    networkConfig[chainId]["callbackGasLimit"],
    tokenUris,
    networkConfig[chainId]["mintFee"],
  ];

  const randomIpfsNft = await deploy("RandomIpfsNft", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });

  //add your contract as the consumer to the vrfCoordinatorV2Mock
  if (developmentChains.includes(network.name)) {
    await vrfCoordinatorV2Mock.addConsumer(
      subscriptionId,
      randomIpfsNft.address
    );
  }

  log("---------------------------------------");

  //Verify the deployment
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying...");
    await verify(randomIpfsNft.address, args);
  }
};

async function handleTokenUris() {
  tokenUris = [];
  //store image in IPFS
  //store metadata in IPFS

  const { responses: imageUploadResponses, files } = await storeImages(
    imagesLocation
  );
  for (imageUploadResponseIndex in imageUploadResponses) {
    //create metadata
    //upload the metadata
    let tokenUriMetadata = { ...metadataTemplate };
    tokenUriMetadata.name = files[imageUploadResponseIndex].replace(".png", "");
    tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup!`;
    tokenUriMetadata.image = `https://ipfs.io/ipfs/${imageUploadResponses[imageUploadResponseIndex].IpfsHash}`;
    console.log(`uploading ${tokenUriMetadata.name} .....`);
    //store the JSON to Pinata
    const metadataUploadResponse = await storeTokenUriMetadata(
      tokenUriMetadata
    );
    tokenUris.push(`https://ipfs.io/ipfs/${metadataUploadResponse.IpfsHash}`);
  }
  console.log("Token URIs uploaded! they are: ");
  console.log(tokenUris);
  return tokenUris;
}

module.exports.tags = ["all", "randomipfs", "main"];
//yarn hardhat deploy --tags randomipfs,mocks
