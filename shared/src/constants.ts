
import { 
  ChickenBreed, 
  VaccineDefinition, 
  SubscriptionPlan, 
  MarketPriceItem, 
  ExpenseCategory, 
  IncomeCategory 
} from './types.js';

export const VIETNAMESE_CHICKEN_BREEDS: ChickenBreed[] = [
  {
    id: 'ga_ri_lai',
    name: 'Gà Ri Lai',
    category: 'ta_tha_vuon',
    categoryName: 'Gà Ta thả vườn',
    origin: 'Việt Nam (Lai tạo giữa gà Ri thuần và gà Lương Phượng)',
    description: 'Giống gà phổ biến nhất trong chăn nuôi nông hộ tại Việt Nam. Thịt thơm ngon, săn chắc, mào cờ đỏ tươi, chân vàng, sức đề kháng cao, dễ nuôi.',
    characteristics: [
      'Lông màu vàng rơm, hoa mơ, nâu cánh gián',
      'Chân nhỏ, màu vàng tươi, da vàng',
      'Thích nghi rất tốt với thời tiết nắng mưa nhiệt đới',
      'Thịt dai ngọt, da giòn, mỡ thơm'
    ],
    standardGrowthDays: 105,
    standardMarketWeightKg: 1.8,
    targetFCR: 2.7,
    expectedMortalityRate: 3.5,
    recommendedFeedingPhases: [
      { phase: 'brooding', phaseName: 'Giai đoạn Úm (1 - 21 ngày)', daysRange: '1 - 21 ngày', proteinPercent: '21%', dailyFeedPerBirdGrams: '15 - 28g' },
      { phase: 'grower', phaseName: 'Giai đoạn Tăng trưởng (22 - 60 ngày)', daysRange: '22 - 60 ngày', proteinPercent: '19%', dailyFeedPerBirdGrams: '35 - 65g' },
      { phase: 'finisher', phaseName: 'Giai đoạn Vỗ béo (61 ngày - Xuất chuồng)', daysRange: '61 - 105 ngày', proteinPercent: '16.5%', dailyFeedPerBirdGrams: '75 - 100g' }
    ]
  },
  {
    id: 'ga_mia_son_tay',
    name: 'Gà Mía Sơn Tây',
    category: 'dac_san',
    categoryName: 'Gà Đặc sản truyền thống',
    origin: 'Làng cổ Đường Lâm, Sơn Tây, Hà Nội',
    description: 'Giống gà tiến vua danh tiếng, mình ngắn, đùi to tròn, mào cờ, da đỏ au mọng nước. Thịt ngọt đậm đà, da dày giòn, giá bán thương phẩm cao.',
    characteristics: [
      'Trống lông đỏ tiết đốm đen, đuôi cong vút; Mái lông màu lá chuối khô',
      'Chân có vảy xếp đều, màu vàng bóng',
      'Thời gian nuôi dài hơn gà ri nhưng thịt rất chắc và đậm vị',
      'Được ưa chuộng vào dịp Lễ, Tết, tiệc cưới'
    ],
    standardGrowthDays: 125,
    standardMarketWeightKg: 2.2,
    targetFCR: 3.1,
    expectedMortalityRate: 4.0,
    recommendedFeedingPhases: [
      { phase: 'brooding', phaseName: 'Giai đoạn Úm', daysRange: '1 - 25 ngày', proteinPercent: '21%', dailyFeedPerBirdGrams: '18 - 30g' },
      { phase: 'grower', phaseName: 'Giai đoạn Nuôi thả', daysRange: '26 - 75 ngày', proteinPercent: '18.5%', dailyFeedPerBirdGrams: '40 - 70g' },
      { phase: 'finisher', phaseName: 'Giai đoạn Vỗ béo ngô thóc', daysRange: '76 - 125 ngày', proteinPercent: '16%', dailyFeedPerBirdGrams: '80 - 110g' }
    ]
  },
  {
    id: 'ga_dong_tao',
    name: 'Gà Đông Tảo Hưng Yên',
    category: 'dac_san',
    categoryName: 'Gà Đặc sản quý hiếm',
    origin: 'Xã Đông Tảo, huyện Khoái Châu, tỉnh Hưng Yên',
    description: 'Giống gà quý hiếm với đôi chân to sù sì vảy rồng đặc trưng, thân hình lực lưỡng, da đỏ au. Giá trị kinh tế rất cao, thịt giòn như sụn tai.',
    characteristics: [
      'Cặp chân to ngoại cỡ, xù xì màu đỏ cam',
      'Đầu gộc, mào nụ màu đỏ thẫm',
      'Tốc độ lớn chậm, đòi hỏi kỹ thuật úm và chăm sóc kỹ lưỡng',
      'Giá bán cao gấp 3-5 lần gà thương phẩm thông thường'
    ],
    standardGrowthDays: 180,
    standardMarketWeightKg: 3.5,
    targetFCR: 3.8,
    expectedMortalityRate: 6.0,
    recommendedFeedingPhases: [
      { phase: 'brooding', phaseName: 'Úm kỹ kháng thể', daysRange: '1 - 30 ngày', proteinPercent: '22%', dailyFeedPerBirdGrams: '20 - 35g' },
      { phase: 'grower', phaseName: 'Phát triển khung xương & chân', daysRange: '31 - 90 ngày', proteinPercent: '19%', dailyFeedPerBirdGrams: '50 - 90g' },
      { phase: 'finisher', phaseName: 'Tăng trọng thịt giòn', daysRange: '91 - 180 ngày', proteinPercent: '16%', dailyFeedPerBirdGrams: '100 - 140g' }
    ]
  },
  {
    id: 'ga_tam_hoang',
    name: 'Gà Tam Hoàng (Thịt & Trứng)',
    category: 'cong_nghiep',
    categoryName: 'Gà Bán công nghiệp',
    origin: 'Quảng Đông - Trung Quốc (du nhập và thích nghi tại VN)',
    description: 'Giống gà ba màu vàng: lông vàng, chân vàng, mỏ vàng da vàng. Tốc độ lớn nhanh, tỷ lệ mỡ cao, nuôi thả vườn hoặc bán thâm canh rất hiệu quả.',
    characteristics: [
      'Toàn thân phủ lông vàng ánh kim',
      'Lớn nhanh, thời gian nuôi ngắn 70 - 85 ngày',
      'Thịt mềm, da mỡ vàng óng ả hợp thị hiếu quán ăn',
      'Độ đồng đều đàn rất cao'
    ],
    standardGrowthDays: 80,
    standardMarketWeightKg: 2.1,
    targetFCR: 2.4,
    expectedMortalityRate: 3.0,
    recommendedFeedingPhases: [
      { phase: 'brooding', phaseName: 'Úm cao đạm', daysRange: '1 - 20 ngày', proteinPercent: '21.5%', dailyFeedPerBirdGrams: '20 - 32g' },
      { phase: 'grower', phaseName: 'Thúc lớn', daysRange: '21 - 50 ngày', proteinPercent: '19.5%', dailyFeedPerBirdGrams: '45 - 80g' },
      { phase: 'finisher', phaseName: 'Vỗ béo lên màu da', daysRange: '51 - 80 ngày', proteinPercent: '17%', dailyFeedPerBirdGrams: '90 - 120g' }
    ]
  },
  {
    id: 'ga_luong_phuong',
    name: 'Gà Lương Phượng (Hoa mơ)',
    category: 'ta_tha_vuon',
    categoryName: 'Gà Kiêm dụng thịt & trứng',
    origin: 'Trung Quốc (thuần hóa tại Việt Nam)',
    description: 'Gà hoa mơ mình nở, chống chịu bệnh tật cực khỏe, đẻ trứng sai và nuôi thịt lớn nhanh. Thường dùng làm đàn mẹ phối với gà trống Ri.',
    characteristics: [
      'Lông hoa mơ đốm đen hoặc vàng đốm',
      'Sức đề kháng vượt trội, ít mắc bệnh hô hấp',
      'Trọng lượng xuất bán tốt, năng suất cao'
    ],
    standardGrowthDays: 85,
    standardMarketWeightKg: 2.3,
    targetFCR: 2.5,
    expectedMortalityRate: 2.8,
    recommendedFeedingPhases: [
      { phase: 'brooding', phaseName: 'Giai đoạn Úm', daysRange: '1 - 21 ngày', proteinPercent: '21%', dailyFeedPerBirdGrams: '20 - 30g' },
      { phase: 'grower', phaseName: 'Giai đoạn Phát triển', daysRange: '22 - 55 ngày', proteinPercent: '19%', dailyFeedPerBirdGrams: '45 - 80g' },
      { phase: 'finisher', phaseName: 'Giai đoạn Vỗ béo', daysRange: '56 - 85 ngày', proteinPercent: '17%', dailyFeedPerBirdGrams: '90 - 125g' }
    ]
  },
  {
    id: 'ga_den_hmong',
    name: "Gà Đen H'Mông (Gà Mèo Tây Bắc)",
    category: 'dac_san',
    categoryName: 'Gà Đặc sản bồi bổ',
    origin: 'Vùng cao Tây Bắc (Hà Giang, Lào Cai, Sơn La)',
    description: 'Giống gà đặc biệt quý với da đen, thịt đen, xương đen và nội tạng đen. Hàm lượng axit amin và sắt rất cao, làm thuốc bồi bổ sức khỏe cho người già và trẻ nhỏ.',
    characteristics: [
      'Da, thịt, màng mắt, xương đều màu đen tuyền',
      'Thịt cực kỳ săn chắc, không ngấy, hương vị độc đáo',
      'Nuôi thả đồi dốc tự nhiên, kháng bệnh tự nhiên tốt'
    ],
    standardGrowthDays: 130,
    standardMarketWeightKg: 1.6,
    targetFCR: 3.2,
    expectedMortalityRate: 3.5,
    recommendedFeedingPhases: [
      { phase: 'brooding', phaseName: 'Úm sưởi ấm', daysRange: '1 - 28 ngày', proteinPercent: '21%', dailyFeedPerBirdGrams: '15 - 25g' },
      { phase: 'grower', phaseName: 'Thả đồi tự kiếm ăn', daysRange: '29 - 80 ngày', proteinPercent: '18%', dailyFeedPerBirdGrams: '35 - 60g' },
      { phase: 'finisher', phaseName: 'Bổ sung lúa ngô', daysRange: '81 - 130 ngày', proteinPercent: '15.5%', dailyFeedPerBirdGrams: '65 - 85g' }
    ]
  },
  {
    id: 'ga_trang_broiler',
    name: 'Gà Trắng Công Nghiệp (Broiler)',
    category: 'cong_nghiep',
    categoryName: 'Gà Nuôi Trại Khép Kín',
    origin: 'Ross 308 / Cobb 500 Quốc tế',
    description: 'Giống gà siêu thịt lớn nhanh vượt bậc nuôi trong chuồng lạnh khép kín. FCR cực thấp, chu kỳ nuôi chỉ 38 - 45 ngày.',
    characteristics: [
      'Lông trắng toát, ức nở tròn đầy thịt',
      'Tăng trọng thần tốc, FCR cực kỳ tiết kiệm cám',
      'Đòi hỏi chuồng lạnh, thông gió và kiểm soát dịch tễ nghiêm ngặt'
    ],
    standardGrowthDays: 42,
    standardMarketWeightKg: 2.8,
    targetFCR: 1.65,
    expectedMortalityRate: 3.0,
    recommendedFeedingPhases: [
      { phase: 'brooding', phaseName: 'Starter (1 - 14 ngày)', daysRange: '1 - 14 ngày', proteinPercent: '23%', dailyFeedPerBirdGrams: '25 - 45g' },
      { phase: 'grower', phaseName: 'Grower (15 - 28 ngày)', daysRange: '15 - 28 ngày', proteinPercent: '21%', dailyFeedPerBirdGrams: '70 - 130g' },
      { phase: 'finisher', phaseName: 'Finisher (29 - 42 ngày)', daysRange: '29 - 42 ngày', proteinPercent: '19%', dailyFeedPerBirdGrams: '150 - 210g' }
    ]
  }
];

