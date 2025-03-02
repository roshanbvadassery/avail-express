require("@matterlabs/hardhat-zksync-solc");
require("@matterlabs/hardhat-zksync-deploy");
require("@matterlabs/hardhat-zksync-verify");
require("dotenv").config();

/** @type {import('@matterlabs/hardhat-zksync-solc').ZkSyncSolcConfig} */
module.exports = {
  zksolc: {
    version: "1.3.13", // Use the latest version
    compilerSource: "binary",
    settings: {},
  },
  defaultNetwork: "sophonTestnet",
  networks: {
    hardhat: {
      zksync: true,
    },
    zkSyncTestnet: {
      url: "https://testnet.era.zksync.dev",
      ethNetwork: "goerli", // Can be replaced with the RPC URL of the network
      zksync: true,
      verifyURL: 'https://zksync2-testnet-explorer.zksync.dev/contract_verification'
    },
    zkSyncSepolia: {
      url: "https://sepolia.era.zksync.dev",
      ethNetwork: "sepolia",
      zksync: true,
      verifyURL: 'https://explorer.sepolia.era.zksync.dev/contract_verification'
    },
    zkSyncMainnet: {
      url: "https://mainnet.era.zksync.io",
      ethNetwork: "mainnet", // Can be replaced with the RPC URL of the network
      zksync: true,
      verifyURL: 'https://zksync2-mainnet-explorer.zksync.io/contract_verification'
    },
    // Add Sophon networks
    sophonMainnet: {
      url: "https://rpc.sophon.xyz",
      ethNetwork: "mainnet",
      verifyURL: "https://verification-explorer.sophon.xyz/contract_verification",
      browserVerifyURL: "https://explorer.sophon.xyz/",
      enableVerifyURL: true,
      zksync: true,
      accounts: [process.env.PRIVATE_KEY]
    },
    sophonTestnet: {
      url: "https://rpc.testnet.sophon.xyz",
      ethNetwork: "sepolia",
      verifyURL: "https://api-explorer-verify.testnet.sophon.xyz/contract_verification",
      browserVerifyURL: "https://explorer.testnet.sophon.xyz/",
      enableVerifyURL: true,
      zksync: true,
      accounts: [process.env.PRIVATE_KEY]
    },
  },
  solidity: {
    version: "0.8.17",
  },
  etherscan: {
    apiKey: {
      sophonTestnet: process.env.ETHERSCAN_SOPHON_API_KEY || "",
      sophonMainnet: process.env.ETHERSCAN_SOPHON_API_KEY || "",
    },
    customChains: [
      {
        network: "sophonTestnet",
        chainId: 531050104,
        urls: {
          apiURL: "https://api-testnet.sophscan.xyz/api",
          browserURL: "https://testnet.sophscan.xyz",
        },
      },
      {
        network: "sophonMainnet",
        chainId: 50104,
        urls: {
          apiURL: "https://api.sophscan.xyz/api",
          browserURL: "https://sophscan.xyz",
        },
      },
    ],
  }
}; 