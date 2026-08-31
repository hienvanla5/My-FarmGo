import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  User, 
  Farm, 
  Batch, 
  BatchEvent, 
  BatchVaccineSchedule, 
  FeedPurchase, 
  FeedConsumption, 
  Transaction, 
  HealthRecord, 
  Subscription, 
  AppNotification, 
  MarketPriceItem 
} from 'farmgo-shared';
import type { DatabaseSchema } from './storage.js';

const { Pool } = pg;

let poolInstance: pg.Pool | null = null;

export function isPostgresConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0);
}

export function getPostgresPool(): pg.Pool | null {
  if (!isPostgresConfigured()) {
    return null;
  }

  if (!poolInstance) {
    const connectionString = process.env.DATABASE_URL!;
    const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');

    poolInstance = new Pool({
      connectionString,
      ssl: isLocalhost ? false : { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });

    poolInstance.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
    });
  }

  return poolInstance;
}

export async function pingPostgres(): Promise<{ connected: boolean; latencyMs?: number; error?: string }> {
  const pool = getPostgresPool();
  if (!pool) return { connected: false, error: 'DATABASE_URL is not configured' };

  const start = Date.now();
  try {
    const client = await pool.connect();
    try {
      await client.query('SELECT 1');
      return { connected: true, latencyMs: Date.now() - start };
    } finally {
      client.release();
    }
  } catch (err: any) {
    return { connected: false, error: err.message || 'Database connection error' };
  }
}

export async function initPostgresSchema(): Promise<boolean> {
  const pool = getPostgresPool();
  if (!pool) return false;

  try {
    const client = await pool.connect();
    try {
      // Find schema.sql file
      let schemaPath = path.join(process.cwd(), 'src', 'db', 'schema.sql');
      if (!fs.existsSync(schemaPath)) {
        schemaPath = path.join(process.cwd(), 'dist', 'db', 'schema.sql');
      }
      if (!fs.existsSync(schemaPath)) {
        // Fallback relative to current module
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);
        schemaPath = path.join(__dirname, 'schema.sql');
      }

      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
        await client.query(schemaSql);
        console.log('✅ PostgreSQL Schema initialized/verified successfully');
        return true;
      } else {
        console.warn('⚠️ schema.sql not found at', schemaPath);
        return false;
      }
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ Failed to initialize PostgreSQL schema:', err);
    return false;
  }
}

