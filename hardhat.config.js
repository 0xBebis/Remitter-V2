require("@nomiclabs/hardhat-waffle");
require("./secrets.json");
require("hardhat-gas-reporter");

const { devAccount, reaperAccount, testAccount, ftmScan } = require('./secrets.json');

module.exports = {
  networks: {
    /*hardhat: {
      forking: {
        url: "https://rpc.ftm.tools/",
        blockNumber: 11238828,
        accounts: [reaperAccount]
      }
    },*/
    test: {
      url: "https://rpc.testnet.fantom.network/",
      accounts: [testAccount]
    },
    opera: {
      url: "https://rpc.ftm.tools/",
      accounts: [testAccount]
    }
  },
  etherscan: {
    apiKey: ftmScan
  },
  solidity: {
    compilers: [
      {
        version: "0.8.11",
        settings: {
          optimizer: {
            enabled: true,
            runs:200
          }
        }
      },
    ]
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  gasReporter: {
    currency: 'USD',
    token: 'FTM',
    coinmarketcap: process.env.COINMARKETCAP,
  },
  mocha: {
    timeout: 200000
  }
};
