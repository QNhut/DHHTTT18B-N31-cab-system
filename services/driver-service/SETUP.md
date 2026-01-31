# Driver Service - Setup Guide

## Real-time GPS Tracking with WebSocket + Kafka + Redis Geo

---

## 📋 Prerequisites

- Node.js 16+ 
- Docker & Docker Compose
- PostgreSQL (optional - có docker-compose)
- Redis (optional - có docker-compose)
- Apache Kafka (optional - có docker-compose)

---

## 🚀 Quick Start

### Option 1: Docker Compose (Khuyến khích)

**1. Cài dependencies:**
```bash
npm install
```

**2. Chạy toàn bộ infrastructure + service:**
```bash
docker-compose up -d
```

**3. Verify service hoạt động:**
```bash
curl http://localhost:3003/drivers/health
```

**Kết quả mong đợi:**
```json
{
  "status": "ok",
  "service": "driver-service",
  "timestamp": "2026-01-27T10:30:00.000Z"
}
```

---

### Option 2: Local Setup (Manual)

**1. Cài dependencies:**
```bash
npm install
```

**2. Setup PostgreSQL (local):**
```sql
CREATE DATABASE cab_db;
-- Import schema từ file SQL (nếu có)
```

**3. Tạo .env file:**
```bash
cp .env.example .env
```

**4. Chỉnh sửa .env nếu cần (default localhost):**
```
PORT=3003
DATABASE_URL=postgres://user:password@localhost:5432/cab_db
JWT_SECRET=your_jwt_secret_key
REDIS_HOST=localhost
REDIS_PORT=6379
KAFKA_BROKERS=localhost:9092
```

**5. Khởi động service:**
```bash
npm start
```

---

## 🧪 Testing APIs

### 1. Ping Service (Health Check)
```bash
curl http://localhost:3003/drivers/health
```

### 2. Get Mock Driver Data
```bash
curl http://localhost:3003/drivers/mock
```

### 3. Real-time GPS Update (REST API)
```bash
curl -X POST http://localhost:3003/drivers/123/location/realtime \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer JWT_TOKEN" \
  -d '{
    "latitude": 10.762622,
    "longitude": 106.660172
  }'
```

### 4. Get Current Driver Location
```bash
curl http://localhost:3003/drivers/123/location \
  -H "Authorization: Bearer JWT_TOKEN"
```

### 5. Find Nearby Drivers (Geo-radius search)
```bash
curl "http://localhost:3003/drivers/search/nearby?latitude=10.762&longitude=106.660&radius=5"
```

---

## 🔌 WebSocket Testing

### Using Node.js:

```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3003');

// 1. Register driver
ws.on('open', () => {
  ws.send(JSON.stringify({
    type: 'register',
    driver_id: 123
  }));
});

// 2. Listen for responses
ws.on('message', (message) => {
  console.log('Server:', JSON.parse(message));
});

// 3. Send GPS updates every 2 seconds
setInterval(() => {
  ws.send(JSON.stringify({
    type: 'gps-update',
    latitude: 10.762622 + (Math.random() - 0.5) * 0.1,
    longitude: 106.660172 + (Math.random() - 0.5) * 0.1
  }));
}, 2000);
```

### Using Python:
```python
import websocket
import json
import time

ws = websocket.create_connection('ws://localhost:3003')

# Register
ws.send(json.dumps({'type': 'register', 'driver_id': 123}))
print("Response:", ws.recv())

# Send GPS updates
for i in range(10):
    ws.send(json.dumps({
        'type': 'gps-update',
        'latitude': 10.762622 + i * 0.001,
        'longitude': 106.660172 + i * 0.001
    }))
    print("ACK:", ws.recv())
    time.sleep(2)

ws.close()
```

---

## 📡 System Architecture

