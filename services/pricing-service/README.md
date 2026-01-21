```bash
# Test API Health Check: curl http://localhost:8000/health
curl -X POST "http://localhost:8000/pricing/estimate" \
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

```command
Test API Pricing Service: uvicorn main:app --reload
```