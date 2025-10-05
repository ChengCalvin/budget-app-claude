import { useState, useEffect, useCallback } from 'react';
import { CategoryAnalytics, CategorySummary } from '../models/categoryModel';
import { ExpenseFilters } from '../models/expenseModel';
import { categoryService } from '../services/categoryService';
import { expenseService } from '../services/expenseService';

export type TimePeriod = 'day' | 'week' | 'month' | 'year' | 'custom';
export type QuickFilter = '7days' | '30days' | '90days' | 'all';

interface ExpenseSummary {
  totalAmount: number;
  expenseCount: number;
  averageExpense: number;
  periodLabel: string;
}

interface TimeBasedSummary {
  current: ExpenseSummary;
  previous: ExpenseSummary;
  percentageChange: number;
}

interface UseExpenseAnalyticsProps {
  initialPeriod?: TimePeriod;
  initialDateFrom?: string;
  initialDateTo?: string;
}

export const useExpenseAnalytics = ({
  initialPeriod = 'month',
  initialDateFrom,
  initialDateTo
}: UseExpenseAnalyticsProps = {}) => {
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(initialPeriod);
  const [dateFrom, setDateFrom] = useState<string>(initialDateFrom || getCurrentMonthStart());
  const [dateTo, setDateTo] = useState<string>(initialDateTo || getCurrentMonthEnd());
  const [categoryAnalytics, setCategoryAnalytics] = useState<CategoryAnalytics[]>([]);
  const [categorySummary, setCategorySummary] = useState<CategorySummary | null>(null);
  const [timeBasedSummary, setTimeBasedSummary] = useState<TimeBasedSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper functions for date calculations
  function getCurrentMonthStart(): string {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  }

  function getCurrentMonthEnd(): string {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  }

  function getPreviousPeriodDates(from: string, to: string): { from: string; to: string } {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const periodLength = toDate.getTime() - fromDate.getTime();

    const previousTo = new Date(fromDate.getTime() - 1);
    const previousFrom = new Date(previousTo.getTime() - periodLength);

    return {
      from: previousFrom.toISOString().split('T')[0],
      to: previousTo.toISOString().split('T')[0]
    };
  }

  function formatPeriodLabel(period: TimePeriod, from: string, to: string): string {
    const fromDate = new Date(from);
    const toDate = new Date(to);

    switch (period) {
      case 'day':
        return fromDate.toLocaleDateString();
      case 'week':
        return `Week of ${fromDate.toLocaleDateString()}`;
      case 'month':
        return fromDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      case 'year':
        return fromDate.getFullYear().toString();
      case 'custom':
        return `${fromDate.toLocaleDateString()} - ${toDate.toLocaleDateString()}`;
      default:
        return 'Custom Period';
    }
  }

  // Navigate between periods
  const navigatePeriod = useCallback((direction: 'previous' | 'next') => {
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);
    let newFrom: Date;
    let newTo: Date;

    switch (timePeriod) {
      case 'day':
        const dayOffset = direction === 'next' ? 1 : -1;
        newFrom = new Date(fromDate.getTime() + dayOffset * 24 * 60 * 60 * 1000);
        newTo = newFrom;
        break;
      case 'week':
        const weekOffset = direction === 'next' ? 7 : -7;
        newFrom = new Date(fromDate.getTime() + weekOffset * 24 * 60 * 60 * 1000);
        newTo = new Date(toDate.getTime() + weekOffset * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        if (direction === 'next') {
          newFrom = new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 1);
          newTo = new Date(fromDate.getFullYear(), fromDate.getMonth() + 2, 0);
        } else {
          newFrom = new Date(fromDate.getFullYear(), fromDate.getMonth() - 1, 1);
          newTo = new Date(fromDate.getFullYear(), fromDate.getMonth(), 0);
        }
        break;
      case 'year':
        if (direction === 'next') {
          newFrom = new Date(fromDate.getFullYear() + 1, 0, 1);
          newTo = new Date(fromDate.getFullYear() + 1, 11, 31);
        } else {
          newFrom = new Date(fromDate.getFullYear() - 1, 0, 1);
          newTo = new Date(fromDate.getFullYear() - 1, 11, 31);
        }
        break;
      default:
        return; // Don't navigate for custom periods
    }

    setDateFrom(newFrom.toISOString().split('T')[0]);
    setDateTo(newTo.toISOString().split('T')[0]);
  }, [timePeriod, dateFrom, dateTo]);

  // Apply quick filters
  const applyQuickFilter = useCallback((filter: QuickFilter) => {
    const now = new Date();
    let from: Date;
    let to: Date = now;

    switch (filter) {
      case '7days':
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        from = new Date('2008-01-01');
        break;
    }

    setTimePeriod('custom');
    setDateFrom(from.toISOString().split('T')[0]);
    setDateTo(to.toISOString().split('T')[0]);
  }, []);

  // Set custom date range
  const setCustomDateRange = useCallback((from: string, to: string) => {
    setTimePeriod('custom');
    setDateFrom(from);
    setDateTo(to);
  }, []);

  // Load analytics data
  const loadAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load category analytics and summary
      const [analytics, summary] = await Promise.all([
        categoryService.getCategoryAnalytics(dateFrom, dateTo),
        categoryService.getCategorySummary(
          timePeriod === 'month' ? new Date(dateFrom).getMonth().toString() : undefined,
          timePeriod === 'year' ? new Date(dateFrom).getFullYear().toString() : undefined
        )
      ]);

      setCategoryAnalytics(analytics);
      setCategorySummary(summary);

      // Calculate time-based summary
      const filters: ExpenseFilters = { dateFrom, dateTo };
      const currentExpenses = await expenseService.getExpenses(filters, undefined, 1, 1000);

      const currentTotal = currentExpenses.expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const currentCount = currentExpenses.expenses.length;

      // Get previous period data for comparison
      const previousPeriod = getPreviousPeriodDates(dateFrom, dateTo);
      const previousFilters: ExpenseFilters = {
        dateFrom: previousPeriod.from,
        dateTo: previousPeriod.to
      };
      const previousExpenses = await expenseService.getExpenses(previousFilters, undefined, 1, 1000);

      const previousTotal = previousExpenses.expenses.reduce((sum, expense) => sum + expense.amount, 0);
      const previousCount = previousExpenses.expenses.length;

      const percentageChange = previousTotal > 0
        ? ((currentTotal - previousTotal) / previousTotal) * 100
        : 0;

      setTimeBasedSummary({
        current: {
          totalAmount: currentTotal,
          expenseCount: currentCount,
          averageExpense: currentCount > 0 ? currentTotal / currentCount : 0,
          periodLabel: formatPeriodLabel(timePeriod, dateFrom, dateTo)
        },
        previous: {
          totalAmount: previousTotal,
          expenseCount: previousCount,
          averageExpense: previousCount > 0 ? previousTotal / previousCount : 0,
          periodLabel: formatPeriodLabel(timePeriod, previousPeriod.from, previousPeriod.to)
        },
        percentageChange
      });

    } catch (err: any) {
      console.error('Error loading analytics:', err);
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  }, [dateFrom, dateTo, timePeriod]);

  // Load analytics when date range changes
  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const refresh = useCallback(async () => {
    await loadAnalytics();
  }, [loadAnalytics]);

  return {
    // Data
    categoryAnalytics,
    categorySummary,
    timeBasedSummary,

    // State
    isLoading,
    error,
    timePeriod,
    dateFrom,
    dateTo,

    // Actions
    setTimePeriod,
    setDateFrom,
    setDateTo,
    navigatePeriod,
    applyQuickFilter,
    setCustomDateRange,
    refresh,

    // Computed values
    periodLabel: formatPeriodLabel(timePeriod, dateFrom, dateTo),
    canNavigatePrevious: true,
    canNavigateNext: timePeriod !== 'custom' || new Date(dateTo) < new Date(),
    isEmpty: categoryAnalytics.length === 0 && !isLoading,
  };
};