# 🐔 FarmGo - Nền Tảng SaaS Quản Lý Trại Gà Hộ Nông Nghiệp Việt Nam

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![pnpm Version](https://img.shields.io/badge/pnpm-%3E%3D9.0.0-orange.svg)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7+-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![Tests](https://img.shields.io/badge/Tests-10%2F10%20passed-success.svg)](https://vitest.dev/)
[![Repository](https://img.shields.io/badge/GitHub-hienvanla5%2FMy--FarmGo-181717.svg?logo=github)](https://github.com/hienvanla5/My-FarmGo)

Ứng dụng di động tinh gọn (mobile-first) giúp các hộ nông dân và trang trại chăn nuôi gia cầm tại Việt Nam số hóa 100% quy trình chăn nuôi gà từ lúc nhập giống đến khi xuất chuồng.

🔗 **GitHub Repository**: [https://github.com/hienvanla5/My-FarmGo](https://github.com/hienvanla5/My-FarmGo.git)

---

## 🌟 TÍNH NĂNG NỔI BẬT

### 1. 🐣 Quản lý lứa nuôi (Batch Management)
- Tạo lứa nuôi với đầy đủ thông tin: giống gà, số lượng, ngày nhập, nguồn gốc giống, giá giống.
- Tự động tính toán: Số ngày tuổi, tỷ lệ sống (%), hao hụt, FCR, tổng chi phí, doanh thu và lợi nhuận ròng.
- Dòng thời gian sự kiện: Nhập đàn, cân mẫu trọng lượng, xuất bán, chia đàn, ghi nhận hao hụt.
- Hỗ trợ quản lý nhiều lứa nuôi và nhiều khu chuồng/trang trại song song.

### 2. 💉 Nhắc lịch tiêm vaccine chuẩn Việt Nam (Vaccine Reminder)
- **Thư viện vaccine chuẩn thú y Việt Nam**: Marek, Newcastle lần 1 (Lasota), Gumboro lần 1, Đậu gà, Gumboro lần 2, Newcastle lần 2, Viêm phế quản truyền nhiễm (IB), Cúm gia cầm H5N1, Tụ huyết trùng, Newcastle Hệ 1.
- **Tự động sinh toàn bộ lịch tiêm phòng** ngay khi tạo lứa nuôi mới dựa trên ngày bắt đầu vào chuồng.
- Nhắc nhở trực quan: Đến hạn hôm nay, sắp tới (3 ngày), quá hạn, đã hoàn thành.
- Đánh dấu hoàn thành 1-chạm: Tự động ghi nhận chi phí vaccine vào sổ tài chính.

### 3. 🌾 Quản lý thức ăn & Tối ưu FCR (Feed & FCR Optimization)
- Quản lý tồn kho cám chi tiết theo từng loại (Cám úm 1-21 ngày, Cám tăng trưởng 22-60 ngày, Cám vỗ béo).
- Dự báo số ngày còn lại đến khi hết cám và cảnh báo nhập hàng thông minh.
- **Phân tích FCR tự động**: So sánh FCR thực tế với định mức chuẩn của từng giống gà Việt Nam.
- Cảnh báo FCR bất thường khi gà bị phân sống hoặc lãng phí cám, kèm theo hướng dẫn khắc phục cụ thể.

### 4. 💰 Quản lý thu chi & Báo cáo tài chính (Finance & P&L)
- Ghi nhận chi tiết mọi khoản thu (Bán gà thịt, bán trứng, bán phân gà...) và khoản chi (Con giống, cám, vaccine, thuốc thú y, điện nước, trấu...).
- Báo cáo lợi nhuận, ROI, điểm hòa vốn (VNĐ/kg thịt).
- Biểu đồ trực quan: Cơ cấu chi phí chăn nuôi (Pie Chart), xu hướng dòng tiền theo tháng (Bar Chart).
- **Xuất Báo Cáo PDF Chuyên Nghiệp**: Bản in chi tiết gửi kế toán hoặc cán bộ khuyến nông.

### 5. 🩺 Theo dõi sức khỏe & Cảnh báo ngưng thuốc (Health & Food Safety)
- Nhật ký hao hụt và ghi nhận triệu chứng bệnh hàng ngày.
- **Cảnh báo thời gian ngưng thuốc kháng sinh (Withdrawal Period)**: Đồng hồ đếm ngược an toàn thực phẩm, bảo vệ người tiêu dùng và tránh vi phạm tồn dư kháng sinh trước khi xuất bán.
- Cẩm nang nhận diện và phác đồ điều trị các bệnh phổ biến (Cầu trùng, Hen khẹc CRD, Gumboro, Newcastle, E.coli).

### 6. 🤖 Trợ lý AI & Bảng giá thị trường (AI Advisor & Market Prices)
- **Chatbot AI Chuyên gia chăn nuôi**: Tư vấn kỹ thuật úm, phối trộn thức ăn, xử lý bệnh gà 24/7.
- **Dự báo thời điểm vàng xuất bán (Golden Harvest Window)**: Phân tích tăng trọng và giá thị trường để tìm ngày xuất chuồng mang lại lợi nhuận cao nhất.
- Bảng giá gia cầm 3 miền (Bắc, Trung, Nam) cập nhật hàng ngày.

### 7. 👑 Hệ thống SaaS & Cổng thanh toán VietQR
- 3 gói dịch vụ: **Nông Dân (Miễn phí)**, **Nông Hộ (49.000đ/tháng)**, **Trang Trại VIP (99.000đ/tháng)**.
- Tích hợp thanh toán quét mã **VietQR** tự động kích hoạt tức thì.
- Quản lý đa trang trại / đa khu chuồng nuôi.

---

## 🏗️ CẤU TRÚC DỰ ÁN (MONOREPO)

```
farmgo/
├── package.json              # Root workspace config & scripts
├── pnpm-workspace.yaml       # pnpm monorepo packages definition
├── pnpm-lock.yaml            # Locked dependency tree
├── .gitignore                # Git exclusion rules
├── LICENSE                   # MIT License
├── README.md                 # Project documentation
│
├── shared/                   # Shared TypeScript models & domain knowledge
│   ├── src/types.ts          # Strongly typed interfaces (User, Batch, Vaccine, Feed, Finance, Health)
│   ├── src/constants.ts      # Vietnamese chicken breeds, Standard vaccine library, Disease guide, SaaS tiers
│   ├── src/index.ts
│   └── package.json
│
├── backend/                  # RESTful API Backend (Node.js + Express + TypeScript)
│   ├── data/farmgo_db.json   # Seed JSON database engine for VN poultry farms
│   ├── src/
│   │   ├── db/storage.ts     # Data access layer
│   │   ├── middleware/       # JWT Auth & error handling middleware
│   │   ├── routes/           # REST endpoints (/api/v1/...)
│   │   ├── services/         # Batch, Vaccine, Feed, Finance, Health, AI, Farm, Subscription services
│   │   ├── app.ts            # Express application setup
│   │   └── index.ts          # Server entry point (Port 3001)
│   ├── test/backend.test.ts  # 10 comprehensive unit & integration tests (Vitest)
│   └── package.json
│
└── frontend/                 # Mobile-First SPA (React 19 + Vite + Tailwind CSS + Lucide + Recharts)
    ├── src/
    │   ├── components/       # UI Views: Dashboard, BatchDetail, Vaccine, Feed, Finance, Health, AI Advisor, VietQR Checkout, PDF Export
    │   ├── context/          # AppContext state & offline sync
    │   ├── services/api.ts   # Typed API client
    │   ├── App.tsx           # Main application shell
    │   ├── index.css         # Tailwind & custom CSS styles
    │   └── main.tsx          # React DOM entry point
    ├── index.html
    └── package.json
```

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT & CHẠY ỨNG DỤNG

### Yêu cầu môi trường
- **Node.js**: >= 18.0.0
- **pnpm**: >= 9.0.0

### 1. Cài đặt dependencies
```bash
pnpm install
```

### 2. Chạy kiểm thử tự động (Unit & Integration Tests)
```bash
pnpm test
```
*Tất cả 10/10 test cases sẽ được thực thi và kiểm tra tính hợp lệ của API.*

### 3. Build toàn bộ dự án (Production Build)
```bash
pnpm build
```

### 4. Chạy môi trường phát triển (Dev Mode)
```bash
# Chạy đồng thời cả Backend và Frontend
pnpm dev

# Hoặc chạy từng service riêng biệt:
pnpm dev:backend   # API chạy tại http://localhost:3001
pnpm dev:frontend  # Giao diện Web/Mobile tại http://localhost:5173
```

---

## 📱 THIẾT KẾ DÀNH RIÊNG CHO NÔNG DÂN VIỆT NAM
- **Thao tác 1-chạm (Thumb-Friendly)**: Nút hành động nổi ở vị trí ngón tay cái dễ bấm.
- **Chữ to, độ tương phản cao**: Dễ đọc khi làm việc ngoài trời nắng hoặc trong chuồng trại.
- **Tùy chọn Khung Điện Thoại / Màn Hình Lớn**: Nút chuyển đổi nhanh giữa khung mô phỏng điện thoại di động và giao diện bảng biểu màn hình rộng.
- **Khôi phục dữ liệu mẫu 1-click**: Sẵn sàng trải nghiệm ngay với dữ liệu thực tế của trại gà thả vườn Sơn Tây và Đông Tảo.

---

## 🤝 HƯỚNG DẪN ĐÓNG GÓP (CONTRIBUTING)

Chúng tôi rất hoan nghênh các đóng góp từ cộng đồng để hoàn thiện giải pháp chuyển đổi số cho nông nghiệp Việt Nam:
1. **Fork** repository trên GitHub: [https://github.com/hienvanla5/My-FarmGo](https://github.com/hienvanla5/My-FarmGo)
2. Tạo branch mới cho tính năng của bạn:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit các thay đổi:
   ```bash
   git commit -m "feat: Add some AmazingFeature"
   ```
4. Push lên branch của bạn:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Mở một **Pull Request** trên GitHub.

---

## 📄 GIẤY PHÉP (LICENSE)

Dự án được phân phối dưới giấy phép **MIT License**. Xem file [`LICENSE`](./LICENSE) để biết thêm thông tin chi tiết.

---

*Phát triển bởi đội ngũ kỹ sư FarmGo Vietnam.*
