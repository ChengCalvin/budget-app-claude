import { useState, useEffect, useMemo, useCallback } from 'react';
import { useIncomeList } from '../../income/hooks/useIncomeList';
import { useExpenseList } from '../../expense/hooks/useExpenseList';
import {
  Transaction,
  TransactionFilters,
  TransactionSummaryData,
  createTransactionFromIncome,
  createTransactionFromExpense
} from '../models/transactionModel';

interface UseTransactionListProps {
  pageSize?: number;
  initialFilters?: TransactionFilters;
}

export const useTransactionList = ({
  pageSize = 20,
  initialFilters = {}
}: UseTransactionListProps = {}) => {
  const [filters, setFilters] = useState<TransactionFilters>(initialFilters);
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');

  // Get data from both income and expense hooks
  const incomeHook = useIncomeList({ pageSize });
  const expenseHook = useExpenseList({ pageSize });

  // Combine and transform data
  const allTransactions = useMemo(() => {
    const incomeTransactions = incomeHook.incomes.map(createTransactionFromIncome);
    const expenseTransactions = expenseHook.expenses.map(createTransactionFromExpense);

    const combined = [...incomeTransactions, ...expenseTransactions];

    // Sort by date (newest first)
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [incomeHook.incomes, expenseHook.expenses]);

  // Apply client-side filtering
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter(transaction => {
      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchableText = `${transaction.label} ${transaction.description || ''}`.toLowerCase();
        if (!searchableText.includes(query)) {
          return false;
        }
      }

      // Type filter
      if (filters.type && filters.type !== 'all' && transaction.type !== filters.type) {
        return false;
      }

      // Category filter
      if (filters.categories && filters.categories.length > 0) {
        if (!filters.categories.includes(transaction.category)) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateFrom && new Date(transaction.date) < new Date(filters.dateFrom)) {
        return false;
      }
      if (filters.dateTo && new Date(transaction.date) > new Date(filters.dateTo)) {
        return false;
      }

      // Amount range filter
      if (filters.amountMin !== undefined && transaction.amount < filters.amountMin) {
        return false;
      }
      if (filters.amountMax !== undefined && transaction.amount > filters.amountMax) {
        return false;
      }

      return true;
    });
  }, [allTransactions, filters]);

  // Calculate summary statistics
  const summaryData = useMemo((): TransactionSummaryData => {
    const incomeTransactions = filteredTransactions.filter(t => t.type === 'income');
    const expenseTransactions = filteredTransactions.filter(t => t.type === 'expense');

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      transactionCount: filteredTransactions.length,
      incomeCount: incomeTransactions.length,
      expenseCount: expenseTransactions.length,
      averageIncome: incomeTransactions.length > 0 ? totalIncome / incomeTransactions.length : 0,
      averageExpense: expenseTransactions.length > 0 ? totalExpenses / expenseTransactions.length : 0,
    };
  }, [filteredTransactions]);

  // Calculate period-specific summaries
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyData = useMemo((): TransactionSummaryData => {
    const monthlyTransactions = filteredTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });

    const incomeTransactions = monthlyTransactions.filter(t => t.type === 'income');
    const expenseTransactions = monthlyTransactions.filter(t => t.type === 'expense');

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      transactionCount: monthlyTransactions.length,
      incomeCount: incomeTransactions.length,
      expenseCount: expenseTransactions.length,
      averageIncome: incomeTransactions.length > 0 ? totalIncome / incomeTransactions.length : 0,
      averageExpense: expenseTransactions.length > 0 ? totalExpenses / expenseTransactions.length : 0,
    };
  }, [filteredTransactions, currentMonth, currentYear]);

  const yearToDateData = useMemo((): TransactionSummaryData => {
    const ytdTransactions = filteredTransactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      return transactionDate.getFullYear() === currentYear;
    });

    const incomeTransactions = ytdTransactions.filter(t => t.type === 'income');
    const expenseTransactions = ytdTransactions.filter(t => t.type === 'expense');

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      transactionCount: ytdTransactions.length,
      incomeCount: incomeTransactions.length,
      expenseCount: expenseTransactions.length,
      averageIncome: incomeTransactions.length > 0 ? totalIncome / incomeTransactions.length : 0,
      averageExpense: expenseTransactions.length > 0 ? totalExpenses / expenseTransactions.length : 0,
    };
  }, [filteredTransactions, currentYear]);

  // Actions
  const loadMore = useCallback(() => {
    incomeHook.loadMore();
    expenseHook.loadMore();
  }, [incomeHook.loadMore, expenseHook.loadMore]);

  const refresh = useCallback(async () => {
    await Promise.all([
      incomeHook.refresh(),
      expenseHook.refresh()
    ]);
  }, [incomeHook.refresh, expenseHook.refresh]);

  const search = useCallback((query: string) => {
    setSearchQuery(query);
    setFilters(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const applyFilters = useCallback((newFilters: TransactionFilters) => {
    setFilters(newFilters);
    setSearchQuery(newFilters.searchQuery || '');
  }, []);

  const clearFilters = useCallback(() => {
    const clearedFilters: TransactionFilters = {};
    setFilters(clearedFilters);
    setSearchQuery('');
  }, []);

  // Combined loading and error states
  const isLoading = incomeHook.isLoading || expenseHook.isLoading;
  const isLoadingMore = incomeHook.isLoadingMore || expenseHook.isLoadingMore;
  const isRefreshing = incomeHook.isRefreshing || expenseHook.isRefreshing;
  const error = incomeHook.error || expenseHook.error;
  const hasMore = incomeHook.hasMore || expenseHook.hasMore;

  return {
    // Data
    transactions: filteredTransactions,
    allTransactions,
    summaryData,
    monthlyData,
    yearToDateData,

    // State
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    hasMore,
    isEmpty: filteredTransactions.length === 0 && !isLoading,

    // Filters
    filters,
    searchQuery,

    // Actions
    loadMore,
    refresh,
    search,
    applyFilters,
    clearFilters,

    // Underlying hook data for debugging
    incomeData: {
      count: incomeHook.incomes.length,
      totalCount: incomeHook.totalCount,
      isLoading: incomeHook.isLoading,
      error: incomeHook.error,
    },
    expenseData: {
      count: expenseHook.expenses.length,
      totalCount: expenseHook.totalCount,
      isLoading: expenseHook.isLoading,
      error: expenseHook.error,
    },
  };
};