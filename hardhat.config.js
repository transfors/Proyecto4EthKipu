require("@nomicfoundation/hardhat-ignition");
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const alchemyUrl = process.env.ALCHEMY_URL;
const prKey = process.env.PRIVATE_KEY;
const ethScanApi = process.env.ETHERSCAN_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      url: alchemyUrl,
      accounts: [prKey],
    },
    hardhat: {
      chainId: 1337,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ethScanApi,
    },
  }, 
};