export const STANDARD_VACCINE_LIBRARY: VaccineDefinition[] = [
  {
    id: 'vac_marek',
    name: 'Vaccine Marek',
    diseaseName: 'Bệnh Marek (Ung thư bạch huyết gia cầm)',
    recommendedAgeDaysStart: 1,
    recommendedAgeDaysEnd: 1,
    applicationMethod: 'subcutaneous_neck',
    applicationMethodName: 'Tiêm dưới da cổ (1 ngày tuổi tại lò ấp)',
    isMandatory: true,
    notes: 'Thường được tiêm ngay khi gà vừa nở tại lò giống. Giúp phòng ngừa liệt cánh chân và khối u nội tạng.',
    defaultDose: '0.2 ml/con'
  },
  {
    id: 'vac_newcastle_1',
    name: 'Vaccine Newcastle lần 1 (ND-IB / Lasota)',
    diseaseName: 'Dịch tả gà Newcastle & Viêm phế quản truyền nhiễm (IB)',
    recommendedAgeDaysStart: 3,
    recommendedAgeDaysEnd: 5,
    applicationMethod: 'eye_nose_drop',
    applicationMethodName: 'Nhỏ mắt hoặc nhỏ mũi',
    isMandatory: true,
    notes: 'Dùng chủng nhược độc Lasota hoặc kết hợp ND-IB Clon 30. Nhỏ 1 giọt vào 1 bên mắt/mũi gà.',
    defaultDose: '1 liều (1 giọt/con)'
  },
  {
    id: 'vac_gumboro_1',
    name: 'Vaccine Gumboro lần 1 (IBD)',
    diseaseName: 'Bệnh Gumboro (Viêm túi Fabricius làm suy giảm miễn dịch)',
    recommendedAgeDaysStart: 7,
    recommendedAgeDaysEnd: 10,
    applicationMethod: 'oral_water',
    applicationMethodName: 'Nhỏ miệng hoặc pha nước uống',
    isMandatory: true,
    notes: 'Dùng chủng Gumboro trung bình (Intermediate). Không dùng nước có clo để pha vaccine.',
    defaultDose: '1 liều/con'
  },
  {
    id: 'vac_dau_ga',
    name: 'Vaccine Đậu Gà (Avian Pox)',
    diseaseName: 'Bệnh Đậu Gà (Nốt đậu mào, mép mỏ và niêm mạc)',
    recommendedAgeDaysStart: 12,
    recommendedAgeDaysEnd: 15,
    applicationMethod: 'wing_web',
    applicationMethodName: 'Đâm màng da cánh',
    isMandatory: true,
    notes: 'Dùng kim đôi chuyên dụng nhúng vaccine đâm qua màng cánh (tránh mạch máu và gân). Kiểm tra nốt đậu sau 5 ngày.',
    defaultDose: '1 liều đâm cánh'
  },
  {
    id: 'vac_gumboro_2',
    name: 'Vaccine Gumboro lần 2 (Nhắc lại)',
    diseaseName: 'Bệnh Gumboro (Củng cố miễn dịch giai đoạn mẫn cảm)',
    recommendedAgeDaysStart: 18,
    recommendedAgeDaysEnd: 21,
    applicationMethod: 'oral_water',
    applicationMethodName: 'Cho uống nước pha sữa gầy',
    isMandatory: true,
    notes: 'Hãm nước 1-2 tiếng trước khi cho uống để gà uống hết trong vòng 1-2 giờ.',
    defaultDose: '1 liều/con'
  },
  {
    id: 'vac_newcastle_2',
    name: 'Vaccine Newcastle lần 2 (Lasota lặp lại)',
    diseaseName: 'Dịch tả gà Newcastle (Giai đoạn chuyển chuồng)',
    recommendedAgeDaysStart: 22,
    recommendedAgeDaysEnd: 25,
    applicationMethod: 'oral_water',
    applicationMethodName: 'Nhỏ mắt hoặc cho uống nước',
    isMandatory: true,
    notes: 'Củng cố kháng thể niêm mạc đường hô hấp và tiêu hóa.',
    defaultDose: '1 liều/con'
  },
  {
    id: 'vac_ib_bien_chung',
    name: 'Vaccine Viêm Phế Quản Truyền Nhiễm (IB 4/91)',
    diseaseName: 'Viêm phế quản truyền nhiễm biến chủng',
    recommendedAgeDaysStart: 28,
    recommendedAgeDaysEnd: 32,
    applicationMethod: 'oral_water',
    applicationMethodName: 'Pha nước uống hoặc phun sương',
    isMandatory: false,
    notes: 'Rất cần thiết tại các vùng dịch tễ hô hấp phức tạp hoặc mùa đông miền Bắc.',
    defaultDose: '1 liều/con'
  },
  {
    id: 'vac_cum_gia_cam_1',
    name: 'Vaccine Cúm Gia Cầm Lần 1 (H5N1 / H5N6 / H5N8 Vô Hoạt)',
    diseaseName: 'Cúm gia cầm độc lực cao (Avian Influenza)',
    recommendedAgeDaysStart: 35,
    recommendedAgeDaysEnd: 42,
    applicationMethod: 'intramuscular_breast',
    applicationMethodName: 'Tiêm bắp lườn hoặc dưới da cổ',
    isMandatory: true,
    notes: 'Vaccine vô hoạt nhũ dầu. Bắt buộc theo quy định thú y quốc gia. Tiêm đúng liều, lắc đều lọ vaccine.',
    defaultDose: '0.3 - 0.5 ml/con'
  },
  {
    id: 'vac_tu_huyet_trung',
    name: 'Vaccine Tụ Huyết Trùng Gia Cầm',
    diseaseName: 'Bệnh Tụ Huyết Trùng (Chết đột ngột, mào tím tái)',
    recommendedAgeDaysStart: 45,
    recommendedAgeDaysEnd: 50,
    applicationMethod: 'subcutaneous_neck',
    applicationMethodName: 'Tiêm dưới da hoặc tiêm bắp',
    isMandatory: true,
    notes: 'Phòng bệnh thời điểm giao mùa thay đổi thời tiết đột ngột.',
    defaultDose: '0.5 ml/con'
  },
  {
    id: 'vac_newcastle_he_1',
    name: 'Vaccine Newcastle Hệ 1 (Tiêm)',
    diseaseName: 'Dịch tả gà Newcastle thể độc lực mạnh (Bảo hộ kéo dài)',
    recommendedAgeDaysStart: 60,
    recommendedAgeDaysEnd: 70,
    applicationMethod: 'intramuscular_breast',
    applicationMethodName: 'Tiêm bắp thịt hoặc dưới da',
    isMandatory: true,
    notes: 'Chỉ tiêm cho gà trên 2 tháng tuổi đã qua 2 lần nhỏ Lasota. Miễn dịch kéo dài suốt đời gà nuôi thịt.',
    defaultDose: '0.5 ml/con'
  },
  {
    id: 'vac_cum_gia_cam_2',
    name: 'Vaccine Cúm Gia Cầm Lần 2 (Nhắc lại cho gà nuôi > 100 ngày)',
    diseaseName: 'Cúm gia cầm tái tiêm bảo hộ',
    recommendedAgeDaysStart: 75,
    recommendedAgeDaysEnd: 85,
    applicationMethod: 'intramuscular_breast',
    applicationMethodName: 'Tiêm bắp lườn',
    isMandatory: false,
    notes: 'Dành cho gà thả vườn nuôi trên 3.5 tháng, gà đẻ trứng hoặc gà giống.',
    defaultDose: '0.5 ml/con'
  }
];

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Gói Nông Dân (Miễn Phí)',
    pricePerMonth: 0,
    maxActiveBatches: 1,
    maxFarms: 1,
    hasPdfExport: false,
    hasAiAssistant: false,
    hasSmsNotification: false,
    hasMultiUserFarm: false,
    features: [
      'Quản lý 1 lứa nuôi gà cùng lúc',
      'Tự động tạo lịch tiêm vaccine chuẩn',
      'Ghi chép thu chi & thức ăn cơ bản',
      'Theo dõi số lượng gà sống chết',
      'Nhắc lịch tiêm qua thông báo ứng dụng'
    ]
  },
  {
    id: 'premium',
    name: 'Gói Nông Hộ (Chuyên Nghiệp)',
    pricePerMonth: 49000,
    maxActiveBatches: 5,
    maxFarms: 3,
    hasPdfExport: true,
    hasAiAssistant: true,
    hasSmsNotification: false,
    hasMultiUserFarm: false,
    features: [
      'Quản lý tối đa 5 lứa nuôi song song',
      'Quản lý 3 khu chuồng / trang trại',
      'Cảnh báo FCR và tồn kho cám thông minh',
      'Báo cáo tài chính & Biểu đồ ROI chi tiết',
      'Xuất báo cáo PDF / Excel gửi kế toán, khuyến nông',
      'Trợ lý AI tư vấn chăn nuôi & chuẩn đoán bệnh gà',
      'Cảnh báo ngưng thuốc an toàn sinh học'
    ]
  },
  {
    id: 'pro',
    name: 'Gói Trang Trại (VIP Không Giới Hạn)',
    pricePerMonth: 99000,
    maxActiveBatches: 999,
    maxFarms: 99,
    hasPdfExport: true,
    hasAiAssistant: true,
    hasSmsNotification: true,
    hasMultiUserFarm: true,
    features: [
      'Không giới hạn số lứa nuôi & quy mô trang trại',
      'Hỗ trợ nhiều cơ sở / nhiều người cùng quản lý',
      'AI Phân tích dữ liệu & Dự báo ngày xuất bán tối ưu nhất',
      'Chuẩn đoán bệnh gà bằng hình ảnh & triệu chứng nâng cao',
      'Nhắc lịch vaccine qua SMS & Zalo ZNS',
      'Hỗ trợ kỹ sư thú y ưu tiên 24/7'
    ]
  }
];

