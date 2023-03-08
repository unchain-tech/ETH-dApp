require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

module.exports = {
  solidity: '0.8.17',
  networks: {
    goerli: {
      url:
        typeof process.env.STAGING_ALCHEMY_KEY === 'undefined'
          ? ''
          : process.env.STAGING_ALCHEMY_KEY,
      accounts:
        typeof process.env.PRIVATE_KEY === 'undefined'
          ? ['0'.repeat(64)]
          : [process.env.PRIVATE_KEY],
    },
    // mainnet: {
    //   chainId: 1,
    //   url: process.env.PROD_ALCHEMY_KEY,
    //   accounts: [process.env.PRIVATE_KEY],
    // },
  },
};
