// src/config/pricing.config.js
module.exports = {
  PRICING_CONFIG: {
    bike: {
      baseFare: 10000,
      perKm: 5000,
      perMinute: 300,
    },
    car: {
      baseFare: 20000,
      perKm: 10000,
      perMinute: 500,
    },
  },

  SURGE_MAP: {
    low: 1.0,
    medium: 1.2,
    high: 1.5,
  },
};
