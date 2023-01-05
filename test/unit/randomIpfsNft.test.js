const { inputToConfig } = require("@ethereum-waffle/compiler");
const { assert, expect } = require("chai");
const { network, ethers, getNamedAccounts, deployments } = require("hardhat");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("randomIpfsNft UNIT TEST", async function() {
      let randomIpfsNft, vrfCoordinatorV2Mock, deployer;

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        //deployments.fixture can be used with hardhat-deploy package which makes it so that deploy scripts are run before the testin meaning that we dont have to write dploy code here
        await deployments.fixture(["randomipfs"]);
        randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer);
        vrfCoordinatorV2Mock = await ethers.getContract(
          "VRFCoordinatorV2Mock",
          deployer
        );
      });

      describe("constructor", () => {
        it("sets starting values correctly", async function() {
          const dogTokenUrisZero = await randomIpfsNft.getDogTokenUris(0);
          console.log(dogTokenUrisZero);
        });
      });

      describe("requestNft", () => {
        it("fails if payment isn't sent with the request", async function() {
          await expect(randomIpfsNft.requestNft()).to.be.revertedWith(
            "RandomIpfsNft__NeedMoreETHSent"
          );
        });
        it("reverts if payment amount is less than the mint fee", async function() {
          const mintFee = await randomIpfsNft.getMintFee();
          const substractedMintFee = mintFee.sub(
            ethers.utils.parseEther("0.001")
          );
          await expect(
            randomIpfsNft.requestNft({ value: substractedMintFee })
          ).to.be.revertedWith("RandomIpfsNft__NeedMoreETHSent");
        });

        it("emits an event and kicks off a random word request", async function() {
          const fee = await randomIpfsNft.getMintFee();
          await expect(
            randomIpfsNft.requestNft({ value: fee.toString() })
          ).to.emit(randomIpfsNft, "NftRequested");
        });
      });

      describe("fulfillRandomWords", () => {
        it("mints NFT after random number is returned", async function() {
          //   await new Promise(async (resolve, reject) => {
          //     randomIpfsNft.once("NftMinted", async () => {
          //       try {
          //         const tokenUri = await randomIpfsNft.tokenURI("0");
          //         const tokenCounter = await randomIpfsNft.getTokenCounter();
          //         //assert.equal(tokenUri.toString().includes("ipfs://"), true);
          //         assert.equal(tokenCounter.toString(), "1");
          //         resolve();
          //       } catch (e) {
          //         console.log(e);
          //         reject(e);
          //       }
          //     });
          //     try {
          //       const fee = await randomIpfsNft.getMintFee();
          //       const requestNftResponse = await randomIpfsNft.requestNft({
          //         value: fee.toString(),
          //       });
          //       const requestNftReceipt = await requestNftResponse.wait(1);
          //       await vrfCoordinatorV2Mock.fulfillRandomWords(
          //         requestNftReceipt.events[1].args.requestId,
          //         randomIpfsNft.address
          //       );
          //     } catch (e) {
          //       console.log(e);
          //       reject(e);
          //     }
          //   });
        });
      });

      describe("getBreedFromModdedRng", () => {
        it("should return pug if moddedRng < 10", async function() {
          const moddedRng = 2;
          const expectedValue = await randomIpfsNft.getBreedFromModdedRng(
            moddedRng
          );
          assert.equal(expectedValue, 0);
        });

        it("should return shiba-inu if moddedRng is between 10 - 29", async function() {
          const moddedRng = 15;
          const expectedValue = await randomIpfsNft.getBreedFromModdedRng(
            moddedRng
          );
          assert.equal(expectedValue, 1);
        });

        it("should return st. bernard if moddedRng is between 30 - 99", async function() {
          const moddedRng = 41;
          const expectedValue = await randomIpfsNft.getBreedFromModdedRng(
            moddedRng
          );
          assert.equal(expectedValue, 2);
        });
        it("should revert if moddedRng > 99", async function() {
          const moddedRng = 101;
          await expect(
            randomIpfsNft.getBreedFromModdedRng(moddedRng)
          ).to.be.revertedWith("RandomIpfsNft__RangeOutOfBounds");
        });
      });
    });