export async function loadDataFromPostgres(): Promise<DatabaseSchema | null> {
  const pool = getPostgresPool();
  if (!pool) return null;

  try {
    const client = await pool.connect();
    try {
      const usersRes = await client.query('SELECT * FROM users');
      const farmsRes = await client.query('SELECT * FROM farms');
      const batchesRes = await client.query('SELECT * FROM batches');
      const eventsRes = await client.query('SELECT * FROM batch_events');
      const vaccinesRes = await client.query('SELECT * FROM vaccine_schedules');
      const purchasesRes = await client.query('SELECT * FROM feed_purchases');
      const consumptionsRes = await client.query('SELECT * FROM feed_consumptions');
      const transactionsRes = await client.query('SELECT * FROM transactions');
      const healthRes = await client.query('SELECT * FROM health_records');
      const subsRes = await client.query('SELECT * FROM subscriptions');
      const notifsRes = await client.query('SELECT * FROM notifications');
      const marketRes = await client.query('SELECT * FROM market_prices');

      if (usersRes.rows.length === 0 && farmsRes.rows.length === 0) {
        return null; // Empty DB, seed needed
      }

      return {
        users: usersRes.rows.map(r => ({
          id: r.id,
          phone: r.phone,
          email: r.email || undefined,
          fullName: r.full_name,
          avatarUrl: r.avatar_url || undefined,
          farmName: r.farm_name || undefined,
          province: r.province || undefined,
          district: r.district || undefined,
          role: r.role,
          currentPlan: r.current_plan,
          planExpiryDate: r.plan_expiry_date ? new Date(r.plan_expiry_date).toISOString() : undefined,
          createdAt: new Date(r.created_at).toISOString(),
          updatedAt: new Date(r.updated_at).toISOString()
        })),
        farms: farmsRes.rows.map(r => ({
          id: r.id,
          userId: r.user_id,
          name: r.name,
          address: r.address,
          province: r.province,
          district: r.district,
          ward: r.ward || undefined,
          totalAreaM2: r.total_area_m2 ? Number(r.total_area_m2) : undefined,
          capacityChickens: Number(r.capacity_chickens),
          isDefault: Boolean(r.is_default),
          createdAt: new Date(r.created_at).toISOString(),
          updatedAt: new Date(r.updated_at).toISOString()
        })),
        batches: batchesRes.rows.map(r => ({
          id: r.id,
          farmId: r.farm_id,
          name: r.name,
          breedId: r.breed_id,
          breedName: r.breed_name,
          initialQuantity: Number(r.initial_quantity),
          currentQuantity: Number(r.current_quantity),
          startDate: r.start_date instanceof Date ? r.start_date.toISOString().split('T')[0] : String(r.start_date),
          expectedHarvestDate: r.expected_harvest_date instanceof Date ? r.expected_harvest_date.toISOString().split('T')[0] : String(r.expected_harvest_date),
          actualHarvestDate: r.actual_harvest_date ? (r.actual_harvest_date instanceof Date ? r.actual_harvest_date.toISOString().split('T')[0] : String(r.actual_harvest_date)) : undefined,
          initialWeightGrams: r.initial_weight_grams ? Number(r.initial_weight_grams) : undefined,
          currentAvgWeightGrams: r.current_avg_weight_grams ? Number(r.current_avg_weight_grams) : undefined,
          supplierName: r.supplier_name || undefined,
          supplierPhone: r.supplier_phone || undefined,
          unitPricePerChic: Number(r.unit_price_per_chic || 0),
          status: r.status,
          notes: r.notes || undefined,
          createdAt: new Date(r.created_at).toISOString(),
          updatedAt: new Date(r.updated_at).toISOString()
        })),
        batchEvents: eventsRes.rows.map(r => ({
          id: r.id,
          batchId: r.batch_id,
          eventType: r.event_type,
          date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date),
          quantity: r.quantity ? Number(r.quantity) : undefined,
          avgWeightGrams: r.avg_weight_grams ? Number(r.avg_weight_grams) : undefined,
          title: r.title,
          description: r.description || undefined,
          photos: r.photos || undefined,
          createdAt: new Date(r.created_at).toISOString()
        })),
        vaccineSchedules: vaccinesRes.rows.map(r => ({
          id: r.id,
          batchId: r.batch_id,
          vaccineId: r.vaccine_id,
          vaccineName: r.vaccine_name,
          diseaseName: r.disease_name,
          scheduledAgeDays: Number(r.scheduled_age_days),
          scheduledDate: r.scheduled_date instanceof Date ? r.scheduled_date.toISOString().split('T')[0] : String(r.scheduled_date),
          actualDate: r.actual_date ? (r.actual_date instanceof Date ? r.actual_date.toISOString().split('T')[0] : String(r.actual_date)) : undefined,
          status: r.status,
          applicationMethod: r.application_method,
          dose: r.dose || undefined,
          supplier: r.supplier || undefined,
          lotNumber: r.lot_number || undefined,
          administeredBy: r.administered_by || undefined,
          cost: r.cost ? Number(r.cost) : undefined,
          notes: r.notes || undefined,
          createdAt: new Date(r.created_at).toISOString(),
          updatedAt: new Date(r.updated_at).toISOString()
        })),
        feedPurchases: purchasesRes.rows.map(r => ({
          id: r.id,
          farmId: r.farm_id,
          batchId: r.batch_id || undefined,
          feedType: r.feed_type,
          brandName: r.brand_name,
          productCode: r.product_code || undefined,
          bagCount: Number(r.bag_count),
          kgPerBag: Number(r.kg_per_bag),
          totalKg: Number(r.total_kg),
          unitPricePerKg: Number(r.unit_price_per_kg),
          totalPrice: Number(r.total_price),
          supplier: r.supplier,
          purchaseDate: r.purchase_date instanceof Date ? r.purchase_date.toISOString().split('T')[0] : String(r.purchase_date),
          notes: r.notes || undefined,
          createdAt: new Date(r.created_at).toISOString()
        })),
        feedConsumptions: consumptionsRes.rows.map(r => ({
          id: r.id,
          batchId: r.batch_id,
          date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date),
          feedType: r.feed_type,
          quantityKg: Number(r.quantity_kg),
          isEstimated: Boolean(r.is_estimated),
          notes: r.notes || undefined,
          createdAt: new Date(r.created_at).toISOString()
        })),
        transactions: transactionsRes.rows.map(r => ({
          id: r.id,
          farmId: r.farm_id,
          batchId: r.batch_id || undefined,
          type: r.type,
          category: r.category,
          categoryName: r.category_name,
          amount: Number(r.amount),
          date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date),
          paymentMethod: r.payment_method,
          payerReceiverName: r.payer_receiver_name || undefined,
          referenceCode: r.reference_code || undefined,
          notes: r.notes || undefined,
          receiptPhotoUrl: r.receipt_photo_url || undefined,
          createdAt: new Date(r.created_at).toISOString()
        })),
        healthRecords: healthRes.rows.map(r => ({
          id: r.id,
          batchId: r.batch_id,
          date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : String(r.date),
          deathsCount: Number(r.deaths_count || 0),
          cullsCount: Number(r.culls_count || 0),
          suspectedDiseases: r.suspected_diseases || undefined,
          symptoms: r.symptoms || [],
          medicationsUsed: r.medications_used || undefined,
          medicationDosage: r.medication_dosage || undefined,
          withdrawalDays: r.withdrawal_days ? Number(r.withdrawal_days) : undefined,
          withdrawalEndDate: r.withdrawal_end_date ? (r.withdrawal_end_date instanceof Date ? r.withdrawal_end_date.toISOString().split('T')[0] : String(r.withdrawal_end_date)) : undefined,
          treatmentNotes: r.treatment_notes || undefined,
          isResolved: Boolean(r.is_resolved),
          createdAt: new Date(r.created_at).toISOString()
        })),
        subscriptions: subsRes.rows.map(r => ({
          id: r.id,
          userId: r.user_id,
          plan: r.plan,
          planName: r.plan_name,
          amountPaid: Number(r.amount_paid),
          paymentMethod: r.payment_method,
          transactionId: r.transaction_id || undefined,
          startDate: new Date(r.start_date).toISOString(),
          endDate: new Date(r.end_date).toISOString(),
          status: r.status,
          createdAt: new Date(r.created_at).toISOString()
        })),
        notifications: notifsRes.rows.map(r => ({
          id: r.id,
          userId: r.user_id,
          title: r.title,
          body: r.body,
          type: r.type,
          relatedBatchId: r.related_batch_id || undefined,
          isRead: Boolean(r.is_read),
          createdAt: new Date(r.created_at).toISOString()
        })),
        marketPrices: marketRes.rows.map(r => ({
          id: r.id,
          region: r.region,
          productName: r.product_name,
          unit: r.unit,
          minPrice: Number(r.min_price),
          maxPrice: Number(r.max_price),
          avgPrice: Number(r.avg_price),
          trend: r.trend,
          changePercent: Number(r.change_percent),
          updatedAt: new Date(r.updated_at).toISOString()
        }))
      };
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ Failed to load data from PostgreSQL:', err);
    return null;
  }
}

