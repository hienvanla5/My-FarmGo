
import { 
  Transaction, 
  ExpenseCategory, 
  IncomeCategory, 
  EXPENSE_CATEGORIES_INFO, 
  INCOME_CATEGORIES_INFO 
} from 'farmgo-shared';
import { db } from '../db/storage.js';

export class FinanceService {
  static async getTransactions(filters?: {
    farmId?: string;
    batchId?: string;
    type?: 'income' | 'expense';
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Transaction[]> {
    const data = db.getData();
    return data.transactions
      .filter(t => {
        if (filters?.farmId && t.farmId !== filters.farmId) return false;
        if (filters?.batchId && t.batchId !== filters.batchId) return false;
        if (filters?.type && t.type !== filters.type) return false;
        if (filters?.category && t.category !== filters.category) return false;
        if (filters?.startDate && t.date < filters.startDate) return false;
        if (filters?.endDate && t.date > filters.endDate) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  static async createTransaction(input: {
    farmId: string;
    batchId?: string;
    type: 'income' | 'expense';
    category: ExpenseCategory | IncomeCategory;
    amount: number;
    date: string;
    paymentMethod: 'cash' | 'bank_transfer' | 'e_wallet' | 'debt';
    payerReceiverName?: string;
    referenceCode?: string;
    notes?: string;
    receiptPhotoUrl?: string;
  }): Promise<Transaction> {
    const data = db.getData();
    
    // Resolve category name in Vietnamese
    let categoryName: string = input.category;
    if (input.type === 'expense' && EXPENSE_CATEGORIES_INFO[input.category as ExpenseCategory]) {
      categoryName = EXPENSE_CATEGORIES_INFO[input.category as ExpenseCategory].label;
    } else if (input.type === 'income' && INCOME_CATEGORIES_INFO[input.category as IncomeCategory]) {
      categoryName = INCOME_CATEGORIES_INFO[input.category as IncomeCategory].label;
    }

    const newTx: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      farmId: input.farmId,
      batchId: input.batchId,
      type: input.type,
      category: input.category as any,
      categoryName,
      amount: Number(input.amount),
      date: input.date || new Date().toISOString().split('T')[0],
      paymentMethod: input.paymentMethod,
      payerReceiverName: input.payerReceiverName,
      referenceCode: input.referenceCode,
      notes: input.notes,
      receiptPhotoUrl: input.receiptPhotoUrl,
      createdAt: new Date().toISOString()
    };

    data.transactions.push(newTx);
    db.save();
    return newTx;
  }

  static async updateTransaction(id: string, update: Partial<Transaction>): Promise<Transaction | null> {
    const data = db.getData();
    const index = data.transactions.findIndex(t => t.id === id);
    if (index === -1) return null;

    data.transactions[index] = {
      ...data.transactions[index],
      ...update
    };
    db.save();
    return data.transactions[index];
  }

  static async deleteTransaction(id: string): Promise<boolean> {
    const data = db.getData();
    const initialLen = data.transactions.length;
    data.transactions = data.transactions.filter(t => t.id !== id);
    db.save();
    return data.transactions.length < initialLen;
  }

  static async getFinancialSummary(filters?: {
    farmId?: string;
    batchId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const transactions = await this.getTransactions(filters);
    
    let totalIncome = 0;
    let totalExpense = 0;

    const expenseByCategory: Record<string, { label: string; amount: number; percentage: number; color: string; count: number }> = {};
    const incomeByCategory: Record<string, { label: string; amount: number; percentage: number; color: string; count: number }> = {};

    transactions.forEach(t => {
      if (t.type === 'expense') {
        totalExpense += t.amount;
        const info = EXPENSE_CATEGORIES_INFO[t.category as ExpenseCategory] || { label: t.categoryName, color: '#94A3B8' };
        if (!expenseByCategory[t.category]) {
          expenseByCategory[t.category] = { label: info.label, amount: 0, percentage: 0, color: info.color, count: 0 };
        }
        expenseByCategory[t.category].amount += t.amount;
        expenseByCategory[t.category].count += 1;
      } else {
        totalIncome += t.amount;
        const info = INCOME_CATEGORIES_INFO[t.category as IncomeCategory] || { label: t.categoryName, color: '#10B981' };
        if (!incomeByCategory[t.category]) {
          incomeByCategory[t.category] = { label: info.label, amount: 0, percentage: 0, color: info.color, count: 0 };
        }
        incomeByCategory[t.category].amount += t.amount;
        incomeByCategory[t.category].count += 1;
      }
    });

    // Compute percentages
    Object.values(expenseByCategory).forEach(item => {
      item.percentage = totalExpense > 0 ? Number(((item.amount / totalExpense) * 100).toFixed(1)) : 0;
    });

    Object.values(incomeByCategory).forEach(item => {
      item.percentage = totalIncome > 0 ? Number(((item.amount / totalIncome) * 100).toFixed(1)) : 0;
    });

    const netProfit = totalIncome - totalExpense;
    const profitMarginPercent = totalIncome > 0 ? Number(((netProfit / totalIncome) * 100).toFixed(1)) : 0;
    const roiPercent = totalExpense > 0 ? Number(((netProfit / totalExpense) * 100).toFixed(1)) : 0;

    // Monthly breakdown
    const monthlyMap: Record<string, { month: string; income: number; expense: number; profit: number }> = {};
    transactions.forEach(t => {
      const monthKey = t.date.substring(0, 7); // YYYY-MM
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, income: 0, expense: 0, profit: 0 };
      }
      if (t.type === 'income') {
        monthlyMap[monthKey].income += t.amount;
      } else {
        monthlyMap[monthKey].expense += t.amount;
      }
      monthlyMap[monthKey].profit = monthlyMap[monthKey].income - monthlyMap[monthKey].expense;
    });

    const monthlyTrends = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

    return {
      totalIncome,
      totalExpense,
      netProfit,
      profitMarginPercent,
      roiPercent,
      expenseByCategory: Object.values(expenseByCategory).sort((a, b) => b.amount - a.amount),
      incomeByCategory: Object.values(incomeByCategory).sort((a, b) => b.amount - a.amount),
      monthlyTrends,
      transactionCount: transactions.length
    };
  }
}
