const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Deploy AssetToken
  const mintFee = hre.ethers.parseEther("0.001"); // 0.001 MATIC mint fee
  const AssetToken = await hre.ethers.getContractFactory("AssetToken");
  const assetToken = await AssetToken.deploy(mintFee);
  await assetToken.waitForDeployment();
  const assetTokenAddress = await assetToken.getAddress();
  console.log("AssetToken deployed to:", assetTokenAddress);

  // Deploy Marketplace
  const Marketplace = await hre.ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy();
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("Marketplace deployed to:", marketplaceAddress);

  // Log deployment summary
  console.log("\n========== Deployment Summary ==========");
  console.log("Network:      ", hre.network.name);
  console.log("AssetToken:   ", assetTokenAddress);
  console.log("Marketplace:  ", marketplaceAddress);
  console.log("Mint Fee:     ", hre.ethers.formatEther(mintFee), "MATIC");
  console.log("Platform Fee:  2.5%");
  console.log("=========================================\n");

  // Verify contracts on Polygonscan (if not localhost)
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Waiting for block confirmations before verification...");
    await new Promise((resolve) => setTimeout(resolve, 30000));

    try {
      await hre.run("verify:verify", {
        address: assetTokenAddress,
        constructorArguments: [mintFee],
      });
      console.log("AssetToken verified on Polygonscan");
    } catch (err) {
      console.log("AssetToken verification failed:", err.message);
    }

    try {
      await hre.run("verify:verify", {
        address: marketplaceAddress,
        constructorArguments: [],
      });
      console.log("Marketplace verified on Polygonscan");
    } catch (err) {
      console.log("Marketplace verification failed:", err.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
