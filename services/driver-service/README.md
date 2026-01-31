<<<<<<< HEAD
## 1. node driver-service/src/index.js

## 2. curl http://localhost:3003/drivers/mock
=======
﻿# Driver Service

Node.js microservice for managing drivers in a ride-hailing application.

## Installation & Running

```bash
cd driver-service
npm install
npm start
```

The service runs on port 3003 by default.

## API Endpoints

### Health Check / Test Endpoints

#### Test Service Status
```
GET /drivers/test
```

Response:
```json
{
  "message": "Driver service is working"
}
```

#### Mock Driver Data (for frontend testing)
```
GET /drivers/mock
```

Response:
```json
{
  "driver_id": "driver_001",
  "name": "Nguyen Van A",
  "phone": "0912345678",
  "email": "driver@example.com",
  "vehicle_type": "car",
  "license_plate": "29A-12345",
  "current_location": {
    "latitude": 21.0285,
    "longitude": 105.8542
  },
  "rating": 4.8,
  "status": "active"
}
```

### Register Driver

```
POST /drivers/
Authorization: Bearer <JWT_TOKEN>
```

Request body:
```json
{
  "name": "Nguyen Van B",
  "phone": "0987654321",
  "email": "driver2@example.com",
  "vehicle_type": "car",
  "license_plate": "29B-54321"
}
```

Response:
```json
{
  "driver_id": "driver_002",
  "name": "Nguyen Van B",
  "phone": "0987654321",
  "email": "driver2@example.com",
  "vehicle_type": "car",
  "license_plate": "29B-54321",
  "created_at": "2026-01-28T10:30:00.000Z"
}
```

### Get Driver Information

```
GET /drivers/:id
Authorization: Bearer <JWT_TOKEN>
```

Response:
```json
{
  "driver_id": "driver_001",
  "name": "Nguyen Van A",
  "phone": "0912345678",
  "email": "driver@example.com",
  "vehicle_type": "car",
  "license_plate": "29A-12345",
  "current_location": {
    "latitude": 21.0285,
    "longitude": 105.8542
  },
  "rating": 4.8,
  "status": "active",
  "created_at": "2026-01-20T08:00:00.000Z"
}
```

### Update Driver Information

```
PUT /drivers/:id
Authorization: Bearer <JWT_TOKEN>
```

Request body:
```json
{
  "name": "Nguyen Van A Updated",
  "phone": "0912345678",
  "email": "updated@example.com"
}
```

Response:
```json
{
  "driver_id": "driver_001",
  "name": "Nguyen Van A Updated",
  "phone": "0912345678",
  "email": "updated@example.com",
  "vehicle_type": "car",
  "license_plate": "29A-12345",
  "updated_at": "2026-01-28T10:30:00.000Z"
}
```

### Update Driver Location

```
PUT /drivers/:id/location
Authorization: Bearer <JWT_TOKEN>
```

Request body:
```json
{
  "latitude": 21.0365,
  "longitude": 105.7845
}
```

Response:
```json
{
  "driver_id": "driver_001",
  "current_location": {
    "latitude": 21.0365,
    "longitude": 105.7845
  },
  "updated_at": "2026-01-28T10:35:00.000Z"
}
```

## Testing

### Test the API using curl

#### 1. Test service status
```bash
curl http://localhost:3003/drivers/test
```

#### 2. Get mock driver data
```bash
curl http://localhost:3003/drivers/mock
```

#### 3. Register a driver
```bash
curl -X POST http://localhost:3003/drivers/test-register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tran Van C",
    "phone": "0998765432",
    "email": "driver3@example.com",
    "vehicle_type": "bike",
    "license_plate": "29C-98765"
  }'
```

#### 4. Get driver information
```bash
curl http://localhost:3003/drivers/test-get/driver_001
```

#### 5. Update driver information
```bash
curl -X PUT http://localhost:3003/drivers/test-update/driver_001 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyen Van A Updated",
    "email": "driver@updated.com"
  }'
```

#### 6. Update driver location
```bash
curl -X PUT http://localhost:3003/drivers/test-location/driver_001 \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 21.0365,
    "longitude": 105.7845
  }'
```

>>>>>>> main
