-- ==========================================================
-- FarmGo SaaS PostgreSQL Database Schema
-- Optimized for Free Tier (Neon, Supabase, Railway, Render)
-- ==========================================================

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  phone VARCHAR(20) NOT NULL UNIQUE,
  email VARCHAR(255),
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  farm_name VARCHAR(255),
  province VARCHAR(100),
  district VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'farmer',
  current_plan VARCHAR(20) NOT NULL DEFAULT 'free',
  plan_expiry_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Farms
CREATE TABLE IF NOT EXISTS farms (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  province VARCHAR(100) NOT NULL,
  district VARCHAR(100) NOT NULL,
  ward VARCHAR(100),
  total_area_m2 NUMERIC(12, 2),
  capacity_chickens INTEGER NOT NULL DEFAULT 1000,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Batches (Lứa nuôi gà)
CREATE TABLE IF NOT EXISTS batches (
  id VARCHAR(64) PRIMARY KEY,
  farm_id VARCHAR(64) NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  breed_id VARCHAR(64) NOT NULL,
  breed_name VARCHAR(255) NOT NULL,
  initial_quantity INTEGER NOT NULL,
  current_quantity INTEGER NOT NULL,
  start_date DATE NOT NULL,
  expected_harvest_date DATE NOT NULL,
  actual_harvest_date DATE,
  initial_weight_grams NUMERIC(10, 2) DEFAULT 40,
  current_avg_weight_grams NUMERIC(10, 2) DEFAULT 40,
  supplier_name VARCHAR(255),
  supplier_phone VARCHAR(50),
  unit_price_per_chic NUMERIC(12, 2) DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Batch Events (Nhật ký sự kiện lứa nuôi)
CREATE TABLE IF NOT EXISTS batch_events (
  id VARCHAR(64) PRIMARY KEY,
  batch_id VARCHAR(64) NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  quantity INTEGER,
  avg_weight_grams NUMERIC(10, 2),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Vaccine Schedules (Lịch tiêm phòng)
CREATE TABLE IF NOT EXISTS vaccine_schedules (
  id VARCHAR(64) PRIMARY KEY,
  batch_id VARCHAR(64) NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  vaccine_id VARCHAR(64) NOT NULL,
  vaccine_name VARCHAR(255) NOT NULL,
  disease_name VARCHAR(255) NOT NULL,
  scheduled_age_days INTEGER NOT NULL,
  scheduled_date DATE NOT NULL,
  actual_date DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  application_method VARCHAR(100) NOT NULL,
  dose VARCHAR(100),
  supplier VARCHAR(255),
  lot_number VARCHAR(100),
  administered_by VARCHAR(255),
  cost NUMERIC(12, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Feed Purchases (Nhập cám thức ăn)
CREATE TABLE IF NOT EXISTS feed_purchases (
  id VARCHAR(64) PRIMARY KEY,
  farm_id VARCHAR(64) NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  batch_id VARCHAR(64) REFERENCES batches(id) ON DELETE SET NULL,
  feed_type VARCHAR(50) NOT NULL,
  brand_name VARCHAR(255) NOT NULL,
  product_code VARCHAR(100),
  bag_count INTEGER NOT NULL,
  kg_per_bag NUMERIC(8, 2) NOT NULL,
  total_kg NUMERIC(10, 2) NOT NULL,
  unit_price_per_kg NUMERIC(12, 2) NOT NULL,
  total_price NUMERIC(14, 2) NOT NULL,
  supplier VARCHAR(255) NOT NULL,
  purchase_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Feed Consumptions (Nhật ký cho ăn)
CREATE TABLE IF NOT EXISTS feed_consumptions (
  id VARCHAR(64) PRIMARY KEY,
  batch_id VARCHAR(64) NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  feed_type VARCHAR(50) NOT NULL,
  quantity_kg NUMERIC(10, 2) NOT NULL,
  is_estimated BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Transactions (Thu chi trang trại)
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(64) PRIMARY KEY,
  farm_id VARCHAR(64) NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  batch_id VARCHAR(64) REFERENCES batches(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL, -- 'income' | 'expense'
  category VARCHAR(50) NOT NULL,
  category_name VARCHAR(255) NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  date DATE NOT NULL,
  payment_method VARCHAR(50) NOT NULL DEFAULT 'cash',
  payer_receiver_name VARCHAR(255),
  reference_code VARCHAR(100),
  notes TEXT,
  receipt_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Health Records (Sức khỏe & Dùng thuốc)
CREATE TABLE IF NOT EXISTS health_records (
  id VARCHAR(64) PRIMARY KEY,
  batch_id VARCHAR(64) NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  deaths_count INTEGER NOT NULL DEFAULT 0,
  culls_count INTEGER NOT NULL DEFAULT 0,
  suspected_diseases TEXT[],
  symptoms TEXT[] NOT NULL,
  medications_used TEXT[],
  medication_dosage TEXT,
  withdrawal_days INTEGER DEFAULT 0,
  withdrawal_end_date DATE,
  treatment_notes TEXT,
  is_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Subscriptions (Gói cước SaaS)
CREATE TABLE IF NOT EXISTS subscriptions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan VARCHAR(20) NOT NULL,
  plan_name VARCHAR(255) NOT NULL,
  amount_paid NUMERIC(12, 2) NOT NULL,
  payment_method VARCHAR(100) NOT NULL,
  transaction_id VARCHAR(100),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Notifications (Thông báo)
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  type VARCHAR(50) NOT NULL,
  related_batch_id VARCHAR(64),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Market Prices (Giá thị trường)
CREATE TABLE IF NOT EXISTS market_prices (
  id VARCHAR(64) PRIMARY KEY,
  region VARCHAR(50) NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  min_price NUMERIC(12, 2) NOT NULL,
  max_price NUMERIC(12, 2) NOT NULL,
  avg_price NUMERIC(12, 2) NOT NULL,
  trend VARCHAR(20) NOT NULL,
  change_percent NUMERIC(5, 2) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON farms(user_id);
CREATE INDEX IF NOT EXISTS idx_batches_farm_id ON batches(farm_id);
CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);
CREATE INDEX IF NOT EXISTS idx_vaccine_schedules_batch ON vaccine_schedules(batch_id);
CREATE INDEX IF NOT EXISTS idx_feed_purchases_farm ON feed_purchases(farm_id);
CREATE INDEX IF NOT EXISTS idx_feed_consumptions_batch ON feed_consumptions(batch_id);
CREATE INDEX IF NOT EXISTS idx_transactions_farm ON transactions(farm_id);
CREATE INDEX IF NOT EXISTS idx_transactions_batch ON transactions(batch_id);
CREATE INDEX IF NOT EXISTS idx_health_records_batch ON health_records(batch_id);
