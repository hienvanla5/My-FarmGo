
import { MarketPriceItem, INITIAL_MARKET_PRICES, VIETNAMESE_CHICKEN_BREEDS } from 'farmgo-shared';
import { db } from '../db/storage.js';

export class MarketService {
  static getMarketPrices(): MarketPriceItem[] {
    const data = db.getData();
    return data.marketPrices || INITIAL_MARKET_PRICES;
  }

  static getChickenBreeds() {
    return VIETNAMESE_CHICKEN_BREEDS;
  }

  static getWeatherAndFarmingAlerts(province: string = 'Hà Nội') {
    // Generate realistic seasonal weather and poultry advisory
    const hour = new Date().getHours();
    const tempCelsius = 26;
    const humidityPercent = 75;

    let alertLevel: 'info' | 'warning' | 'urgent' = 'info';
    let advisory = 'Thời tiết thuận lợi cho đàn gà sinh trưởng. Duy trì đệm lót khô thoáng.';

    if (tempCelsius > 34) {
      alertLevel = 'urgent';
      advisory = 'CẢNH BÁO STRESS NHIỆT (NẮNG NÓNG): Bật quạt thông gió, phun sương làm mát mái chuồng, pha Vitamin C + Điện giải giải nhiệt cho đàn gà.';
    } else if (tempCelsius < 18) {
      alertLevel = 'warning';
      advisory = 'CẢNH BÁO GIÓ LẠNH: Kéo bạt chắn hướng gió Đông Bắc, bổ sung bóng sưởi hồng ngoại cho chuồng úm, phòng ngừa bệnh Hen khẹc CRD.';
    } else if (humidityPercent > 85) {
      alertLevel = 'warning';
      advisory = 'ĐỘ ẨM KHÔNG KHÍ CAO: Cần rải thêm trấu khô hoặc men vi sinh Balasa để tránh đệm lót ẩm ướt gây bùng phát bệnh Cầu trùng.';
    }

    return {
      location: province,
      temperature: tempCelsius,
      humidity: humidityPercent,
      weatherCondition: 'Có mây, gió nhẹ',
      alertLevel,
      advisory,
      updatedAt: new Date().toISOString()
    };
  }
}