```
┌──────────────────────┐
│  Driver Mobile App   │  Gửi GPS liên tục (2-5s/lần)
└──────────┬───────────┘
           │
     ┌─────┴──────────────────────┐
     │                            │
  ┌──▼─────────┐          ┌──────▼────────┐
  │ REST API   │          │  WebSocket     │
  │ (POST)     │          │  (Real-time)   │
  └──┬─────────┘          └──────┬────────┘
     │                           │
     └─────────────┬─────────────┘
                   │
           ┌───────▼────────┐
           │ Driver Service │
           │ ┌────────────┐ │
           │ │PostgreSQL  │ │ Store driver data
           │ ├────────────┤ │
           │ │Redis Geo   │ │ Store GPS location
           │ ├────────────┤ │
           │ │Kafka       │ │ Push events
           │ └────────────┘ │
           └───────┬────────┘
                   │
     ┌─────────────┼──────────────┐
     │             │              │
  ┌──▼──┐  ┌──────▼──┐  ┌───────▼──┐
  │ DB  │  │ Geo     │  │ Kafka    │
  │ PG  │  │ Redis   │  │ Broker   │
  └─────┘  └─────────┘  └──────────┘
```

---

## 📁 Directory Structure

```
driver-service/
├── src/
│   ├── index.js                 # Entry point (Express + WebSocket)
│   ├── config/
│   │   ├── db.js               # PostgreSQL connection
│   │   ├── redis.js            # Redis client
│   │   └── kafka.js            # Kafka producer/consumer
│   ├── controllers/
│   │   └── driverController.js # API handlers
│   ├── models/
│   │   └── driverModel.js      # Database operations
│   ├── routes/
│   │   └── driverRoutes.js     # API routes
│   ├── middlewares/
│   │   └── auth.js             # JWT authentication
│   └── services/
│       ├── gpsService.js       # GPS tracking logic
│       ├── websocketService.js # WebSocket handler
│       └── kafkaService.js     # Kafka event handling
├── package.json
├── Dockerfile
├── docker-compose.yml          # Full stack
├── .env.example
├── API_DOCUMENTATION.md        # API reference
└── README.md
```

---

## 🔧 Configuration

### Environment Variables (.env)

```env
# Server
PORT=3003
NODE_ENV=development

# Database
DATABASE_URL=postgres://user:password@localhost:5432/cab_db

# Authentication
JWT_SECRET=your_jwt_secret_key_here

# Redis (GPS Storage)
REDIS_HOST=localhost
REDIS_PORT=6379

# Kafka (Event Broker)
KAFKA_BROKERS=localhost:9092
```

---

## 🐛 Troubleshooting

### Port 3003 đã được sử dụng
```bash
# Sửa PORT trong .env hoặc dùng cổng khác
PORT=3004 npm start

# Hoặc kill process đang dùng port
# Windows
netstat -ano | findstr :3003
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3003
kill -9 <PID>
```

### Không kết nối được PostgreSQL
```bash
# Check DATABASE_URL trong .env
# Verify PostgreSQL đang chạy

# Docker
docker-compose ps postgres

# Local
psql -U user -d cab_db -h localhost
```

### Redis connection error
```bash
# Verify Redis đang chạy
redis-cli ping

# Docker
docker-compose ps redis
```

### Kafka connection error
```bash
# Verify Kafka broker hoạt động
docker-compose logs kafka | tail -20

# Test connection
nc -zv localhost 9092
```

---

## 🚀 Production Deployment

### Using Docker Compose:
```bash
docker-compose -f docker-compose.yml up -d
```

### Environment Setup:
```bash
# Create .env.production
PORT=3003
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:prod_pass@prod_db:5432/cab_db
JWT_SECRET=strong_secret_key_production
REDIS_HOST=prod_redis_host
REDIS_PORT=6379
KAFKA_BROKERS=prod_kafka_brokers:9092
```

---

## 📞 Support

- Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API reference
- Check logs: `docker-compose logs -f driver-service`
- Check health: `curl http://localhost:3003/drivers/health`

---

## ✅ Checklist

- [ ] Node.js 16+ installed
- [ ] Docker & Docker Compose installed
- [ ] `npm install` completed
- [ ] `.env` file created (or using docker-compose)
- [ ] `docker-compose up -d` running
- [ ] `curl http://localhost:3003/drivers/health` returns 200 OK
- [ ] WebSocket connection test successful
- [ ] GPS update via REST API working
- [ ] Kafka events flowing
- [ ] Redis Geo storing locations
