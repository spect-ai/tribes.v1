require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");
// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.
// require("./tasks/faucet");
// const fs = require("fs");
// const privateKey = fs.readFileSync(".secret").toString().trim();

module.exports = {
  defaultNetwork: "hardhat",
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: "",
  },

  networks: {
    hardhat: {
      inject: false, // optional. If true, it will EXPOSE your mnemonic in your frontend code. Then it would be available as an "in-page browser wallet" / signer which can sign without confirmation.
      accounts: {
        mnemonic: "test test test test test test test test test test test junk", // test test test test test test test test test test test junk
      },
      chainId: 1337,
    },
    mumbai: {
      url: "https://speedy-nodes-nyc.moralis.io/27686f41b7c9afc73b87dfa2/polygon/mumbai",
      network_id: 80001,
      confirmations: 2,
      accounts: [],
    },
    polygon: {
      url: "https://speedy-nodes-nyc.moralis.io/f84f46508f22a737cbbdb355/polygon/mainnet",
      network_id: 137,
      confirmations: 2,
      accounts: {
        mnemonic: "secret",
      },
    },
    fuji: {
      url: "https://speedy-nodes-nyc.moralis.io/27686f41b7c9afc73b87dfa2/avalanche/testnet",
      network_id: 43113,
      confirmations: 2,
      accounts: {
        mnemonic: "secret",
      },
    },
    avalanche: {
      url: "https://speedy-nodes-nyc.moralis.io/27686f41b7c9afc73b87dfa2/avalanche/mainnet",
      network_id: 43114,
      confirmations: 2,
      accounts: {
        mnemonic: "secret",
      },
    },
    rinkeby: {
      url: "https://speedy-nodes-nyc.moralis.io/27686f41b7c9afc73b87dfa2/eth/rinkeby",
      network_id: 4,
      confirmations: 2,
      accounts: {
        mnemonic: "secret",
      },
    },
    ethereum: {
      url: "https://speedy-nodes-nyc.moralis.io/27686f41b7c9afc73b87dfa2/eth/mainnet",
      network_id: 1,
      confirmations: 2,
      accounts: {
        mnemonic: "secret",
      },
    },
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
