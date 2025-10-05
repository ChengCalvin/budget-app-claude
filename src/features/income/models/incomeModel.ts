export interface Income {
  id: string;
  amount: number;
  label: string;
  description?: string;
  category: string;
  date: string;
  supportingDocuments?: SupportingDocument[];
  createdAt: string;
  updatedAt: string;
}

export interface SupportingDocument {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: 'image/jpeg' | 'image/jpg' | 'image/png' | 'application/pdf';
  uploadedAt: string;
}

export interface IncomeCreateInput {
  amount: number;
  label: string;
  description?: string;
  category: string;
  date: string;
  supportingDocuments?: SupportingDocument[];
}

export interface IncomeUpdateInput {
  id: string;
  amount?: number;
  label?: string;
  description?: string;
  category?: string;
  date?: string;
  supportingDocuments?: SupportingDocument[];
}

export interface IncomeFilters {
  searchQuery?: string;
  categories?: string[];
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
}

export interface IncomePaginationResult {
  incomes: Income[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
}

export type IncomeSortField = 'date' | 'amount' | 'category' | 'label';
export type IncomeSortOrder = 'asc' | 'desc';

export interface IncomeSortOptions {
  field: IncomeSortField;
  order: IncomeSortOrder;
}