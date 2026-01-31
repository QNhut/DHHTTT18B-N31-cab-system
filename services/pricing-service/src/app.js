// src/app.js
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const pricingRoute = require("./routes/pricing.route");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "pricing-service",
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use("/pricing", pricingRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Internal server error",
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found"
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚕 Pricing Service running on port ${PORT}`);
});
