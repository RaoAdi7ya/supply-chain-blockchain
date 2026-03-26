import { writeFileSync } from "fs";
import hre from "hardhat";

async function main() {
  console.log("Starting deployment...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const VendorRegistry = await hre.ethers.getContractFactory("VendorRegistry");
  const vendorRegistry = await VendorRegistry.deploy();
  await vendorRegistry.waitForDeployment();
  const vendorAddress = await vendorRegistry.getAddress();
  console.log("VendorRegistry deployed to:", vendorAddress);

  const SupplyChain = await hre.ethers.getContractFactory("SupplyChain");
  const supplyChain = await SupplyChain.deploy();
  await supplyChain.waitForDeployment();
  const supplyAddress = await supplyChain.getAddress();
  console.log("SupplyChain deployed to:", supplyAddress);

  const Payment = await hre.ethers.getContractFactory("Payment");
  const payment = await Payment.deploy();
  await payment.waitForDeployment();
  const paymentAddress = await payment.getAddress();
  console.log("Payment deployed to:", paymentAddress);

  const addresses = {
    VendorRegistry: vendorAddress,
    SupplyChain: supplyAddress,
    Payment: paymentAddress,
    deployer: deployer.address
  };

  writeFileSync("../backend/contractAddresses.json", JSON.stringify(addresses, null, 2));
  console.log("Addresses saved!");
}

main().catch(console.error);