export const EXPENSE_CATEGORIES_INFO: Record<ExpenseCategory, { label: string; icon: string; color: string }> = {
  chicks: { label: 'Con giống', icon: 'Egg', color: '#F59E0B' },
  feed: { label: 'Thức ăn cám', icon: 'Wheat', color: '#10B981' },
  vaccine: { label: 'Vaccine phòng bệnh', icon: 'Syringe', color: '#3B82F6' },
  medicine: { label: 'Thuốc thú y & Sát trùng', icon: 'Pill', color: '#8B5CF6' },
  bedding_litter: { label: 'Trấu & Đệm lót', icon: 'Layers', color: '#D97706' },
  electricity_water: { label: 'Điện, Nước & Sưởi', icon: 'Zap', color: '#EC4899' },
  labor: { label: 'Nhân công chăm sóc', icon: 'Users', color: '#6366F1' },
  equipment: { label: 'Dụng cụ & Máng ăn', icon: 'Tool', color: '#64748B' },
  cage_depreciation: { label: 'Khấu hao chuồng trại', icon: 'Home', color: '#0EA5E9' },
  other_expense: { label: 'Chi phí khác', icon: 'MoreHorizontal', color: '#94A3B8' }
};

export const INCOME_CATEGORIES_INFO: Record<IncomeCategory, { label: string; icon: string; color: string }> = {
  sell_chicken_meat: { label: 'Bán gà thịt thương phẩm', icon: 'DollarSign', color: '#16A34A' },
  sell_chicken_breed: { label: 'Bán gà giống / gà hậu bị', icon: 'TrendingUp', color: '#059669' },
  sell_eggs: { label: 'Bán trứng gà', icon: 'Sun', color: '#EAB308' },
  sell_manure: { label: 'Bán phân gà & trấu thải', icon: 'Recycle', color: '#84CC16' },
  other_income: { label: 'Thu nhập khác', icon: 'PlusCircle', color: '#14B8A6' }
};

