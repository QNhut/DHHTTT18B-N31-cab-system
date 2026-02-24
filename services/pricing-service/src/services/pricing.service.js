// src/services/pricing.service.js
const { PRICING_CONFIG, SURGE_MAP } = require("../config/pricing.config");
const googleService = require('./google.service');

class PricingService {
  calculatePriceForRideType(rideType, distance_km, estimated_travel_time_minutes, demand_level) {
    const config = PRICING_CONFIG[rideType];

    if (!config) {
      throw new Error(`Unsupported ride type: ${rideType}`);
    }

    const baseFare = config.baseFare;
    const distanceFare = distance_km * config.perKm;
    const timeFare = estimated_travel_time_minutes * config.perMinute;

    const surgeMultiplier = SURGE_MAP[demand_level] ?? 1.0;

    const totalPrice = (baseFare + distanceFare + timeFare) * surgeMultiplier;

    return {
      estimated_price: Math.round(totalPrice),
      currency: "VND",
      pricing_breakdown: {
        base_fare: baseFare,
        distance_fare: Math.round(distanceFare),
        time_fare: Math.round(timeFare),
        surge_multiplier: surgeMultiplier,
      }
    };
  }

  async calculatePriceFromAddresses(input) {
    try {
      // Process addresses with Google API
      const tripInfo = await googleService.processAddresses(
        input.start_address,
        input.end_address
      );

      // Calculate pricing for all ride types
      const pricing_options = {};
      const rideTypes = Object.keys(PRICING_CONFIG);

      rideTypes.forEach(rideType => {
        pricing_options[rideType] = this.calculatePriceForRideType(
          rideType,
          tripInfo.distance_km,
          tripInfo.estimated_travel_time_minutes,
          input.demand_level
        );
      });

      return {
        pricing_options,
        trip_info: tripInfo,
        pricing_metadata: {
          pricing_version: "v2",
          surge_source: "rule",
          confidence: 0.95,
          google_api_used: true
        }
      };
    } catch (error) {
      console.error('Pricing calculation error:', error.message);
      throw error;
    }
  }

  // Keep old method for backward compatibility
  calculatePrice(input) {
    const config = PRICING_CONFIG[input.ride_type];

    if (!config) {
      throw new Error("Unsupported ride type");
    }

    const baseFare = config.baseFare;
    const distanceFare = input.distance_km * config.perKm;
    const timeFare = input.estimated_travel_time_minutes * config.perMinute;

    const surgeMultiplier = SURGE_MAP[input.demand_level] ?? 1.0;

    const totalPrice = (baseFare + distanceFare + timeFare) * surgeMultiplier;

    return {
      estimated_price: Math.round(totalPrice),
      currency: "VND",
      pricing_breakdown: {
        base_fare: baseFare,
        distance_fare: distanceFare,
        time_fare: timeFare,
        surge_multiplier: surgeMultiplier,
      },
      pricing_metadata: {
        pricing_version: "v1",
        surge_source: "rule",
        confidence: 0.95,
      },
    };
  }
}

module.exports = new PricingService();
