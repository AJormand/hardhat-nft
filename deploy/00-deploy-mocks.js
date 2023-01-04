const { developmentChains } = require("../helper-hardhat-config");
const { network } = require("hardhat");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  console.log("xxxxxxxxxxxxxx");

  const BASE_FEE = ethers.utils.parseEther("0.25"); //costs 0.25 link per request
  const GAS_PRICE_LINK = 1e9; //link oer gas

  const { deployer } = await getNamedAccounts();

  const args = [BASE_FEE, GAS_PRICE_LINK];

  if (developmentChains.includes(network.name)) {
    log("local network detected! deploying MOCKS....");
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      log: true,
      args: args,
    });
    log("Mocks deployed!");
    log("----------------------------------------");
  }
};

module.exports.tags = ["all", "mocks", "randomipfs"];
