const { developmentChains } = require("../helper-hardhat-config");
const { network, ethers } = require("hardhat");

const DECIMALS = "18";
const INITIAL_PRICE = ethers.utils.parseUnits("200", "ether");

module.exports = async ({ getNamedAccounts, deployments }) => {
  console.log("Mocks");
  const { deploy, log } = deployments;

  const BASE_FEE = ethers.utils.parseEther("0.25"); //costs 0.25 link per request
  const GAS_PRICE_LINK = 1e9; //link oer gas

  const { deployer } = await getNamedAccounts();

  const args = [BASE_FEE, GAS_PRICE_LINK];

  if (developmentChains.includes(network.name)) {
    log("----------------------------------------");
    log("local network detected! deploying MOCKS....");
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      log: true,
      args: args,
    });
    await deploy("MockV3Aggregator", {
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_PRICE],
    });
    log("Mocks deployed!");
    log("----------------------------------------");
  }
};

module.exports.tags = ["all", "mocks", "randomipfs", "dynamicsvg", "main"];
