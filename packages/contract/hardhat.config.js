require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    sepolia: {
      url: "https://eth-sepolia.g.alchemy.com/v2/CEtfJeBEHHdjLCMrm09wTCjBMe67n6VA",
      accounts: ["1c4476656f888cbb4dab42159b7ab3206b849420d3ed18ede4cd4e761660b354"],
    },
  },
};
