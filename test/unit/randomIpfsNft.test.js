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

        it("emits an event and kicks off a random word request", async function() {});
      });

      describe("fulfillRandomWords", () => {
        it("mints NFT after random number is returned", async function() {});
      });

      describe("getBreedFromModdedRng", () => {
        it("should return pug if moddedRng < 10", async function() {});
        it("should return shiba-inu if moddedRng is between 10 - 39", async function() {});
        it("should return st. bernard if moddedRng is between 40 - 99", async function() {});
        it("should revert if moddedRng > 99", async function() {});
      });
    });
