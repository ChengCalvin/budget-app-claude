import { Income } from '../../income/models/incomeModel';
import { Expense } from '../../expense/models/expenseModel';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  amount: number;
  label: string;
  description?: string;
  category: string;
  date: string;
  type: TransactionType;
  createdAt: string;
  updatedAt: string;
  documents?: Array<{
    id: string;
    filename: string;
    url: string;
    size: number;
    mimeType: 'image/jpeg' | 'image/jpg' | 'image/png' | 'application/pdf';
    uploadedAt: string;
  }>;
}

export interface TransactionFilters {
  searchQuery?: string;
  type?: 'all' | 'income' | 'expense';
  categories?: string[];
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

export interface TransactionSummaryData {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
  averageIncome: number;
  averageExpense: number;
}

export interface TransactionStats {
  monthlyTotal: TransactionSummaryData;
  yearToDateTotal: TransactionSummaryData;
  currentPeriod: string;
}

export const createTransactionFromIncome = (income: Income): Transaction => ({
  ...income,
  type: 'income' as const,
  documents: income.supportingDocuments || [],
});

export const createTransactionFromExpense = (expense: Expense): Transaction => ({
  ...expense,
  type: 'expense' as const,
  documents: expense.receipts || [],
});