export interface Category {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryCreateInput {
  name: string;
  color: string;
}

export interface CategoryUpdateInput {
  id: string;
  name?: string;
  color?: string;
}

export const DEFAULT_CATEGORIES: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Food', color: '#FF6B6B', isDefault: true },
  { name: 'Transportation', color: '#4ECDC4', isDefault: true },
  { name: 'Entertainment', color: '#45B7D1', isDefault: true },
  { name: 'Utilities', color: '#96CEB4', isDefault: true },
  { name: 'Other', color: '#FECA57', isDefault: true },
];

export interface CategoryAnalytics {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  totalAmount: number;
  expenseCount: number;
  percentageOfTotal: number;
}

export interface CategorySummary {
  monthlyTotal: number;
  yearToDateTotal: number;
  categoryBreakdown: CategoryAnalytics[];
}