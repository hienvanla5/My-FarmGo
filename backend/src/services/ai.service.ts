
import { BatchService } from './batch.service.js';
import { FeedService } from './feed.service.js';
import { COMMON_POULTRY_DISEASES, VIETNAMESE_CHICKEN_BREEDS, INITIAL_MARKET_PRICES } from 'farmgo-shared';

export class AiService {
  static async chat(userMessage: string, context?: { batchId?: string; farmId?: string }): Promise<{
    reply: string;
    suggestedActions?: { label: string; actionType: string; payload?: any }[];
    relatedTopics?: string[];
  }> {
    const q = userMessage.toLowerCase();

    // 1. If asking about a specific batch
    if (context?.batchId) {
      try {
        const batch = await BatchService.getBatchById(context.batchId);
        if (batch) {
          if (q.includes('fcr') || q.includes('tiêu tốn') || q.includes('cám')) {
            const fcr = await FeedService.getFcrAnalysis(batch.id);
            return {
              reply: `📊 **Phân tích FCR Lứa ${batch.name}:**\n- Ngày tuổi hiện tại: **${batch.ageInDays} ngày**\n- FCR hiện tại: **${fcr.currentFCR}** (Chuẩn giống: **${fcr.targetFCR}**)\n- Đánh giá: **${fcr.statusText}**\n- Lượng cám đã ăn: **${fcr.totalFeedKg.toLocaleString('vi-VN')} kg**\n- Lượng cám ăn bình quân: **${fcr.avgDailyFeedPerBirdGrams} g/con/ngày**\n\n💡 **Lời khuyên từ Chuyên gia:**\n${fcr.suggestions.map(s => '- ' + s).join('\n')}`,
              suggestedActions: [
                { label: 'Ghi chép lượng cám hôm nay', actionType: 'navigate', payload: { tab: 'feed' } },
                { label: 'Cân mẫu ngẫu nhiên', actionType: 'navigate', payload: { tab: 'events' } }
              ],
              relatedTopics: ['Cách giảm FCR', 'Phòng bệnh tiêu hóa', 'Định mức cám theo tuần tuổi']
            };
          }

          if (q.includes('xuất') || q.includes('bán') || q.includes('lãi') || q.includes('lời')) {
            const harvest = await this.predictOptimalHarvest(batch.id);
            return {
              reply: `🎯 **Dự báo thời điểm xuất bán tối ưu cho ${batch.name}:**\n- Trọng lượng hiện tại: ~**${(batch.currentAvgWeightGrams || 500) / 1000} kg/con**\n- Trọng lượng mục tiêu: **${harvest.targetWeightKg} kg/con**\n- Thời điểm xuất chuồng khuyến nghị: **${harvest.recommendedHarvestDate}** (khoảng **${harvest.daysToHarvest} ngày** nữa)\n- Giá gà thị trường tham khảo: **${harvest.marketPricePerKg.toLocaleString('vi-VN')} đ/kg**\n- Doanh thu dự kiến: **${harvest.estimatedRevenue.toLocaleString('vi-VN')} đ**\n- Chi phí dự tính: **${harvest.estimatedTotalCost.toLocaleString('vi-VN')} đ**\n- **Lợi nhuận ròng ước tính:** 💰 **${harvest.estimatedNetProfit.toLocaleString('vi-VN')} đ** (ROI: **${harvest.estimatedROI}%**)\n\n📌 **Khuyến cáo:** ${harvest.analysis}`,
              suggestedActions: [
                { label: 'Xem Báo cáo tài chính lứa', actionType: 'navigate', payload: { tab: 'finance' } },
                { label: 'Kiểm tra ngưng thuốc trước bán', actionType: 'navigate', payload: { tab: 'health' } }
              ]
            };
          }
        }
      } catch (err) {
        console.error('Error fetching batch context for AI:', err);
      }
    }

    // 2. Specific topic handling
    if (q.includes('cầu trùng') || q.includes('phân sáp') || q.includes('phân máu')) {
      return {
        reply: `🔴 **Chẩn đoán & Phác đồ điều trị Bệnh Cầu Trùng (Coccidiosis):**\n\n1. **Dấu hiệu:** Phân sáp vàng hoặc nâu đỏ lẫn vệt máu tươi, gà xù lông sã cánh, uống nhiều nước nhưng lười ăn.\n\n2. **Phác đồ xử lý:**\n- **Thuốc đặc trị:** Dùng **Toltrazuril 2.5%** (1ml / 1 lít nước, uống 2 ngày) HOẶC **Diclazuril / Sulfaclozine 30%** uống 3 ngày nghỉ 2 ngày uống 2 ngày.\n- **Bổ sung bắt buộc:** **Vitamin K** (cầm máu chống xuất huyết ruột) + **Điện giải B-Complex**.\n- **Vệ sinh:** Cào rắc vôi bột lên các vị trí ẩm ướt quanh máng uống, đảo lớp trấu mặt hoặc rải thêm trấu khô mới.\n\n⏳ **Lưu ý thời gian ngưng thuốc:** 5 - 7 ngày trước khi xuất bán thịt.`,
        suggestedActions: [
          { label: 'Ghi nhật ký bệnh & thuốc', actionType: 'navigate', payload: { tab: 'health' } }
        ],
        relatedTopics: ['Lịch tiêm phòng vaccine', 'Xử lý đệm lót chuồng gà', 'Cách phân biệt Cầu trùng và Viêm ruột hoại tử']
      };
    }

    if (q.includes('hen') || q.includes('khò khè') || q.includes('crd') || q.includes('chảy nước mũi')) {
      return {
        reply: `🌬️ **Phác đồ trị Hen Khẹc / CRD (Mycoplasma) ở gà:**\n\n1. **Triệu chứng:** Nghe tiếng 'khẹc khẹc', khò khè nhiều về đêm khi chuồng yên tĩnh, gà vẩy mỏ, mắt sưng sủi bọt khí.\n\n2. **Phác đồ điều trị:**\n- **Kháng sinh tác động hô hấp:** **Tylosin + Doxycycline** HOẶC **Tilmicosin** uống 4 - 5 ngày liên tục.\n- **Hỗ trợ:** **Bromhexine** (long đờm, loãng dịch mũi) + **Vitamin C** tăng sức đề kháng.\n- **Môi trường:** Kiểm tra ngay bạt che chắn gió lùa, thông gió đỉnh chuồng để thoát khí amoniac (NH3) từ phân gà.\n\n⏳ **Thời gian ngưng thuốc:** 7 ngày.`,
        suggestedActions: [
          { label: 'Tạo phiếu theo dõi sức khỏe', actionType: 'navigate', payload: { tab: 'health' } }
        ]
      };
    }

    if (q.includes('úm') || q.includes('mùa đông') || q.includes('nhiệt độ')) {
      return {
        reply: `🔥 **Kỹ thuật Úm gà con đạt tỷ lệ sống > 98%:**\n\n1. **Nhiệt độ chuẩn:**\n- Tuần 1 (1 - 7 ngày): **32°C - 34°C** (Gà tản đều khắp quây úm là chuẩn nhiệt).\n- Tuần 2 (8 - 14 ngày): **29°C - 31°C**.\n- Tuần 3 (15 - 21 ngày): **26°C - 28°C**.\n\n2. **Quy trình ngày đầu tiên về trại:**\n- 2 giờ đầu: Chỉ cho uống nước ấm có pha **Đường Glucose + Vitamin C + Men vi sinh**.\n- Sau 2 giờ: Mới rải cám tấm nhỏ lên khay úm cho gà tập mổ.\n- Bắt buộc kiểm tra lò ấp đã tiêm vaccine **Marek** chưa.\n\n3. **Lịch vaccine tuần đầu:** Ngày 3-5 nhỏ Lasota lần 1, Ngày 7-10 nhỏ Gumboro lần 1.`,
        relatedTopics: ['Lịch vaccine gà Ri thả vườn', 'Bảng định mức thức ăn cám úm']
      };
    }

    if (q.includes('giá') || q.includes('thị trường')) {
      const p1 = INITIAL_MARKET_PRICES[0];
      const p2 = INITIAL_MARKET_PRICES[1];
      return {
        reply: `🐔 **Cập nhật Giá Gia Cầm Hôm Nay (Thị trường Việt Nam):**\n\n- **${p1.productName}:** ${p1.minPrice.toLocaleString('vi-VN')} - ${p1.maxPrice.toLocaleString('vi-VN')} đ/kg (Trung bình: **${p1.avgPrice.toLocaleString('vi-VN')} đ/kg**)\n- **${p2.productName}:** ${p2.minPrice.toLocaleString('vi-VN')} - ${p2.maxPrice.toLocaleString('vi-VN')} đ/kg (Trung bình: **${p2.avgPrice.toLocaleString('vi-VN')} đ/kg**)\n- **Gà Ta Thả Vườn Miền Nam:** 65.000 - 72.000 đ/kg\n- **Trứng gà ta:** 3.200 - 3.800 đ/quả\n\n📈 **Nhận định:** Giá gà thịt đang duy trì ổn định, có xu hướng tăng nhẹ vào các dịp cuối tuần và ngày rằm/mùng một.`,
        suggestedActions: [
          { label: 'Xem Bảng giá chi tiết', actionType: 'navigate', payload: { tab: 'market' } }
        ]
      };
    }

    // Default intelligent expert greeting & response
    return {
      reply: `Xin chào Bác! Tôi là **Trợ lý Chuyên gia Chăn nuôi FarmGo**. Tôi có thể hỗ trợ Bác mọi vấn đề về trại gà:\n\n1. 💉 **Lịch vaccine & kỹ thuật tiêm phòng** (Lasota, Gumboro, Cúm H5N1...)\n2. 🌾 **Tối ưu chi phí thức ăn & chỉ số FCR**\n3. 🩺 **Chẩn đoán bệnh gà qua triệu chứng** (Cầu trùng, Hen CRD, E.coli, Gumboro)\n4. 💰 **Dự báo ngày xuất chuồng & tối ưu lợi nhuận lứa nuôi**\n5. 🌡️ **Kỹ thuật úm gà con, làm đệm lót sinh học, chống nóng/chống rét**\n\nBác đang cần tư vấn vấn đề gì cho đàn gà của mình ạ?`,
      suggestedActions: [
        { label: 'Phân tích FCR lứa đang nuôi', actionType: 'ask', payload: { message: 'Phân tích FCR lứa gà hiện tại' } },
        { label: 'Dự báo thời điểm xuất bán', actionType: 'ask', payload: { message: 'Dự báo ngày xuất bán tối ưu' } },
        { label: 'Chẩn đoán bệnh gà', actionType: 'ask', payload: { message: 'Gà bị đi phân sáp lẫn máu' } }
      ],
      relatedTopics: ['Thư viện giống gà Việt Nam', 'Bảng giá gia cầm hôm nay', 'Lịch tiêm phòng chuẩn']
    };
  }