export async function syncAllDataToPostgres(data: DatabaseSchema): Promise<void> {
  const pool = getPostgresPool();
  if (!pool) return;

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Users
      for (const u of data.users) {
        await client.query(`
          INSERT INTO users (id, phone, email, full_name, avatar_url, farm_name, province, district, role, current_plan, plan_expiry_date, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (id) DO UPDATE SET
            phone = EXCLUDED.phone,
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name,
            avatar_url = EXCLUDED.avatar_url,
            farm_name = EXCLUDED.farm_name,
            province = EXCLUDED.province,
            district = EXCLUDED.district,
            role = EXCLUDED.role,
            current_plan = EXCLUDED.current_plan,
            plan_expiry_date = EXCLUDED.plan_expiry_date,
            updated_at = EXCLUDED.updated_at
        `, [u.id, u.phone, u.email || null, u.fullName, u.avatarUrl || null, u.farmName || null, u.province || null, u.district || null, u.role, u.currentPlan, u.planExpiryDate || null, u.createdAt, u.updatedAt]);
      }

      // Farms
      for (const f of data.farms) {
        await client.query(`
          INSERT INTO farms (id, user_id, name, address, province, district, ward, total_area_m2, capacity_chickens, is_default, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            address = EXCLUDED.address,
            province = EXCLUDED.province,
            district = EXCLUDED.district,
            ward = EXCLUDED.ward,
            total_area_m2 = EXCLUDED.total_area_m2,
            capacity_chickens = EXCLUDED.capacity_chickens,
            is_default = EXCLUDED.is_default,
            updated_at = EXCLUDED.updated_at
        `, [f.id, f.userId, f.name, f.address, f.province, f.district, f.ward || null, f.totalAreaM2 || null, f.capacityChickens, f.isDefault, f.createdAt, f.updatedAt]);
      }

      // Batches
      for (const b of data.batches) {
        await client.query(`
          INSERT INTO batches (id, farm_id, name, breed_id, breed_name, initial_quantity, current_quantity, start_date, expected_harvest_date, actual_harvest_date, initial_weight_grams, current_avg_weight_grams, supplier_name, supplier_phone, unit_price_per_chic, status, notes, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            breed_id = EXCLUDED.breed_id,
            breed_name = EXCLUDED.breed_name,
            initial_quantity = EXCLUDED.initial_quantity,
            current_quantity = EXCLUDED.current_quantity,
            start_date = EXCLUDED.start_date,
            expected_harvest_date = EXCLUDED.expected_harvest_date,
            actual_harvest_date = EXCLUDED.actual_harvest_date,
            initial_weight_grams = EXCLUDED.initial_weight_grams,
            current_avg_weight_grams = EXCLUDED.current_avg_weight_grams,
            supplier_name = EXCLUDED.supplier_name,
            supplier_phone = EXCLUDED.supplier_phone,
            unit_price_per_chic = EXCLUDED.unit_price_per_chic,
            status = EXCLUDED.status,
            notes = EXCLUDED.notes,
            updated_at = EXCLUDED.updated_at
        `, [b.id, b.farmId, b.name, b.breedId, b.breedName, b.initialQuantity, b.currentQuantity, b.startDate, b.expectedHarvestDate, b.actualHarvestDate || null, b.initialWeightGrams || 40, b.currentAvgWeightGrams || 40, b.supplierName || null, b.supplierPhone || null, b.unitPricePerChic || 0, b.status, b.notes || null, b.createdAt, b.updatedAt]);
      }

      // Batch Events
      for (const e of data.batchEvents) {
        await client.query(`
          INSERT INTO batch_events (id, batch_id, event_type, date, quantity, avg_weight_grams, title, description, photos, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO UPDATE SET
            event_type = EXCLUDED.event_type,
            date = EXCLUDED.date,
            quantity = EXCLUDED.quantity,
            avg_weight_grams = EXCLUDED.avg_weight_grams,
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            photos = EXCLUDED.photos
        `, [e.id, e.batchId, e.eventType, e.date, e.quantity || null, e.avgWeightGrams || null, e.title, e.description || null, e.photos || null, e.createdAt]);
      }

      // Vaccine schedules
      for (const v of data.vaccineSchedules) {
        await client.query(`
          INSERT INTO vaccine_schedules (id, batch_id, vaccine_id, vaccine_name, disease_name, scheduled_age_days, scheduled_date, actual_date, status, application_method, dose, supplier, lot_number, administered_by, cost, notes, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
          ON CONFLICT (id) DO UPDATE SET
            status = EXCLUDED.status,
            actual_date = EXCLUDED.actual_date,
            supplier = EXCLUDED.supplier,
            lot_number = EXCLUDED.lot_number,
            administered_by = EXCLUDED.administered_by,
            cost = EXCLUDED.cost,
            notes = EXCLUDED.notes,
            updated_at = EXCLUDED.updated_at
        `, [v.id, v.batchId, v.vaccineId, v.vaccineName, v.diseaseName, v.scheduledAgeDays, v.scheduledDate, v.actualDate || null, v.status, v.applicationMethod, v.dose || null, v.supplier || null, v.lotNumber || null, v.administeredBy || null, v.cost || null, v.notes || null, v.createdAt, v.updatedAt]);
      }

      // Feed purchases
      for (const f of data.feedPurchases) {
        await client.query(`
          INSERT INTO feed_purchases (id, farm_id, batch_id, feed_type, brand_name, product_code, bag_count, kg_per_bag, total_kg, unit_price_per_kg, total_price, supplier, purchase_date, notes, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          ON CONFLICT (id) DO UPDATE SET
            brand_name = EXCLUDED.brand_name,
            total_kg = EXCLUDED.total_kg,
            total_price = EXCLUDED.total_price,
            notes = EXCLUDED.notes
        `, [f.id, f.farmId, f.batchId || null, f.feedType, f.brandName, f.productCode || null, f.bagCount, f.kgPerBag, f.totalKg, f.unitPricePerKg, f.totalPrice, f.supplier, f.purchaseDate, f.notes || null, f.createdAt]);
      }

      // Feed consumptions
      for (const fc of data.feedConsumptions) {
        await client.query(`
          INSERT INTO feed_consumptions (id, batch_id, date, feed_type, quantity_kg, is_estimated, notes, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (id) DO UPDATE SET
            quantity_kg = EXCLUDED.quantity_kg,
            is_estimated = EXCLUDED.is_estimated,
            notes = EXCLUDED.notes
        `, [fc.id, fc.batchId, fc.date, fc.feedType, fc.quantityKg, fc.isEstimated, fc.notes || null, fc.createdAt]);
      }

      // Transactions
      for (const t of data.transactions) {
        await client.query(`
          INSERT INTO transactions (id, farm_id, batch_id, type, category, category_name, amount, date, payment_method, payer_receiver_name, reference_code, notes, receipt_photo_url, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (id) DO UPDATE SET
            amount = EXCLUDED.amount,
            category = EXCLUDED.category,
            category_name = EXCLUDED.category_name,
            notes = EXCLUDED.notes
        `, [t.id, t.farmId, t.batchId || null, t.type, t.category, t.categoryName, t.amount, t.date, t.paymentMethod, t.payerReceiverName || null, t.referenceCode || null, t.notes || null, t.receiptPhotoUrl || null, t.createdAt]);
      }

      // Health records
      for (const h of data.healthRecords) {
        await client.query(`
          INSERT INTO health_records (id, batch_id, date, deaths_count, culls_count, suspected_diseases, symptoms, medications_used, medication_dosage, withdrawal_days, withdrawal_end_date, treatment_notes, is_resolved, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
          ON CONFLICT (id) DO UPDATE SET
            deaths_count = EXCLUDED.deaths_count,
            culls_count = EXCLUDED.culls_count,
            suspected_diseases = EXCLUDED.suspected_diseases,
            symptoms = EXCLUDED.symptoms,
            medications_used = EXCLUDED.medications_used,
            treatment_notes = EXCLUDED.treatment_notes,
            is_resolved = EXCLUDED.is_resolved
        `, [h.id, h.batchId, h.date, h.deathsCount, h.cullsCount || 0, h.suspectedDiseases || null, h.symptoms, h.medicationsUsed || null, h.medicationDosage || null, h.withdrawalDays || null, h.withdrawalEndDate || null, h.treatmentNotes || null, h.isResolved, h.createdAt]);
      }

      // Subscriptions
      for (const s of data.subscriptions) {
        await client.query(`
          INSERT INTO subscriptions (id, user_id, plan, plan_name, amount_paid, payment_method, transaction_id, start_date, end_date, status, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO UPDATE SET
            status = EXCLUDED.status,
            end_date = EXCLUDED.end_date
        `, [s.id, s.userId, s.plan, s.planName, s.amountPaid, s.paymentMethod, s.transactionId || null, s.startDate, s.endDate, s.status, s.createdAt]);
      }

      // Market prices
      for (const m of data.marketPrices) {
        await client.query(`
          INSERT INTO market_prices (id, region, product_name, unit, min_price, max_price, avg_price, trend, change_percent, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT (id) DO UPDATE SET
            min_price = EXCLUDED.min_price,
            max_price = EXCLUDED.max_price,
            avg_price = EXCLUDED.avg_price,
            trend = EXCLUDED.trend,
            change_percent = EXCLUDED.change_percent,
            updated_at = EXCLUDED.updated_at
        `, [m.id, m.region, m.productName, m.unit, m.minPrice, m.maxPrice, m.avgPrice, m.trend, m.changePercent, m.updatedAt]);
      }

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ Failed to sync data to PostgreSQL:', err);
  }
}
