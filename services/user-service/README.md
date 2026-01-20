# User Service

Dịch vụ quản lý User cho hệ thống CAB-BOOKING-SYSTEM.  
Cung cấp API CRUD để tạo, đọc, cập nhật, xóa thông tin người dùng.

---

## Công nghệ sử dụng

- Node.js v24+
- Express.js
- Prisma ORM
- PostgreSQL (Docker)
- dotenv

---

## Cấu trúc dự án

user-service/
│
├─ src/
│ ├─ controllers/ # Controller xử lý logic API
│ ├─ routes/ # Định nghĩa các route API
│ ├─ app.js # Khởi tạo Express app
│ └─ server.js # Khởi động server
│
├─ prisma/
│ └─ schema.prisma # Prisma schema
│
├─ .env.example # Ví dụ file môi trường
├─ package.json
└─ prisma.config.js # Khởi tạo Prisma client

---

## Yêu cầu

- Node.js v24+
- Docker (nếu muốn chạy PostgreSQL bằng container)

---

## Cài đặt và chạy

### 1. Clone project

```bash
git clone <repo-url>
cd services/user-service

### 2. Cài đặt dependencies
npm install

### 3. Thiết lập biến môi trường
Nội dung .env:
DATABASE_URL="postgresql://cab_user:cab_pass@localhost:5432/cab_booking"
PORT=3001

### 4.Khởi động database PostgreSQL (Docker)
docker run -d \
  --name user-service-postgres \
  -e POSTGRES_DB=cab_booking \
  -e POSTGRES_USER=cab_user \
  -e POSTGRES_PASSWORD=cab_pass \
  -p 5432:5432 \
  postgres:15

### 5. Chạy migration để tạo bảng
npx prisma migrate dev --name init

### 6. Chạy server
| Method | Endpoint   | Mô tả                      |
| ------ | ---------- | -------------------------- |
| GET    | /users     | Lấy danh sách tất cả users |
| GET    | /users/:id | Lấy user theo ID           |
| POST   | /users     | Tạo user mới               |
| PUT    | /users/:id | Cập nhật user              |
| DELETE | /users/:id | Xóa user                   |

## Ví dụ tạo user bằng PowerShell:
$headers = @{ "Content-Type" = "application/json" }
$body = @{
    name  = "Thanh Phi"
    email = "thanhphi@example.com"
    phone = "0123456789"
    role  = "admin"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/users" -Method Post -Headers $headers -Body $body

## Ví dụ lấy danh sách user:
Invoke-RestMethod -Uri "http://localhost:3001/users" -Method Get
```
