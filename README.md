# 🐔 FarmGo - Nền Tảng SaaS Quản Lý Trại Gà Hộ Nông Nghiệp Việt Nam

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen.svg)](https://nodejs.org/)
[![pnpm Version](https://img.shields.io/badge/pnpm-%3E%3D9.0.0-orange.svg)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20Neon-00e599.svg)](https://neon.tech/)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel%20%2B%20Render-black.svg)](https://vercel.com/)
[![Tests](https://img.shields.io/badge/Tests-13%2F13%20passed-success.svg)](https://vitest.dev/)
[![Repository](https://img.shields.io/badge/GitHub-hienvanla5%2FMy--FarmGo-181717.svg?logo=github)](https://github.com/hienvanla5/My-FarmGo)

Ứng dụng SaaS di động tinh gọn (mobile-first) giúp các hộ nông dân và trang trại chăn nuôi gia cầm tại Việt Nam số hóa 100% quy trình chăn nuôi gà từ lúc nhập giống đến khi xuất chuồng.

🔗 **Mã nguồn GitHub**: [https://github.com/hienvanla5/My-FarmGo](https://github.com/hienvanla5/My-FarmGo)

---

## 🌐 KIẾN TRÚC TRIỂN KHAI PRODUCTION (CHI PHÍ 0Đ / THÁNG)

Hệ thống được thiết kế tối ưu hóa 100% trên các nền tảng Cloud Free Tier hàng đầu thế giới:

- **Frontend**: Triển khai trên **Vercel** hoặc **Netlify** (React 19 + Vite SPA, Edge CDN toàn cầu, HTTPS tự động miễn phí).
- **Backend API**: Triển khai trên **Render** Web Service (Node.js 20 + Express + TypeScript, kèm cơ chế Keep-alive Ping chống Cold Start tự động).
- **Database**: Sử dụng **Neon Serverless PostgreSQL** (0.5 GB lưu trữ miễn phí, tự động backup, mở rộng tức thì).
- **CI/CD**: Sử dụng **GitHub Actions** tự động kiểm thử, build và kích hoạt deploy khi push code lên nhánh `main`.

| Thành phần | Nền tảng đề xuất | Giới hạn Free Tier | Chi phí |
| :--- | :--- | :--- | :--- |
| **Frontend** | **[Vercel](https://vercel.com)** / **[Netlify](https://netlify.com)** | 100 GB băng thông / tháng, Unlimited Requests | **0 đ** |
| **Backend API** | **[Render](https://render.com)** / **[Railway](https://railway.app)** | 750 giờ compute / tháng (chạy đủ 24/7 cho 1 web service) | **0 đ** |
| **Database** | **[Neon](https://neon.tech)** / **[Supabase](https://supabase.com)** | 0.5 GB - 500 MB Postgres (đủ lưu hàng triệu bản ghi trại gà) | **0 đ** |
| **CI/CD** | **[GitHub Actions](https://github.com)** | 2.000 phút build / tháng | **0 đ** |
| **Anti-Cold Sleep** | **[Keep-Alive Action](.github/workflows/keepalive.yml)** / **[UptimeRobot](https://uptimerobot.com)** | Ping định kỳ mỗi 10 phút để backend luôn thức | **0 đ** |

---

## 🌟 TÍNH NĂNG NỔI BẬT

### 1. 🐣 Quản lý lứa nuôi (Batch Management)
- Tạo lứa nuôi với thông tin giống gà, số lượng, ngày nhập đàn, giá giống.
- Tự động tính toán: Số ngày tuổi, tỷ lệ sống (%), hao hụt, FCR, tổng chi phí, doanh thu và lợi nhuận ròng.
- Dòng thời gian sự kiện: Nhập đàn, cân mẫu trọng lượng, xuất bán, chia đàn, ghi nhận hao hụt.

### 2. 💉 Nhắc lịch tiêm vaccine chuẩn Thú y Việt Nam
- **Thư viện vaccine chuẩn**: Marek, Newcastle (Lasota), Gumboro, Đậu gà, Viêm phế quản truyền nhiễm (IB), Cúm gia cầm H5N1, Tụ huyết trùng...
- **Tự động sinh toàn bộ lịch tiêm phòng** ngay khi tạo lứa nuôi dựa theo số ngày tuổi.
- Đánh dấu hoàn thành 1-chạm: Tự động hạch toán chi phí vaccine vào sổ thu chi.

### 3. 🌾 Quản lý thức ăn & Tối ưu chỉ số FCR
- Quản lý tồn kho cám (Cám úm, Cám tăng trưởng, Cám vỗ béo).
- Dự báo số ngày còn lại đến khi hết cám và cảnh báo nhập hàng.
- **Phân tích FCR tự động**: So sánh FCR thực tế với định mức chuẩn của từng giống gà Việt Nam.

### 4. 💰 Quản lý thu chi & Báo cáo tài chính (P&L)
- Ghi nhận chi tiết mọi khoản thu (bán gà thịt, bán trứng, phân gà...) và khoản chi (giống, cám, vaccine, điện nước, trấu...).
- Báo cáo lợi nhuận ròng, ROI, điểm hòa vốn (VNĐ/kg thịt).
- Biểu đồ cơ cấu chi phí (Pie Chart) và xu hướng dòng tiền (Bar Chart).
- **Xuất Báo Cáo PDF Chuyên Nghiệp** chỉ với 1 click.

### 5. 🩺 Theo dõi sức khỏe & Cảnh báo ngưng thuốc kháng sinh
- Nhật ký hao hụt và ghi nhận triệu chứng bệnh hàng ngày.
- **Cảnh báo thời gian ngưng thuốc kháng sinh (Withdrawal Period)**: Đồng hồ đếm ngược an toàn thực phẩm, bảo vệ người tiêu dùng trước khi xuất bán.
- Cẩm nang nhận diện và phác đồ điều trị các bệnh phổ biến (Cầu trùng, Hen khẹc CRD, Gumboro, Newcastle, E.coli).

### 6. 🤖 Trợ lý AI & Bảng giá thị trường
- **Chatbot AI Chuyên gia chăn nuôi**: Tư vấn kỹ thuật úm, phối trộn thức ăn, xử lý bệnh gà 24/7.
- **Dự báo thời điểm vàng xuất bán (Golden Harvest Window)**: Phân tích tăng trọng và giá thị trường để tìm ngày xuất chuồng mang lại lợi nhuận cao nhất.
- Bảng giá gia cầm 3 miền (Bắc, Trung, Nam) cập nhật hàng ngày.

### 7. 👑 Hệ thống SaaS & Cổng thanh toán VietQR
- 3 gói dịch vụ: **Nông Dân (Miễn phí)**, **Nông Hộ (49.000đ/tháng)**, **Trang Trại VIP (99.000đ/tháng)**.
- Tích hợp thanh toán quét mã **VietQR** tự động kích hoạt tức thì.

---

## 🛠️ HƯỚNG DẪN TRIỂN KHAI PRODUCTION (STEP-BY-STEP)

### BƯỚC 1: Tạo Database PostgreSQL Miễn Phí trên Neon.tech
1. Đăng ký tài khoản miễn phí tại **[https://neon.tech](https://neon.tech)** (đăng nhập nhanh bằng GitHub).
2. Tạo một Project mới (Ví dụ: `farmgo-db`), chọn Region **Singapore (ap-southeast-1)** để có tốc độ cao nhất về Việt Nam.
3. Sao chép chuỗi kết nối **Connection String** dạng:
   ```
   postgresql://neondb_owner:YOUR_PASSWORD@ep-sample-12345.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

---

### BƯỚC 2: Deploy Backend lên Render.com (Miễn phí 100%)

#### Cách 1: 1-Click Deploy với Render Blueprint (Khuyên dùng)
Dự án đã có sẵn file `render.yaml`. Bạn chỉ cần:
1. Đăng nhập **[https://render.com](https://render.com)** bằng GitHub.
2. Chọn **Blueprints** -> **New Blueprint Instance**.
3. Chọn repository `hienvanla5/My-FarmGo`.
4. Điền biến môi trường `DATABASE_URL` lấy từ Neon ở Bước 1.
5. Nhấn **Apply**. Render sẽ tự động build và cấp URL backend (ví dụ: `https://farmgo-backend.onrender.com`).

#### Cách 2: Tạo Web Service thủ công trên Render
1. Chọn **New +** -> **Web Service** -> Chọn repository `hienvanla5/My-FarmGo`.
2. Cấu hình thông số:
   - **Language**: `Node`
   - **Build Command**: `pnpm --filter farmgo-shared build && pnpm --filter farmgo-backend build`
   - **Start Command**: `pnpm --filter farmgo-backend start`
   - **Plan**: `Free`
   - **Region**: `Singapore`
3. Thêm các **Environment Variables**:
   | Key | Value | Ghi chú |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Môi trường production |
   | `PORT` | `10000` | Cổng Render |
   | `JWT_SECRET` | `your_random_secret_string_32_chars` | Khóa bí mật JWT |
   | `CORS_ORIGIN` | `*` | Cho phép Frontend gọi API |
   | `DATABASE_URL` | `postgresql://...neon.tech/neondb?sslmode=require` | Chuỗi kết nối Neon ở Bước 1 |
4. Nhấn **Create Web Service**.

---

### BƯỚC 3: Deploy Frontend lên Vercel (Miễn phí 100%)
1. Đăng nhập **[https://vercel.com](https://vercel.com)** bằng GitHub.
2. Chọn **Add New...** -> **Project** -> Import repository `hienvanla5/My-FarmGo`.
3. Cấu hình Project:
   - **Framework Preset**: `Vite`
   - **Build Command**: `pnpm --filter farmgo-shared build && pnpm --filter farmgo-frontend build`
   - **Output Directory**: `frontend/dist`
4. Thêm **Environment Variable**:
   - **Key**: `VITE_API_URL`
   - **Value**: URL backend vừa tạo ở Bước 2 (ví dụ: `https://farmgo-backend.onrender.com`)
5. Nhấn **Deploy**. Vercel sẽ tự động build và cung cấp domain miễn phí (ví dụ: `https://farmgo.vercel.app`).

---

### BƯỚC 4: Chạy Database Migration & Khởi tạo Dữ liệu mẫu (Nếu cần)
Backend FarmGo được tích hợp cơ chế **Auto-Migration** & **Auto-Seed**: Khi khởi động lần đầu tiên kết nối vào PostgreSQL Neon, hệ thống sẽ tự động tạo toàn bộ bảng và nạp sẵn dữ liệu giống gà chuẩn Việt Nam.

Nếu muốn chủ động chạy migration từ máy tính hoặc terminal:
```bash
# Đặt DATABASE_URL trong file .env hoặc command line
DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require" pnpm db:migrate
```

---

### BƯỚC 5: Thiết lập CI/CD & Chống ngủ đông (Keep-Alive)
1. Trong GitHub repository (`Settings` -> `Secrets and variables` -> `Actions`):
   - Thêm Secret `BACKEND_PRODUCTION_URL`: Điền URL healthcheck (ví dụ: `https://farmgo-backend.onrender.com/api/health`).
   - Thêm Secret `RENDER_DEPLOY_HOOK_URL` (Lấy từ Render Web Service -> Settings -> Deploy Hook) để tự động deploy mỗi khi push code lên nhánh `main`.
2. Workflow `.github/workflows/keepalive.yml` sẽ tự động chạy mỗi 10 phút một lần để ping backend, đảm bảo backend **hoạt động 24/7 mà không bị sleep (Zero Cold Start)**.

---

## 💻 HƯỚNG DẪN CHẠY LOCAL (DEVELOPMENT)

### Yêu cầu môi trường
- **Node.js**: >= 20.0.0
- **pnpm**: >= 9.0.0

### 1. Cài đặt dependencies
```bash
pnpm install
```

### 2. Chạy kiểm thử tự động (Unit & Integration Tests)
```bash
pnpm test
```
*Toàn bộ 13/13 test cases đều pass thành công.*

### 3. Build toàn bộ dự án
```bash
pnpm build
```

### 4. Chạy môi trường phát triển (Dev Mode)
```bash
# Chạy đồng thời cả Backend và Frontend
pnpm dev

# Hoặc chạy từng service riêng biệt:
pnpm dev:backend   # API chạy tại http://localhost:3001
pnpm dev:frontend  # Web App chạy tại http://localhost:5173
```

---

## 🐳 TRIỂN KHAI BẰNG DOCKER

Dự án có sẵn multi-stage `Dockerfile` tối ưu dung lượng:

```bash
# 1. Build Docker image
docker build -t farmgo-backend .

# 2. Chạy container với PostgreSQL
docker run -d -p 3001:3001 \
  -e NODE_ENV=production \
  -e PORT=3001 \
  -e JWT_SECRET=my_secret_key \
  -e DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require" \
  --name farmgo-api farmgo-backend
```

---

## 📁 CẤU TRÚC THƯ MỤC DỰ ÁN

```
farmgo/
├── .github/
│   └── workflows/
│       ├── deploy.yml         # CI/CD Pipeline tự động test, build, deploy
│       └── keepalive.yml      # Cron job ping 10 phút/lần chống sleep Render
├── shared/                    # Thư viện TypeScript dùng chung
│   ├── src/types.ts           # Định nghĩa Model & Schema dữ liệu
│   ├── src/constants.ts       # Giống gà VN, Thư viện vaccine, Cẩm nang bệnh
│   └── src/index.ts
├── backend/                   # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── db/
│   │   │   ├── schema.sql     # PostgreSQL Schema DDL chuẩn
│   │   │   ├── postgres.ts    # Neon/Postgres Connection Pool & Auto-Sync
│   │   │   ├── storage.ts     # Unified Database Access Layer
│   │   │   └── migrate.ts     # CLI Migration Script
│   │   ├── services/          # Business logic các phân hệ
│   │   ├── routes/            # REST API Routes (/api/v1/...)
│   │   ├── app.ts             # Express App & Production CORS
│   │   └── index.ts           # Server bootstrap
│   └── test/backend.test.ts   # 13 Vitest Unit & Supertest Integration Tests
├── frontend/                  # React 19 + Vite + Tailwind CSS Frontend
│   ├── src/
│   │   ├── components/        # UI Modules (Lứa nuôi, Vaccine, Cám, Thu chi, AI, VietQR, PDF...)
│   │   ├── context/           # React Context state management
│   │   └── services/api.ts    # Type-safe API Client hỗ trợ VITE_API_URL
│   ├── vercel.json            # Cấu hình SPA routing rewrite trên Vercel
│   └── vite.config.ts
├── Dockerfile                 # Multi-stage Docker build tối ưu
├── render.yaml                # 1-Click Render Blueprint
├── vercel.json                # Vercel Monorepo deployment config
├── netlify.toml               # Netlify configuration
├── .env.example               # File mẫu biến môi trường
└── README.md                  # Hướng dẫn chi tiết
```

---

## 📄 GIẤY PHÉP (LICENSE)

Dự án được phân phối dưới giấy phép **MIT License**. Xem file [`LICENSE`](./LICENSE) để biết thêm thông tin chi tiết.

---

*Phát triển bởi đội ngũ kỹ sư FarmGo Vietnam.*