export const COMMON_POULTRY_DISEASES = [
  {
    name: 'Bệnh Cầu Trùng (Coccidiosis)',
    symptoms: ['Phân sáp vàng', 'Phân có lẫn máu tươi', 'Xù lông, cánh sã', 'Gà uống nhiều nước, giảm ăn'],
    treatmentSuggestion: 'Dùng thuốc đặc trị Cầu trùng: Diclazuril, Toltrazuril (Baycox) hoặc Sulfaclozine kết hợp Vitamin K chống xuất huyết.',
    preventiveGuide: 'Giữ chuồng khô ráo, đảo đệm lót trấu thường xuyên, tránh ẩm ướt chân gà.',
    withdrawalDays: 5
  },
  {
    name: 'Bệnh CRD / Hen Khẹc (Mycoplasma)',
    symptoms: ['Khò khè ban đêm', 'Chảy nước mũi, vẩy mỏ', 'Mắt sưng sủi bọt', 'Thở há mỏ'],
    treatmentSuggestion: 'Dùng Tylosin, Tilmicosin, Doxycycline hoặc Enrofloxacin uống liên tục 3-5 ngày kết hợp thuốc long đờm Bromhexine.',
    preventiveGuide: 'Giữ ấm chuồng úm, thông thoáng khí nhưng không để gió lùa trực tiếp.',
    withdrawalDays: 7
  },
  {
    name: 'Bệnh Gumboro (IBD)',
    symptoms: ['Ủ rũ hàng loạt', 'Tự cắn mổ hậu môn', 'Sốt cao, lông xù', 'Phân trắng loãng như vôi', 'Chết nhanh dồn dập'],
    treatmentSuggestion: 'Không dùng kháng sinh mạnh ngay. Hạ sốt bằng Paracetamol + Điện giải Gluco-KC + Tiêm kháng thể Gumboro nếu đàn chưa quá nặng.',
    preventiveGuide: 'Nhỏ vaccine Gumboro chuẩn ngày 7-10 và nhắc lại ngày 18-21.',
    withdrawalDays: 0
  },
  {
    name: 'Bệnh Newcastle (Dịch tả gà)',
    symptoms: ['Khó thở, há mỏ thở dốc', 'Phân xanh trắng', 'Liệt cánh chân, ngoẹo đầu quay vòng', 'Diều căng đầy hơi và nước chua'],
    treatmentSuggestion: 'Cách ly ngay. Cho uống kháng thể dịch tả Newcastle, bổ sung điện giải chống kiệt sức. Sát trùng toàn bộ chuồng trại.',
    preventiveGuide: 'Làm đầy đủ lịch vaccine Newcastle (Lasota lần 1, 2 và Hệ 1).',
    withdrawalDays: 0
  },
  {
    name: 'Bệnh E.coli & Thương Hàn (Salmonella)',
    symptoms: ['Tiêu chảy phân trắng dính bết hậu môn', 'Bụng chướng to', 'Chân khô quắt', 'Lờ đờ chậm lớn'],
    treatmentSuggestion: 'Sử dụng Amoxicillin, Enrofloxacin, Florfenicol hoặc Neomycin kết hợp men tiêu hóa Probiotic.',
    preventiveGuide: 'Sát trùng nguồn nước uống bằng Cloramin B hoặc giấm ăn tỷ lệ nhẹ, diệt chuột và chim bồ câu.',
    withdrawalDays: 7
  }
];

