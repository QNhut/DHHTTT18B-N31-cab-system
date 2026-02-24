# Pricing Service

Node.js microservice for calculating ride pricing in a ride-hailing application.

## Features

- Dynamic pricing based on ride type (bike/car)
- Distance and time-based pricing
- Surge pricing based on demand levels
- **Google API integration for address geocoding**
- **Automatic distance and travel time calculation**
- **Multi-ride type pricing comparison**
- Health check endpoint
- Error handling
- Backward compatibility with old API format

## Prerequisites

- Node.js (v14 or higher)
- Google API Key with Geocoding API and Distance Matrix API enabled

## Environment Setup

1. Get a Google API Key:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Geocoding API and Distance Matrix API
   - Create API Key

2. Update the `.env` file:
   ```bash
   GOOGLE_API_KEY=your_actual_google_api_key_here
   ```

## Installation

```bash
cd pricing_service
npm install
```

**Note**: After installation, make sure to set your Google API Key in the `.env` file.

## Running the Service

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The service will run on port 3001 by default.

## API Endpoints

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "service": "pricing-service",
  "timestamp": "2026-01-26T10:30:00.000Z"
}
```

### Price Estimation

**NEW FORMAT (Recommended)** - Get pricing for all ride types using addresses:
```
POST /pricing/estimate
```

Request body:
```json
{
  "start_address": "268 Lý Thường Kiệt, Quận 10, TP.HCM",
  "end_address": "Sân bay Tân Sơn Nhất, Quận Tân Bình, TP.HCM",
  "demand_level": "medium"
}
```

Response:
```json
{
  "pricing_options": {
    "bike": {
      "estimated_price": 35400,
      "currency": "VND",
      "pricing_breakdown": {
        "base_fare": 10000,
        "distance_fare": 26000,
        "time_fare": 4500,
        "surge_multiplier": 1.2
      }
    },
    "car": {
      "estimated_price": 94000,
      "currency": "VND",
      "pricing_breakdown": {
        "base_fare": 20000,
        "distance_fare": 52000,
        "time_fare": 7500,
        "surge_multiplier": 1.2
      }
    }
  },
  "trip_info": {
    "distance_km": 5.2,
    "estimated_travel_time_minutes": 15,
    "start_location": {
      "latitude": 10.7769,
      "longitude": 106.7009,
      "formatted_address": "268 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM"
    },
    "end_location": {
      "latitude": 10.8142,
      "longitude": 106.6438,
      "formatted_address": "Sân bay Quốc tế Tân Sơn Nhất, Quận Tân Bình, TP.HCM"
    }
  },
  "pricing_metadata": {
    "pricing_version": "v2",
    "surge_source": "rule",
    "confidence": 0.95,
    "google_api_used": true
  }
}
```

**OLD FORMAT** - Get pricing for specific ride type:
```
POST /pricing/estimate
```

Request body:
```json
{
  "ride_type": "car",
  "distance_km": 5.2,
  "estimated_travel_time_minutes": 15,
  "demand_level": "medium"
}
```

Response:
```json
{
  "estimated_price": 94000,
  "currency": "VND",
  "pricing_breakdown": {
    "base_fare": 20000,
    "distance_fare": 52000,
    "time_fare": 7500,
    "surge_multiplier": 1.2
  },
  "pricing_metadata": {
    "pricing_version": "v1",
    "surge_source": "rule",
    "confidence": 0.95
  }
}
```

## Ride Types

- `bike`: Base fare 10,000 VND, 5,000 VND/km, 300 VND/minute
- `car`: Base fare 20,000 VND, 10,000 VND/km, 500 VND/minute

## Demand Levels

- `low`: No surge (1.0x)
- `medium`: 1.2x surge multiplier
- `high`: 1.5x surge multiplier

## Testing

Test the API using the included test script:

```bash
node test-pricing-api.js
```

Or use curl:

```bash
# Health check
curl http://localhost:3001/health

# NEW FORMAT: Price estimation with addresses (all ride types)
curl -X POST http://localhost:3001/pricing/estimate \
  -H "Content-Type: application/json" \
  -d '{
    "start_address": "268 Lý Thường Kiệt, Quận 10, TP.HCM",
    "end_address": "Sân bay Tân Sơn Nhất, Quận Tân Bình, TP.HCM",
    "demand_level": "medium"
  }'

# OLD FORMAT: Price estimation with distance/time (specific ride type)
curl -X POST http://localhost:3001/pricing/estimate \
  -H "Content-Type: application/json" \
  -d '{"ride_type":"car","distance_km":5.2,"estimated_travel_time_minutes":15,"demand_level":"medium"}'
```

**Deploy trên Render**

```
# NEW FORMAT
curl -X POST https://pricing-service-mm9q.onrender.com/pricing/estimate \
  -H "Content-Type: application/json" \
  -d '{
    "start_address": "268 Lý Thường Kiệt, Quận 10, TP.HCM",
    "end_address": "Sân bay Tân Sơn Nhất, Quận Tân Bình, TP.HCM",
    "demand_level": "medium"
  }'

# OLD FORMAT
curl -X POST https://pricing-service-mm9q.onrender.com/pricing/estimate \
  -H "Content-Type: application/json" \
  -d '{
    "ride_type": "car",
    "distance_km": 5.2,
    "estimated_travel_time_minutes": 15,
    "demand_level": "medium"
  }'

Output: {"estimated_price":95400,"currency":"VND","pricing_breakdown":{"base_fare":20000,"distance_fare":52000,"time_fare":7500,"surge_multiplier":1.2},"pricing_metadata":{"pricing_version":"v1","surge_source":"rule","confidence":0.95}}
```

## API Test Commands

```bash
# Test API Health Check
curl http://localhost:3001/health

# Test API Pricing Service with coordinates
curl -X POST "http://localhost:3001/pricing/estimate" \
  -H "Content-Type: application/json" \
  -d '{
    "pickup_location": {"lat": 10.762622, "lon": 106.660172},
    "destination_location": {"lat": 10.773831, "lon": 106.704895},
    "ride_type": "car",
    "distance_km": 10,
    "estimated_travel_time_minutes": 30,
    "demand_level": "high",
    "timestamp": "2026-01-18T14:30:00"
  }'
```
