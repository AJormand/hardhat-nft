const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

//run only on development chains
!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Bsic NFT Unit Tests", async function() {
      let basicNft, deployer;

      beforeEach(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        //deploys the deployment script with tag basicnft - possible with hardhat deploy plugin
        await deployments.fixture(["basicnft"]);
        basicNft = await ethers.getContract("BasicNft");
      });

      describe("Constructor", () => {
        it("Initializes the NFT correctly", async () => {
          const name = await basicNft.name();
          const symbol = await basicNft.symbol();
          const tokenCounter = await basicNft.getTokenCounter();
          assert.equal(name, "Dogie");
          assert.equal(symbol, "DOG");
          assert.equal(tokenCounter, "0");
        });
      });

      describe("Mint NFT", () => {
        beforeEach(async () => {
          const txResponse = await basicNft.mintNft();
          await txResponse.wait(1);
        });
        it("Allows users to mint an NFT, and updates appropriately", async function() {
          const tokenURI = await basicNft.tokenURI(0);
          const tokenCounter = await basicNft.getTokenCounter();

          assert.equal(tokenCounter.toString(), "1");
          assert.equal(tokenURI, await basicNft.TOKEN_URI());
        });

        it("Show the correct balance and owner of an NFT", async function() {
          const deployerAddress = deployer.address;
          const deployerBalance = await basicNft.balanceOf(deployerAddress);
          const owner = await basicNft.ownerOf("0");

          assert.equal(deployerBalance.toString(), "1");
          assert.equal(owner, deployerAddress);
        });
      });
    });
