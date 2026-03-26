const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Starting deployment...");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy VendorRegistry
  console.log("\n📋 Deploying VendorRegistry...");
  const VendorRegistry = await ethers.getContractFactory("VendorRegistry");
  const vendorRegistry = await VendorRegistry.deploy();
  await vendorRegistry.waitForDeployment();
  const vendorAddress = await vendorRegistry.getAddress();
  console.log("✅ VendorRegistry deployed to:", vendorAddress);

  // Deploy SupplyChain
  console.log("\n📦 Deploying SupplyChain...");
  const SupplyChain = await ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChain.deploy();
  await supplyChain.waitForDeployment();
  const supplyAddress = await supplyChain.getAddress();
  console.log("✅ SupplyChain deployed to:", supplyAddress);

  // Deploy Payment
  console.log("\n💰 Deploying Payment...");
  const Payment = await ethers.getContractFactory("Payment");
  const payment = await Payment.deploy();
  await payment.waitForDeployment();
  const paymentAddress = await payment.getAddress();
  console.log("✅ Payment deployed to:", paymentAddress);

  const addresses = {
    VendorRegistry: vendorAddress,
    SupplyChain: supplyAddress,
    Payment: paymentAddress,
    deployer: deployer.address
  };

  console.log("\n🎉 All contracts deployed!");
  console.log(addresses);

  fs.writeFileSync(
    "../backend/contractAddresses.json",
    JSON.stringify(addresses, null, 2)
  );
  console.log("✅ Addresses saved to backend/contractAddresses.json");
}

main().catch(console.error);