export const INITIAL_MARKET_PRICES: MarketPriceItem[] = [
  {
    id: 'mp_ga_ri_bac',
    region: 'Mien Bac',
    productName: 'Gà Ri Lai thả vườn (100 - 110 ngày)',
    unit: 'kg',
    minPrice: 78000,
    maxPrice: 85000,
    avgPrice: 82000,
    trend: 'up',
    changePercent: 3.8,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mp_ga_mia_bac',
    region: 'Mien Bac',
    productName: 'Gà Mía Sơn Tây (Hà Nội, Vĩnh Phúc)',
    unit: 'kg',
    minPrice: 88000,
    maxPrice: 96000,
    avgPrice: 92000,
    trend: 'stable',
    changePercent: 0.5,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mp_ga_ta_nam',
    region: 'Mien Nam',
    productName: 'Gà Ta Thả Vườn (Đồng Nai, Bình Phước)',
    unit: 'kg',
    minPrice: 65000,
    maxPrice: 72000,
    avgPrice: 68500,
    trend: 'up',
    changePercent: 2.2,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mp_ga_trang_trung',
    region: 'Mien Trung',
    productName: 'Gà Trắng Công Nghiệp (Broiler xuất chuồng)',
    unit: 'kg',
    minPrice: 32000,
    maxPrice: 36000,
    avgPrice: 34500,
    trend: 'down',
    changePercent: -1.8,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'mp_trung_ga_ta',
    region: 'Mien Bac',
    productName: 'Trứng gà Ta sạch',
    unit: 'quả',
    minPrice: 3200,
    maxPrice: 3800,
    avgPrice: 3500,
    trend: 'stable',
    changePercent: 0.0,
    updatedAt: new Date().toISOString()
  }
];
