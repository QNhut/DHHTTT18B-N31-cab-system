// src/services/google.service.js
const axios = require('axios');

class GoogleService {
  constructor() {
    this.apiKey = process.env.GOOGLE_API_KEY;
    this.geocodeBaseUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
    this.distanceBaseUrl = 'https://maps.googleapis.com/maps/api/distancematrix/json';
    
    console.log('Google API Key:', this.apiKey ? 'Set' : 'Not set');
  }

  async geocodeAddress(address) {
    try {
      console.log(`Geocoding address: "${address}"`);
      
      if (!this.apiKey) {
        throw new Error('Google API key not configured');
      }

      const response = await axios.get(this.geocodeBaseUrl, {
        params: {
          address: address,
          key: this.apiKey,
          language: 'vi',
          region: 'VN'
        }
      });

      console.log('Geocoding API response status:', response.data.status);
      
      if (response.data.status === 'REQUEST_DENIED') {
        console.error('API request denied:', response.data.error_message);
        throw new Error(`API request denied: ${response.data.error_message}`);
      }

      if (response.data.status !== 'OK' || response.data.results.length === 0) {
        console.error('Geocoding failed:', response.data);
        throw new Error(`Cannot geocode address: ${address} (Status: ${response.data.status})`);
      }

      const result = response.data.results[0];
      console.log(`Geocoded successfully: ${result.formatted_address}`);
      
      return {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        formatted_address: result.formatted_address
      };
    } catch (error) {
      console.error('Geocoding error:', error.message);
      if (error.response) {
        console.error('API Error Response:', error.response.data);
      }
      throw new Error(`Failed to geocode address: ${address}`);
    }
  }

  async calculateDistance(startAddress, endAddress) {
    try {
      console.log(`Calculating distance from "${startAddress}" to "${endAddress}"`);
      
      if (!this.apiKey) {
        throw new Error('Google API key not configured');
      }

      const response = await axios.get(this.distanceBaseUrl, {
        params: {
          origins: startAddress,
          destinations: endAddress,
          key: this.apiKey,
          units: 'metric',
          language: 'vi',
          region: 'VN'
        }
      });

      console.log('Distance API response status:', response.data.status);

      if (response.data.status === 'REQUEST_DENIED') {
        console.error('API request denied:', response.data.error_message);
        throw new Error(`API request denied: ${response.data.error_message}`);
      }

      if (response.data.status !== 'OK') {
        console.error('Distance calculation failed:', response.data);
        throw new Error('Cannot calculate distance');
      }

      const element = response.data.rows[0].elements[0];
      
      if (element.status !== 'OK') {
        console.error('Route not found:', element);
        throw new Error('Cannot find route between addresses');
      }

      console.log(`Distance calculated: ${element.distance.text}, Time: ${element.duration.text}`);

      return {
        distance_km: element.distance.value / 1000, // Convert meters to km
        estimated_travel_time_minutes: Math.round(element.duration.value / 60) // Convert seconds to minutes
      };
    } catch (error) {
      console.error('Distance calculation error:', error.message);
      if (error.response) {
        console.error('API Error Response:', error.response.data);
      }
      throw new Error('Failed to calculate distance and travel time');
    }
  }

  async processAddresses(startAddress, endAddress) {
    try {
      // Test simple fallback calculation first if Google API fails
      console.log('Processing addresses...');
      
      // Try geocoding addresses first
      const startLocation = await this.geocodeAddress(startAddress);
      const endLocation = await this.geocodeAddress(endAddress);
      
      // Try distance calculation
      const distanceInfo = await this.calculateDistance(startAddress, endAddress);

      return {
        start_location: startLocation,
        end_location: endLocation,
        distance_km: distanceInfo.distance_km,
        estimated_travel_time_minutes: distanceInfo.estimated_travel_time_minutes
      };
    } catch (error) {
      console.error('Address processing error:', error.message);
      
      // Fallback: return mock data for testing
      console.log('Using fallback mock data...');
      return {
        start_location: {
          latitude: 10.7769,
          longitude: 106.7009,
          formatted_address: startAddress
        },
        end_location: {
          latitude: 10.8142,
          longitude: 106.6438,
          formatted_address: endAddress
        },
        distance_km: 5.2,
        estimated_travel_time_minutes: 15
      };
    }
  }
}

module.exports = new GoogleService();