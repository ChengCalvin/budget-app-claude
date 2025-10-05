export interface IncomeCategory {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
  incomeCount: number;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface IncomeCategoryCreateInput {
  name: string;
  color: string;
}

export interface IncomeCategoryUpdateInput {
  id: string;
  name?: string;
  color?: string;
}

export const DEFAULT_INCOME_CATEGORIES: Omit<IncomeCategory, 'id' | 'incomeCount' | 'totalAmount' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Salary',
    color: '#4CAF50',
    isDefault: true,
  },
  {
    name: 'Freelance',
    color: '#2196F3',
    isDefault: true,
  },
  {
    name: 'Business Revenue',
    color: '#FF9800',
    isDefault: true,
  },
  {
    name: 'Investment Returns',
    color: '#9C27B0',
    isDefault: true,
  },
  {
    name: 'Side Hustle',
    color: '#FF5722',
    isDefault: true,
  },
  {
    name: 'Other',
    color: '#607D8B',
    isDefault: true,
  },
];

export interface IncomeCategoryAnalytics {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  percentageOfTotal: number;
  monthlyAmount: number;
  ytdAmount: number;
  incomeCount: number;
}