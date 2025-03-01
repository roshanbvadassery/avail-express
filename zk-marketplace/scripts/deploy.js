require("dotenv").config();
const { Wallet, Provider, utils } = require("zksync-web3");
const ethers = require("ethers");
const hre = require("hardhat");
const { Deployer } = require("@matterlabs/hardhat-zksync-deploy");

async function main() {
  console.log("Starting deployment process...");

  // Initialize the wallet.
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("Please set PRIVATE_KEY in the environment variables");
  }

  // Get provider
  const provider = new Provider(hre.network.config.url);
  const wallet = new Wallet(privateKey, provider);
  const deployer = new Deployer(hre, wallet);

  console.log(`Deploying contracts with the account: ${wallet.address}`);

  const balance = await wallet.getBalance();
  console.log(`Account balance: ${ethers.utils.formatEther(balance)} ETH`);

  // Deploy the contract
  console.log("Deploying DataMarketplace...");
  const artifact = await deployer.loadArtifact("DataMarketplace");
  
  const marketplace = await deployer.deploy(artifact);
  
  console.log(`DataMarketplace deployed to: ${marketplace.address}`);

  // Verify the contract
  console.log("Verifying contract...");
  try {
    await hre.run("verify:verify", {
      address: marketplace.address,
      contract: "contracts/ZKDataMarketplace.sol:DataMarketplace",
    });
    console.log("Contract verified successfully!");
  } catch (error) {
    console.error("Verification failed:", error);
    console.error("You may need to wait a few minutes before verifying");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 