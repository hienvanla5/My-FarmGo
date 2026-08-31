
import { 
  BatchVaccineSchedule, 
  VaccineDefinition, 
  STANDARD_VACCINE_LIBRARY,
  Transaction 
} from 'farmgo-shared';
import { db } from '../db/storage.js';

export class VaccineService {
  static getStandardLibrary(): VaccineDefinition[] {
    return STANDARD_VACCINE_LIBRARY;
  }

  static async getBatchSchedules(batchId: string): Promise<BatchVaccineSchedule[]> {
    const data = db.getData();
    const batch = data.batches.find(b => b.id === batchId);
    if (!batch) return [];

    const schedules = data.vaccineSchedules.filter(s => s.batchId === batchId);

    // Auto calculate status if date has passed and still pending
    const today = new Date().toISOString().split('T')[0];
    return schedules.map(s => {
      let status = s.status;
      if (status === 'pending') {
        if (s.scheduledDate === today) {
          status = 'due';
        } else if (s.scheduledDate < today) {
          status = 'overdue';
        }
      }
      return { ...s, status };
    }).sort((a, b) => a.scheduledAgeDays - b.scheduledAgeDays);
  }

  static async updateSchedule(
    id: string, 
    update: Partial<BatchVaccineSchedule> & { autoRecordExpense?: boolean }
  ): Promise<BatchVaccineSchedule | null> {
    const data = db.getData();
    const index = data.vaccineSchedules.findIndex(s => s.id === id);
    if (index === -1) return null;

    const current = data.vaccineSchedules[index];
    const updated: BatchVaccineSchedule = {
      ...current,
      ...update,
      updatedAt: new Date().toISOString()
    };

    // If marked as completed and cost > 0, auto record expense transaction
    if (update.status === 'completed' && update.cost && update.cost > 0 && update.autoRecordExpense !== false) {
      const batch = data.batches.find(b => b.id === current.batchId);
      if (batch) {
        const tx: Transaction = {
          id: `tx_vac_${Date.now()}`,
          batchId: batch.id,
          farmId: batch.farmId,
          type: 'expense',
          category: 'vaccine',
          categoryName: 'Vaccine phòng bệnh',
          amount: update.cost,
          date: update.actualDate || new Date().toISOString().split('T')[0],
          paymentMethod: 'cash',
          payerReceiverName: update.supplier || 'Hiệu thuốc Thú Y',
          notes: `Tiêm ${current.vaccineName} (${current.diseaseName})`,
          createdAt: new Date().toISOString()
        };
        data.transactions.push(tx);
      }
    }

    data.vaccineSchedules[index] = updated;
    db.save();
    return updated;
  }

  static async addCustomSchedule(batchId: string, input: {
    vaccineName: string;
    diseaseName: string;
    scheduledAgeDays: number;
    scheduledDate: string;
    applicationMethod: string;
    dose?: string;
    notes?: string;
  }): Promise<BatchVaccineSchedule> {
    const data = db.getData();
    const newSchedule: BatchVaccineSchedule = {
      id: `sch_${batchId}_${Date.now()}`,
      batchId,
      vaccineId: `vac_custom_${Date.now()}`,
      vaccineName: input.vaccineName,
      diseaseName: input.diseaseName,
      scheduledAgeDays: input.scheduledAgeDays,
      scheduledDate: input.scheduledDate,
      status: 'pending',
      applicationMethod: input.applicationMethod,
      dose: input.dose || '1 liều/con',
      notes: input.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.vaccineSchedules.push(newSchedule);
    db.save();
    return newSchedule;
  }

  static async deleteSchedule(id: string): Promise<boolean> {
    const data = db.getData();
    const initialLen = data.vaccineSchedules.length;
    data.vaccineSchedules = data.vaccineSchedules.filter(s => s.id !== id);
    db.save();
    return data.vaccineSchedules.length < initialLen;
  }

  static async getDueAlerts(farmId?: string): Promise<{
    dueToday: (BatchVaccineSchedule & { batchName: string })[];
    dueSoon: (BatchVaccineSchedule & { batchName: string })[];
    overdue: (BatchVaccineSchedule & { batchName: string })[];
  }> {
    const data = db.getData();
    const activeBatches = data.batches.filter(b => b.status === 'active' && (!farmId || b.farmId === farmId));
    const activeBatchIds = new Set(activeBatches.map(b => b.id));
    const batchMap = new Map(activeBatches.map(b => [b.id, b.name]));

    const todayStr = new Date().toISOString().split('T')[0];
    const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const dueToday: (BatchVaccineSchedule & { batchName: string })[] = [];
    const dueSoon: (BatchVaccineSchedule & { batchName: string })[] = [];
    const overdue: (BatchVaccineSchedule & { batchName: string })[] = [];

    data.vaccineSchedules
      .filter(s => activeBatchIds.has(s.batchId) && s.status !== 'completed' && s.status !== 'skipped')
      .forEach(s => {
        const item = { ...s, batchName: batchMap.get(s.batchId) || 'Lứa gà' };
        if (s.scheduledDate === todayStr) {
          dueToday.push({ ...item, status: 'due' });
        } else if (s.scheduledDate > todayStr && s.scheduledDate <= threeDaysLater) {
          dueSoon.push(item);
        } else if (s.scheduledDate < todayStr) {
          overdue.push({ ...item, status: 'overdue' });
        }
      });

    return { dueToday, dueSoon, overdue };
  }
}
