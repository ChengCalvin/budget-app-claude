export interface Expense {
  id: string;
  amount: number;
  label: string;
  description?: string;
  category: string;
  date: string;
  receipts?: Receipt[];
  createdAt: string;
  updatedAt: string;
}

export interface Receipt {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: 'image/jpeg' | 'image/jpg' | 'image/png' | 'application/pdf';
  uploadedAt: string;
}

export interface ExpenseCreateInput {
  amount: number;
  label: string;
  description?: string;
  category: string;
  date: string;
  receipts?: Receipt[];
}

export interface ExpenseUpdateInput {
  id: string;
  amount?: number;
  label?: string;
  description?: string;
  category?: string;
  date?: string;
  receipts?: Receipt[];
}

export interface ExpenseFilters {
  searchQuery?: string;
  categories?: string[];
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

export interface ExpensePaginationResult {
  expenses: Expense[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
}

export type ExpenseSortField = 'date' | 'amount' | 'category' | 'label';
export type ExpenseSortOrder = 'asc' | 'desc';

export interface ExpenseSortOptions {
  field: ExpenseSortField;
  order: ExpenseSortOrder;
}