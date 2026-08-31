
import fs from 'fs';
import path from 'path';
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
  MarketPriceItem,
  STANDARD_VACCINE_LIBRARY,
  VIETNAMESE_CHICKEN_BREEDS,
  INITIAL_MARKET_PRICES
} from 'farmgo-shared';

export interface DatabaseSchema {
  users: User[];
  farms: Farm[];
  batches: Batch[];
  batchEvents: BatchEvent[];
  vaccineSchedules: BatchVaccineSchedule[];
  feedPurchases: FeedPurchase[];
  feedConsumptions: FeedConsumption[];
  transactions: Transaction[];
  healthRecords: HealthRecord[];
  subscriptions: Subscription[];
  notifications: AppNotification[];
  marketPrices: MarketPriceItem[];
}

export class FarmGoDatabase {
  private data: DatabaseSchema;
  private filePath: string;

  constructor(filePath?: string) {
    this.filePath = filePath || path.join(process.cwd(), 'data', 'farmgo_db.json');
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, 'utf-8');
        return JSON.parse(content);
      }
    } catch (err) {
      console.warn('Could not read existing database file, initializing new one:', err);
    }

    const initialData = this.getSeedData();
    this.saveDataDirect(initialData);
    return initialData;
  }

  public save(): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to save database to file:', err);
    }
  }

  private saveDataDirect(data: DatabaseSchema): void {
    try {
      const dir = path.dirname(this.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write initial database:', err);
    }
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  public resetToSeed(): void {
    this.data = this.getSeedData();
    this.save();
  }

  private getSeedData(): DatabaseSchema {
    const defaultUser: User = {
      id: 'usr_farmer_01',
      phone: '0988123456',
      email: 'nongdan.viet@farmgo.vn',
      fullName: 'Bác Ba Nông Dân',
      farmName: 'Trại gà Ba Thắng - Thả Vườn Xanh',
      province: 'Hà Nội',
      district: 'Sơn Tây',
      role: 'farmer',
      currentPlan: 'premium',
      planExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z'
    };

    const defaultFarm: Farm = {
      id: 'farm_01',
      userId: 'usr_farmer_01',
      name: 'Trang Trại Thả Vườn Đồi Chè (Sơn Tây)',
      address: 'Thôn Cam Lâm, Xã Đường Lâm, Thị xã Sơn Tây, Hà Nội',
      province: 'Hà Nội',
      district: 'Sơn Tây',
      ward: 'Đường Lâm',
      totalAreaM2: 3500,
      capacityChickens: 3000,
      isDefault: true,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z'
    };

    const secondFarm: Farm = {
      id: 'farm_02',
      userId: 'usr_farmer_01',
      name: 'Khu Chuồng 2 - Trại Úm Khoái Châu',
      address: 'Xã Đông Tảo, Huyện Khoái Châu, Hưng Yên',
      province: 'Hưng Yên',
      district: 'Khoái Châu',
      capacityChickens: 1500,
      isDefault: false,
      createdAt: '2025-01-10T00:00:00.000Z',
      updatedAt: '2025-01-10T00:00:00.000Z'
    };

    // Calculate dates relative to today
    const now = new Date();
    const formatDate = (daysOffset: number) => {
      const d = new Date(now.getTime() + daysOffset * 24 * 60 * 60 * 1000);
      return d.toISOString().split('T')[0];
    };

    // Batch 1: Active Ri Lai Batch (45 days old)
    const batch1Start = formatDate(-45);
    const batch1Harvest = formatDate(60); // 105 total days
    const batch1: Batch = {
      id: 'batch_ri_lai_01',
      farmId: 'farm_01',
      name: 'Lứa Gà Ri Lai Đồi #01 (1.000 con)',
      breedId: 'ga_ri_lai',
      breedName: 'Gà Ri Lai',
      initialQuantity: 1000,
      currentQuantity: 968,
      startDate: batch1Start,
      expectedHarvestDate: batch1Harvest,
      initialWeightGrams: 40,
      currentAvgWeightGrams: 950,
      supplierName: 'Trại Giống Gia Cầm Dabaco Miền Bắc',
      supplierPhone: '0912345678',
      unitPricePerChic: 14000,
      status: 'active',
      notes: 'Lứa gà giống đồng đều, mào đỏ tươi, vào chuồng ngày khô ráo, đệm lót trấu Balasa vi sinh.',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Batch 2: Active Gà Mía Batch (80 days old)
    const batch2Start = formatDate(-80);
    const batch2Harvest = formatDate(45); // 125 total days
    const batch2: Batch = {
      id: 'batch_mia_02',
      farmId: 'farm_01',
      name: 'Lứa Gà Mía Đường Lâm #02 (500 con)',
      breedId: 'ga_mia_son_tay',
      breedName: 'Gà Mía Sơn Tây',
      initialQuantity: 500,
      currentQuantity: 482,
      startDate: batch2Start,
      expectedHarvestDate: batch2Harvest,
      initialWeightGrams: 38,
      currentAvgWeightGrams: 1750,
      supplierName: 'Hợp tác xã Chăn nuôi Gà Mía Sơn Tây',
      supplierPhone: '0978999888',
      unitPricePerChic: 18000,
      status: 'active',
      notes: 'Thả vườn đồi chè, bổ sung bắp ngô vỡ và rau xanh từ ngày 60.',
      createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Batch 3: Completed Ri Lai Batch (Harvested last month)
    const batch3Start = formatDate(-150);
    const batch3Harvest = formatDate(-45);
    const batch3: Batch = {
      id: 'batch_ri_completed_03',
      farmId: 'farm_01',
      name: 'Lứa Gà Ri Tết #03 (1.200 con - Đã xuất bán)',
      breedId: 'ga_ri_lai',
      breedName: 'Gà Ri Lai',
      initialQuantity: 1200,
      currentQuantity: 1150,
      startDate: batch3Start,
      expectedHarvestDate: batch3Harvest,
      actualHarvestDate: batch3Harvest,
      initialWeightGrams: 40,
      currentAvgWeightGrams: 1950,
      supplierName: 'Trại Giống Dabaco',
      supplierPhone: '0912345678',
      unitPricePerChic: 13500,
      status: 'completed',
      notes: 'Xuất bán toàn bộ cho thương lái Hà Nội ngày giáp Tết, được giá 86.000 đ/kg.',
      createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
    };

    // Generate vaccine schedules for batch 1 (45 days old)
    const batch1Vaccines: BatchVaccineSchedule[] = STANDARD_VACCINE_LIBRARY.map((v, idx) => {
      const scheduledDate = new Date(new Date(batch1Start).getTime() + v.recommendedAgeDaysStart * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const isPast = v.recommendedAgeDaysStart <= 45;
      const isDueSoon = v.recommendedAgeDaysStart >= 44 && v.recommendedAgeDaysStart <= 46;
      
      let status: BatchVaccineSchedule['status'] = 'pending';
      let actualDate: string | undefined = undefined;

      if (v.recommendedAgeDaysStart < 40) {
        status = 'completed';
        actualDate = scheduledDate;
      } else if (isDueSoon || (v.recommendedAgeDaysStart >= 40 && v.recommendedAgeDaysStart <= 48)) {
        status = 'due';
      }

      return {
        id: `sch_${batch1.id}_${v.id}`,
        batchId: batch1.id,
        vaccineId: v.id,
        vaccineName: v.name,
        diseaseName: v.diseaseName,
        scheduledAgeDays: v.recommendedAgeDaysStart,
        scheduledDate,
        actualDate,
        status,
        applicationMethod: v.applicationMethodName,
        dose: v.defaultDose,
        supplier: status === 'completed' ? 'Thú Y Xanh Sơn Tây / Navetco' : undefined,
        administeredBy: status === 'completed' ? 'Bác Ba Nông Dân' : undefined,
        cost: status === 'completed' ? 180000 : undefined,
        notes: v.notes,
        createdAt: batch1.createdAt,
        updatedAt: new Date().toISOString()
      };
    });

    // Feed Purchases for farm
    const feedPurchases: FeedPurchase[] = [
      {
        id: 'fp_01',
        farmId: 'farm_01',
        batchId: batch1.id,
        feedType: 'brooding',
        brandName: 'Cám C.P 101 Úm Gà Con',
        productCode: 'CP-101',
        bagCount: 20,
        kgPerBag: 25,
        totalKg: 500,
        unitPricePerKg: 15500,
        totalPrice: 7750000,
        supplier: 'Đại lý Thức ăn Chăn nuôi Hòa Phát',
        purchaseDate: formatDate(-44),
        notes: 'Cám hạt tấm nhỏ 21% đạm cho giai đoạn 1-20 ngày',
        createdAt: formatDate(-44)
      },
      {
        id: 'fp_02',
        farmId: 'farm_01',
        batchId: batch1.id,
        feedType: 'grower',
        brandName: 'Cám De Heus 201 Tăng Trưởng',
        productCode: 'DH-201',
        bagCount: 40,
        kgPerBag: 25,
        totalKg: 1000,
        unitPricePerKg: 14200,
        totalPrice: 14200000,
        supplier: 'Đại lý Thức ăn Chăn nuôi Hòa Phát',
        purchaseDate: formatDate(-25),
        notes: 'Cám viên 19% đạm giai đoạn 21-45 ngày',
        createdAt: formatDate(-25)
      },
      {
        id: 'fp_03',
        farmId: 'farm_01',
        batchId: batch2.id,
        feedType: 'finisher',
        brandName: 'Cám Dabaco 301 Vỗ Béo & Bắp Vỡ',
        productCode: 'DB-301',
        bagCount: 50,
        kgPerBag: 25,
        totalKg: 1250,
        unitPricePerKg: 13800,
        totalPrice: 17250000,
        supplier: 'Đại lý Thức ăn Chăn nuôi Hòa Phát',
        purchaseDate: formatDate(-20),
        notes: 'Giai đoạn vỗ béo tạo màu lông vàng và da giòn cho gà Mía',
        createdAt: formatDate(-20)
      }
    ];

    // Feed Consumptions for Batch 1
    const feedConsumptions: FeedConsumption[] = [
      { id: 'fc_01', batchId: batch1.id, date: formatDate(-40), feedType: 'brooding', quantityKg: 25, isEstimated: false, notes: 'Gà ăn tốt, uống nước đều', createdAt: formatDate(-40) },
      { id: 'fc_02', batchId: batch1.id, date: formatDate(-30), feedType: 'brooding', quantityKg: 38, isEstimated: false, notes: 'Chuyển sang máng ăn lớn', createdAt: formatDate(-30) },
      { id: 'fc_03', batchId: batch1.id, date: formatDate(-20), feedType: 'grower', quantityKg: 55, isEstimated: false, notes: 'Trộn men vi sinh tiêu hóa', createdAt: formatDate(-20) },
      { id: 'fc_04', batchId: batch1.id, date: formatDate(-10), feedType: 'grower', quantityKg: 68, isEstimated: false, notes: 'Tốc độ ăn tăng mạnh', createdAt: formatDate(-10) },
      { id: 'fc_05', batchId: batch1.id, date: formatDate(-2), feedType: 'grower', quantityKg: 78, isEstimated: false, notes: 'Thời tiết ấm, ăn khỏe', createdAt: formatDate(-2) }
    ];

    // Transactions (Finances)
    const transactions: Transaction[] = [
      // Batch 1 Expenses
      {
        id: 'tx_b1_01',
        batchId: batch1.id,
        farmId: 'farm_01',
        type: 'expense',
        category: 'chicks',
        categoryName: 'Con giống',
        amount: 14000000, // 1000 con * 14.000
        date: formatDate(-45),
        paymentMethod: 'bank_transfer',
        payerReceiverName: 'Trại Giống Dabaco',
        notes: 'Tiền mua 1.000 con gà Ri Lai 1 ngày tuổi đã tiêm Marek',
        createdAt: formatDate(-45)
      },
      {
        id: 'tx_b1_02',
        batchId: batch1.id,
        farmId: 'farm_01',
        type: 'expense',
        category: 'feed',
        categoryName: 'Thức ăn cám',
        amount: 7750000,
        date: formatDate(-44),
        paymentMethod: 'cash',
        payerReceiverName: 'Đại lý Hòa Phát',
        notes: '20 bao cám úm CP-101',
        createdAt: formatDate(-44)
      },
      {
        id: 'tx_b1_03',
        batchId: batch1.id,
        farmId: 'farm_01',
        type: 'expense',
        category: 'vaccine',
        categoryName: 'Vaccine phòng bệnh',
        amount: 850000,
        date: formatDate(-40),
        paymentMethod: 'cash',
        payerReceiverName: 'Hiệu thuốc Thú Y Xanh',
        notes: 'Vaccine Lasota, Gumboro và Đậu gà',
        createdAt: formatDate(-40)
      },
      {
        id: 'tx_b1_04',
        batchId: batch1.id,
        farmId: 'farm_01',
        type: 'expense',
        category: 'bedding_litter',
        categoryName: 'Trấu & Đệm lót',
        amount: 1200000,
        date: formatDate(-45),
        paymentMethod: 'cash',
        payerReceiverName: 'Nhà máy Xay xát Lúa Sơn Tây',
        notes: '3 chuyến xe tải nhỏ trấu hạt + 3 gói men Balasa N01',
        createdAt: formatDate(-45)
      },
      {
        id: 'tx_b1_05',
        batchId: batch1.id,
        farmId: 'farm_01',
        type: 'expense',
        category: 'electricity_water',
        categoryName: 'Điện, Nước & Sưởi',
        amount: 950000,
        date: formatDate(-15),
        paymentMethod: 'bank_transfer',
        payerReceiverName: 'Điện Lực Sơn Tây',
        notes: 'Tiền điện thắp đèn hồng ngoại úm gà tháng đầu',
        createdAt: formatDate(-15)
      },
      // Batch 3 Income & Expenses (Completed batch)
      {
        id: 'tx_b3_harvest',
        batchId: batch3.id,
        farmId: 'farm_01',
        type: 'income',
        category: 'sell_chicken_meat',
        categoryName: 'Bán gà thịt thương phẩm',
        amount: 192870000, // 1150 con * 1.95kg * 86.000đ = 192.855.000
        date: formatDate(-45),
        paymentMethod: 'bank_transfer',
        payerReceiverName: 'Thương lái Chợ Đầu Mối Hà Vĩ',
        notes: 'Xuất bán toàn bộ 1.150 con gà Ri Lai, cân nặng bình quân 1.95 kg/con',
        createdAt: formatDate(-45)
      },
      {
        id: 'tx_b3_manure',
        batchId: batch3.id,
        farmId: 'farm_01',
        type: 'income',
        category: 'sell_manure',
        categoryName: 'Bán phân gà & trấu thải',
        amount: 4500000,
        date: formatDate(-42),
        paymentMethod: 'cash',
        payerReceiverName: 'Nhà vườn trồng cam Cao Phong',
        notes: 'Bán trấu đệm lót mục ủ vi sinh sau khi xuất chuồng',
        createdAt: formatDate(-42)
      },
      {
        id: 'tx_b3_total_exp',
        batchId: batch3.id,
        farmId: 'farm_01',
        type: 'expense',
        category: 'feed',
        categoryName: 'Thức ăn cám',
        amount: 115000000,
        date: formatDate(-50),
        paymentMethod: 'bank_transfer',
        payerReceiverName: 'Đại lý Cám De Heus',
        notes: 'Tổng chi phí cám nuôi lứa #03 từ úm đến xuất chuồng',
        createdAt: formatDate(-50)
      },
      {
        id: 'tx_b3_chicks_exp',
        batchId: batch3.id,
        farmId: 'farm_01',
        type: 'expense',
        category: 'chicks',
        categoryName: 'Con giống',
        amount: 16200000,
        date: formatDate(-150),
        paymentMethod: 'bank_transfer',
        payerReceiverName: 'Trại Giống Dabaco',
        notes: '1.200 con gà giống',
        createdAt: formatDate(-150)
      }
    ];

    // Health Records
    const healthRecords: HealthRecord[] = [
      {
        id: 'hr_01',
        batchId: batch1.id,
        date: formatDate(-42),
        deathsCount: 12,
        cullsCount: 3,
        suspectedDiseases: ['Hao hụt tự nhiên khi mới nhập', 'Lạnh chân'],
        symptoms: ['Gà con yếu, dồn cục dưới đèn úm'],
        treatmentNotes: 'Nâng cao nhiệt độ bóng úm lên 33 độ C, bổ sung Vitamin C và đường Glucose.',
        isResolved: true,
        createdAt: formatDate(-42)
      },
      {
        id: 'hr_02',
        batchId: batch1.id,
        date: formatDate(-22),
        deathsCount: 8,
        cullsCount: 2,
        suspectedDiseases: ['Bệnh Cầu Trùng (Coccidiosis) nhẹ'],
        symptoms: ['Phân sáp vàng', 'Xù lông nhẹ'],
        medicationsUsed: ['Toltrazuril 2.5%', 'Vitamin K chống xuất huyết'],
        medicationDosage: '1ml / 1 lít nước uống 2 ngày liên tục',
        withdrawalDays: 5,
        withdrawalEndDate: formatDate(-15),
        treatmentNotes: 'Đàn gà đã hồi phục hoàn toàn, phân khô ráo sau 2 ngày điều trị.',
        isResolved: true,
        createdAt: formatDate(-22)
      },
      {
        id: 'hr_03',
        batchId: batch1.id,
        date: formatDate(-5),
        deathsCount: 7,
        cullsCount: 0,
        suspectedDiseases: ['Hen khẹc do thời tiết đổi gió lạnh'],
        symptoms: ['Khò khè ban đêm', 'Vẩy mỏ'],
        medicationsUsed: ['Doxycycline + Tylosin', 'Bromhexine long đờm'],
        medicationDosage: '1g / 2 lít nước',
        withdrawalDays: 7,
        withdrawalEndDate: formatDate(2), // Active withdrawal reminder!
        treatmentNotes: 'Đang uống thuốc ngày thứ 3, giảm tiếng khò khè rõ rệt.',
        isResolved: false,
        createdAt: formatDate(-5)
      }
    ];

    // Batch Events
    const batchEvents: BatchEvent[] = [
      {
        id: 'evt_01',
        batchId: batch1.id,
        eventType: 'import',
        date: batch1Start,
        quantity: 1000,
        avgWeightGrams: 40,
        title: 'Nhập đàn 1.000 con gà Ri Lai 1 ngày tuổi',
        description: 'Kiểm tra con giống khỏe mạnh, rốn khô, lông bông tơi xốp, chân mập bóng.',
        createdAt: batch1Start
      },
      {
        id: 'evt_02',
        batchId: batch1.id,
        eventType: 'weight_sample',
        date: formatDate(-25),
        avgWeightGrams: 420,
        title: 'Cân mẫu ngẫu nhiên 30 con ngày tuổi 20',
        description: 'Trọng lượng bình quân 420g/con, đạt chuẩn tăng trưởng của giống gà Ri lai.',
        createdAt: formatDate(-25)
      },
      {
        id: 'evt_03',
        batchId: batch1.id,
        eventType: 'weight_sample',
        date: formatDate(-5),
        avgWeightGrams: 950,
        title: 'Cân mẫu ngày tuổi 40',
        description: 'Trọng lượng bình quân 950g/con, mào bắt đầu nhú đỏ, đàn đồng đều.',
        createdAt: formatDate(-5)
      }
    ];

    const subscriptions: Subscription[] = [
      {
        id: 'sub_01',
        userId: 'usr_farmer_01',
        plan: 'premium',
        planName: 'Gói Nông Hộ (Chuyên Nghiệp)',
        amountPaid: 49000,
        paymentMethod: 'VietQR - Ngân hàng Quân Đội MBBank',
        transactionId: 'VNPAY_20250101_88271',
        startDate: '2025-01-01T00:00:00.000Z',
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        createdAt: '2025-01-01T00:00:00.000Z'
      }
    ];

    const notifications: AppNotification[] = [
      {
        id: 'notif_01',
        userId: 'usr_farmer_01',
        title: '💉 Nhắc lịch tiêm Vaccine hôm nay!',
        body: 'Lứa Gà Ri Lai Đồi #01 đến ngày tiêm Vaccine Cúm Gia Cầm Lần 1 (H5N1). Hãy tiêm đúng liều 0.3ml/con.',
        type: 'vaccine',
        relatedBatchId: batch1.id,
        isRead: false,
        createdAt: new Date().toISOString()
      },
      {
        id: 'notif_02',
        userId: 'usr_farmer_01',
        title: '⚠️ Cảnh báo thời gian ngưng thuốc',
        body: 'Đàn gà Ri Lai đang trong thời gian cách ly thuốc Hen khẹc Doxycycline (còn 2 ngày nữa mới hết hạn ngưng thuốc). Tuyệt đối không xuất bán trước hạn.',
        type: 'health',
        relatedBatchId: batch1.id,
        isRead: false,
        createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
      },
      {
        id: 'notif_03',
        userId: 'usr_farmer_01',
        title: '📈 Cập nhật giá gia cầm miền Bắc',
        body: 'Giá gà Ri Lai xuất chuồng hôm nay tăng nhẹ +1.500 đ/kg lên mức 82.000 - 85.000 đ/kg. Thị trường đang tiêu thụ tốt.',
        type: 'market',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
      }
    ];

    return {
      users: [defaultUser],
      farms: [defaultFarm, secondFarm],
      batches: [batch1, batch2, batch3],
      batchEvents,
      vaccineSchedules: batch1Vaccines,
      feedPurchases,
      feedConsumptions,
      transactions,
      healthRecords,
      subscriptions,
      notifications,
      marketPrices: INITIAL_MARKET_PRICES
    };
  }
}

export const db = new FarmGoDatabase();
