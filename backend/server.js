const express = require("express");
const cors = require("cors");
const { ethers } = require("ethers");
require("dotenv").config();

const contractAddresses = require("./contractAddresses.json");

// Load contract ABIs
const VendorRegistryABI = require("../contracts/artifacts/contracts/VendorRegistry.sol/VendorRegistry.json").abi;
const SupplyChainABI = require("../contracts/artifacts/contracts/SupplyChain.sol/SupplyChain.json").abi;
const PaymentABI = require("../contracts/artifacts/contracts/Payment.sol/Payment.json").abi;

const app = express();
app.use(cors());
app.use(express.json());

// Connect to local blockchain
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

// Use deployer account (Account #0 from hardhat node)
const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const signer = new ethers.Wallet(privateKey, provider);

// Connect to contracts
const vendorRegistry = new ethers.Contract(contractAddresses.VendorRegistry, VendorRegistryABI, signer);
const supplyChain = new ethers.Contract(contractAddresses.SupplyChain, SupplyChainABI, signer);
const payment = new ethers.Contract(contractAddresses.Payment, PaymentABI, signer);

// ============ VENDOR ROUTES ============

// Register a vendor
app.post("/api/vendors/register", async (req, res) => {
  try {
    const { name, location, walletAddress } = req.body;
    const tx = await vendorRegistry.registerVendor(name, location, walletAddress);
    await tx.wait();
    res.json({ success: true, message: "Vendor registered!", txHash: tx.hash });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a vendor
app.get("/api/vendors/:id", async (req, res) => {
  try {
    const vendor = await vendorRegistry.getVendor(req.params.id);
    res.json({
      id: vendor.id.toString(),
      name: vendor.name,
      location: vendor.location,
      isActive: vendor.isActive,
      walletAddress: vendor.walletAddress
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get vendor count
app.get("/api/vendors", async (req, res) => {
  try {
    const count = await vendorRegistry.vendorCount();
    const vendors = [];
    for (let i = 1; i <= count; i++) {
      const vendor = await vendorRegistry.getVendor(i);
      vendors.push({
        id: vendor.id.toString(),
        name: vendor.name,
        location: vendor.location,
        isActive: vendor.isActive,
        walletAddress: vendor.walletAddress
      });
    }
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ SUPPLY CHAIN ROUTES ============

// Create a product
app.post("/api/products/create", async (req, res) => {
  try {
    const { name, description, vendorId } = req.body;
    const tx = await supplyChain.createProduct(name, description, vendorId);
    await tx.wait();
    res.json({ success: true, message: "Product created!", txHash: tx.hash });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update product stage
app.post("/api/products/update-stage", async (req, res) => {
  try {
    const { productId, newStage, location, notes } = req.body;
    const tx = await supplyChain.updateStage(productId, newStage, location, notes);
    await tx.wait();
    res.json({ success: true, message: "Stage updated!", txHash: tx.hash });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all products
app.get("/api/products", async (req, res) => {
  try {
    const count = await supplyChain.productCount();
    const products = [];
    for (let i = 1; i <= count; i++) {
      const product = await supplyChain.getProduct(i);
      products.push({
        id: product.id.toString(),
        name: product.name,
        description: product.description,
        vendorId: product.vendorId.toString(),
        stage: product.stage.toString(),
        timestamp: product.timestamp.toString()
      });
    }
    res.json(products);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get product history
app.get("/api/products/:id/history", async (req, res) => {
  try {
    const history = await supplyChain.getProductHistory(req.params.id);
    const formatted = history.map(event => ({
      productId: event.productId.toString(),
      stage: event.stage.toString(),
      location: event.location,
      notes: event.notes,
      timestamp: event.timestamp.toString()
    }));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ PAYMENT ROUTES ============

// Create payment
app.post("/api/payments/create", async (req, res) => {
  try {
    const { productId, vendorId, vendorWallet, amountInEth } = req.body;
    const tx = await payment.createPayment(
      productId, vendorId, vendorWallet,
      { value: ethers.parseEther(amountInEth.toString()) }
    );
    await tx.wait();
    res.json({ success: true, message: "Payment created!", txHash: tx.hash });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Release payment
app.post("/api/payments/release/:id", async (req, res) => {
  try {
    const tx = await payment.releasePayment(req.params.id);
    await tx.wait();
    res.json({ success: true, message: "Payment released to vendor!", txHash: tx.hash });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all payments
app.get("/api/payments", async (req, res) => {
  try {
    const count = await payment.paymentCount();
    const payments = [];
    for (let i = 1; i <= count; i++) {
      const p = await payment.getPayment(i);
      payments.push({
        id: p.id.toString(),
        productId: p.productId.toString(),
        vendorId: p.vendorId.toString(),
        vendor: p.vendor,
        amount: ethers.formatEther(p.amount),
        status: p.status.toString(),
        createdAt: p.createdAt.toString()
      });
    }
    res.json(payments);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Connected to blockchain at http://127.0.0.1:8545`);
});