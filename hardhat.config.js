require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-etherscan");
require("dotenv").config();
require("solidity-coverage");
require("hardhat-deploy");

/** @type import('hardhat/config').HardhatUserConfig */
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "https://some-dummy-http";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xkey";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key";
const COINMARKETCAP_API = process.env.COINMARKETCAP_API || "key";
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL;

module.exports = {
  defaultNetwork: "hardhat",
  etherscan: {
    apiKey: {
      goerli: ETHERSCAN_API_KEY,
    },
    // In case the module can't find the rinkeby etherscan automatically
    customChains: [
      {
        network: "goerli",
        chainId: 5,
        urls: {
          apiURL: "https://api-goerli.etherscan.io/api",
          browserURL: "https://goerli.etherscan.io",
        },
      },
    ],
  },
  networks: {
    hardhat: {
      chainId: 31337,
      forking: {
        url: MAINNET_RPC_URL,
      },
    },
    goerli: {
      chainId: 5,
      blockConfirmations: 6,
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],
    },
  },
  solidity: {
    compilers: [
      { version: "0.8.8" },
      { version: "0.6.6" },
      { version: "0.6.12" },
      { version: "0.4.19" },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    },
  },
  gasReporter: {
    enabled: false,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    // coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  mocha: {
    timeout: 300000,
  },
};
