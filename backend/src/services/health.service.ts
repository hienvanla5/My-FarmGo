
import { HealthRecord, BatchEvent, COMMON_POULTRY_DISEASES } from 'farmgo-shared';
import { db } from '../db/storage.js';

export class HealthService {
  static async getRecords(batchId: string): Promise<HealthRecord[]> {
    const data = db.getData();
    return data.healthRecords
      .filter(r => r.batchId === batchId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static async createRecord(batchId: string, input: {
    date: string;
    deathsCount?: number;
    cullsCount?: number;
    suspectedDiseases?: string[];
    symptoms?: string[];
    medicationsUsed?: string[];
    medicationDosage?: string;
    withdrawalDays?: number;
    treatmentNotes?: string;
  }): Promise<HealthRecord> {
    const data = db.getData();
    const batch = data.batches.find(b => b.id === batchId);
    if (!batch) {
      throw new Error('Batch not found');
    }

    const deaths = input.deathsCount || 0;
    const culls = input.cullsCount || 0;
    const totalLost = deaths + culls;

    // Calculate withdrawal end date
    let withdrawalEndDate: string | undefined = undefined;
    if (input.withdrawalDays && input.withdrawalDays > 0) {
      const recordDate = new Date(input.date || new Date().toISOString().split('T')[0]);
      withdrawalEndDate = new Date(recordDate.getTime() + input.withdrawalDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    }

    const newRecord: HealthRecord = {
      id: `hr_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      batchId,
      date: input.date || new Date().toISOString().split('T')[0],
      deathsCount: deaths,
      cullsCount: culls,
      suspectedDiseases: input.suspectedDiseases || [],
      symptoms: input.symptoms || [],
      medicationsUsed: input.medicationsUsed || [],
      medicationDosage: input.medicationDosage,
      withdrawalDays: input.withdrawalDays,
      withdrawalEndDate,
      treatmentNotes: input.treatmentNotes,
      isResolved: false,
      createdAt: new Date().toISOString()
    };

    data.healthRecords.push(newRecord);

    // Update batch quantity if deaths/culls occurred
    if (totalLost > 0) {
      batch.currentQuantity = Math.max(0, batch.currentQuantity - totalLost);
      batch.updatedAt = new Date().toISOString();

      // Add batch event
      const event: BatchEvent = {
        id: `evt_mort_${Date.now()}`,
        batchId,
        eventType: 'mortality',
        date: input.date,
        quantity: totalLost,
        title: `Ghi nhận hao hụt: ${deaths} con chết, ${culls} con loại thải`,
        description: input.symptoms && input.symptoms.length > 0 
          ? `Triệu chứng: ${input.symptoms.join(', ')}. Ghi chú: ${input.treatmentNotes || 'Không có'}`
          : input.treatmentNotes,
        createdAt: new Date().toISOString()
      };
      data.batchEvents.push(event);
    }

    db.save();
    return newRecord;
  }

  static async resolveRecord(id: string): Promise<HealthRecord | null> {
    const data = db.getData();
    const index = data.healthRecords.findIndex(r => r.id === id);
    if (index === -1) return null;

    data.healthRecords[index].isResolved = true;
    db.save();
    return data.healthRecords[index];
  }

  static async getWithdrawalAlerts(farmId?: string): Promise<{
    batchId: string;
    batchName: string;
    medications: string[];
    withdrawalEndDate: string;
    remainingDays: number;
    isSafeToHarvest: boolean;
  }[]> {
    const data = db.getData();
    const activeBatches = data.batches.filter(b => b.status === 'active' && (!farmId || b.farmId === farmId));
    const activeBatchIds = new Set(activeBatches.map(b => b.id));
    const todayStr = new Date().toISOString().split('T')[0];

    const alerts: {
      batchId: string;
      batchName: string;
      medications: string[];
      withdrawalEndDate: string;
      remainingDays: number;
      isSafeToHarvest: boolean;
    }[] = [];

    activeBatches.forEach(batch => {
      const records = data.healthRecords
        .filter(r => r.batchId === batch.id && r.withdrawalEndDate && r.withdrawalEndDate >= todayStr);

      if (records.length > 0) {
        // Find latest withdrawal end date
        records.sort((a, b) => (b.withdrawalEndDate || '').localeCompare(a.withdrawalEndDate || ''));
        const latest = records[0];
        const endDateObj = new Date(latest.withdrawalEndDate!);
        const todayObj = new Date(todayStr);
        const remainingDays = Math.ceil((endDateObj.getTime() - todayObj.getTime()) / (1000 * 60 * 60 * 24));

        const allMeds = Array.from(new Set(records.flatMap(r => r.medicationsUsed || [])));

        alerts.push({
          batchId: batch.id,
          batchName: batch.name,
          medications: allMeds.length > 0 ? allMeds : ['Thuốc thú y kháng sinh'],
          withdrawalEndDate: latest.withdrawalEndDate!,
          remainingDays: Math.max(0, remainingDays),
          isSafeToHarvest: remainingDays <= 0
        });
      }
    });

    return alerts;
  }

  static getDiseaseGuide() {
    return COMMON_POULTRY_DISEASES;
  }
}
