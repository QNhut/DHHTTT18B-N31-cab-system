from fastapi import FastAPI

from src.surge_pricing import (
    PricingInput,
    PricingOutput,
    PricingService
)


app = FastAPI()
pricing_service = PricingService()


# ============== Endpoints ==============
@app.post("/pricing/estimate", response_model=PricingOutput)
async def estimate_price(input_data: PricingInput):
    """
    Tính giá chuyến đi dựa trên:
    - Loại xe (bike/car)
    - Khoảng cách (km)
    - Thời gian di chuyển (phút)
    - Mức độ demand (low/medium/high) -> surge multiplier
    """
    return await pricing_service.calculate_price(input_data)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "pricing-service"}