  static async predictOptimalHarvest(batchId: string) {
    const batch = await BatchService.getBatchById(batchId);
    if (!batch) {
      throw new Error('Batch not found');
    }

    const breed = VIETNAMESE_CHICKEN_BREEDS.find(b => b.id === batch.breedId) || VIETNAMESE_CHICKEN_BREEDS[0];
    const targetWeightKg = breed.standardMarketWeightKg || 1.9;
    const currentWeightKg = ((batch.currentAvgWeightGrams || 500) / 1000);
    const ageDays = batch.ageInDays || 45;

    // Remaining days to reach target weight
    const weightGap = Math.max(0, targetWeightKg - currentWeightKg);
    const avgDailyGainKg = 0.022; // 22g / day
    const daysToHarvest = Math.max(7, Math.ceil(weightGap / avgDailyGainKg));

    const recDateObj = new Date(Date.now() + daysToHarvest * 24 * 60 * 60 * 1000);
    const recommendedHarvestDate = recDateObj.toISOString().split('T')[0];

    // Estimate finances
    const marketPricePerKg = 82000; // VNĐ
    const estimatedTotalWeight = batch.currentQuantity * targetWeightKg;
    const estimatedRevenue = estimatedTotalWeight * marketPricePerKg;

    // Cost estimation
    const currentCost = batch.totalExpense || 25000000;
    const feedCostPerDay = batch.currentQuantity * 0.09 * 14500; // 90g * 14.500đ
    const estimatedRemainingCost = daysToHarvest * feedCostPerDay + 2000000; // feed + other
    const estimatedTotalCost = currentCost + estimatedRemainingCost;
    const estimatedNetProfit = estimatedRevenue - estimatedTotalCost;
    const estimatedROI = Number(((estimatedNetProfit / estimatedTotalCost) * 100).toFixed(1));

    const analysis = `Đàn gà đang ở ngày tuổi ${ageDays}. Tốc độ tăng trọng bình quân ${(avgDailyGainKg * 1000).toFixed(0)}g/ngày. Điểm xuất bán lý tưởng nhất là khi đạt trọng lượng ${targetWeightKg}kg (khoảng ${recommendedHarvestDate}). Nuôi kéo dài quá ngày này FCR sẽ tăng mạnh, làm giảm biên lợi nhuận.`;

    return {
      batchId,
      batchName: batch.name,
      currentAgeDays: ageDays,
      currentWeightKg,
      targetWeightKg,
      daysToHarvest,
      recommendedHarvestDate,
      marketPricePerKg,
      estimatedTotalWeightKg: estimatedTotalWeight,
      estimatedRevenue,
      estimatedTotalCost,
      estimatedNetProfit,
      estimatedROI,
      analysis
    };
  }

