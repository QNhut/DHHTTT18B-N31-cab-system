// src/routes/pricing.route.js
const express = require("express");
const router = express.Router();
const pricingService = require("../services/pricing.service");

// Validation middleware
const validateEstimateInput = (req, res, next) => {
  const { body } = req;
  
  // New format: addresses
  if (body.start_address && body.end_address) {
    if (!body.demand_level) {
      return res.status(400).json({
        error: "Missing required field: demand_level"
      });
    }
    return next();
  }
  
  // Old format: distance and time
  if (body.ride_type && body.distance_km && body.estimated_travel_time_minutes) {
    if (!body.demand_level) {
      return res.status(400).json({
        error: "Missing required field: demand_level"
      });
    }
    return next();
  }
  
  return res.status(400).json({
    error: "Invalid input. Provide either (start_address, end_address, demand_level) or (ride_type, distance_km, estimated_travel_time_minutes, demand_level)"
  });
};

router.post("/estimate", validateEstimateInput, async (req, res) => {
  try {
    let result;
    
    // New format: addresses - return pricing for all ride types
    if (req.body.start_address && req.body.end_address) {
      result = await pricingService.calculatePriceFromAddresses(req.body);
    } 
    // Old format: distance and time - return pricing for specific ride type
    else {
      result = pricingService.calculatePrice(req.body);
    }
    
    res.json(result);
  } catch (err) {
    console.error('Pricing error:', err.message);
    res.status(400).json({
      error: err.message,
    });
  }
});

module.exports = router;
