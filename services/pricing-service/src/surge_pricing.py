from pydantic import BaseModel
from datetime import datetime

class Location(BaseModel):
    lat: float
    lon: float

class PricingInput(BaseModel):
    pickup_location: Location
    destination_location: Location
    ride_type: str
    distance_km: float
    estimated_travel_time_minutes: int
    demand_level: str
    timestamp: datetime
    
class PricingBreakdown(BaseModel):
    base_fare: float
    distance_fare: float
    time_fare: float
    surge_multiplier: float
    
class PricingOutput(BaseModel):
    estimated_price: float
    pricing_breakdown: PricingBreakdown
    
PRICING_CONFIG = {
    "bike": {
        "base_fare": 10000,
        "per_km": 5000,
        "per_minute": 300
    },
    "car": {
        "base_fare": 20000,
        "per_km": 10000,
        "per_minute": 500
    }
}

SURGE_MAP = {
    "low": 1.0,
    "medium": 1.2,
    "high": 1.5
}

class PricingService:
    def __init__(self) -> None:
        self.pricing_config = PRICING_CONFIG
        self.surge_map = SURGE_MAP
    
    async def calculate_price(self, data: PricingInput) -> PricingOutput:
        config = self.pricing_config.get(data.ride_type)
        
        if not config:
            raise ValueError("Unsupported ride type")
        
        base_fare = config["base_fare"]
        distance_fare = data.distance_km * config["per_km"]
        time_fare = data.estimated_travel_time_minutes * config["per_minute"]
        
        surge_multiplier = self.surge_map.get(
            data.demand_level, 1.0
        )
        
        total_price = (
            base_fare + distance_fare + time_fare
        ) * surge_multiplier
        
        return PricingOutput(
            estimated_price=round(total_price, 3),
            pricing_breakdown = PricingBreakdown(
                base_fare=base_fare,
                distance_fare=distance_fare,
                time_fare=time_fare,
                surge_multiplier=surge_multiplier
            )
        )