  static async diagnoseDisease(symptoms: string[]): Promise<{
    matches: {
      disease: string;
      confidence: number;
      matchingSymptoms: string[];
      treatmentSuggestion: string;
      preventiveGuide: string;
      withdrawalDays: number;
    }[];
    recommendedUrgentActions: string[];
  }> {
    const sList = symptoms.map(s => s.toLowerCase());
    const matches: any[] = [];

    COMMON_POULTRY_DISEASES.forEach(d => {
      const matchCount = d.symptoms.filter(sym => 
        sList.some(userSym => sym.toLowerCase().includes(userSym) || userSym.includes(sym.toLowerCase()))
      ).length;

      if (matchCount > 0) {
        const confidence = Math.min(95, Math.round((matchCount / d.symptoms.length) * 100) + 20);
        matches.push({
          disease: d.name,
          confidence,
          matchingSymptoms: d.symptoms.filter(sym => sList.some(userSym => sym.toLowerCase().includes(userSym))),
          treatmentSuggestion: d.treatmentSuggestion,
          preventiveGuide: d.preventiveGuide,
          withdrawalDays: d.withdrawalDays
        });
      }
    });

    matches.sort((a, b) => b.confidence - a.confidence);

    const recommendedUrgentActions = [
      'Cách ly ngay những con có biểu hiện ủ rũ, phân bất thường sang chuồng cách ly riêng.',
      'Phun thuốc sát trùng (Iodine hoặc Han-Iodine 10%) toàn bộ khu chuồng và lối đi.',
      'Pha nước uống bổ sung Vitamin C + Điện giải Gluco-KC để chống kiệt sức cho toàn đàn.',
      'Nếu tỷ lệ chết tăng đột biến (>1%), liên hệ ngay với cán bộ thú y địa phương.'
    ];

    return { matches, recommendedUrgentActions };
  }
}
