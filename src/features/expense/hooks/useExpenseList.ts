import { useState, useEffect, useCallback } from 'react';
import { Expense, ExpenseFilters, ExpenseSortOptions, ExpensePaginationResult } from '../models/expenseModel';
import { expenseService } from '../services/expenseService';
import { expenseStorageService } from '../services/expenseStorageService';

interface UseExpenseListProps {
  initialFilters?: ExpenseFilters;
  initialSort?: ExpenseSortOptions;
  pageSize?: number;
}

export const useExpenseList = ({
  initialFilters = {},
  initialSort = { field: 'date', order: 'desc' },
  pageSize = 10
}: UseExpenseListProps = {}) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filters, setFilters] = useState<ExpenseFilters>(initialFilters);
  const [sort, setSort] = useState<ExpenseSortOptions>(initialSort);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');

  // Load expenses
  const loadExpenses = useCallback(async (page: number = 1, append: boolean = false) => {
    if (page === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const result: ExpensePaginationResult = await expenseService.getExpenses(
        filters,
        sort,
        page,
        pageSize
      );

      if (append && page > 1) {
        setExpenses(prev => [...prev, ...result.expenses]);
      } else {
        setExpenses(result.expenses);
      }

      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
      setCurrentPage(page);

      // Cache results
      if (page === 1) {
        await expenseStorageService.cacheExpenses(result.expenses);
        await expenseStorageService.saveCachedFilters(filters);
      }

    } catch (err: any) {
      console.error('Error loading expenses:', err);
      setError(err.message || 'Failed to load expenses');

      // Try to load from cache if first page fails
      if (page === 1) {
        try {
          const cachedExpenses = await expenseStorageService.getCachedExpenses();
          if (cachedExpenses.length > 0) {
            setExpenses(cachedExpenses);
            setError('Showing cached data - unable to sync with server');
          }
        } catch (cacheError) {
          console.error('Error loading cached expenses:', cacheError);
        }
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [filters, sort, pageSize]);

  // Load more expenses (pagination)
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading) return;
    await loadExpenses(currentPage + 1, true);
  }, [hasMore, isLoadingMore, isLoading, currentPage, loadExpenses]);

  // Refresh expenses
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    await loadExpenses(1, false);
    setIsRefreshing(false);
  }, [loadExpenses]);

  // Search expenses
  const search = useCallback(async (query: string) => {
    setSearchQuery(query);
    const newFilters = { ...filters, searchQuery: query };
    setFilters(newFilters);
    setCurrentPage(1);
  }, [filters]);

  // Apply filters
  const applyFilters = useCallback(async (newFilters: ExpenseFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  // Apply sorting
  const applySorting = useCallback(async (newSort: ExpenseSortOptions) => {
    setSort(newSort);
    setCurrentPage(1);
  }, []);

  // Clear filters
  const clearFilters = useCallback(async () => {
    const clearedFilters: ExpenseFilters = {};
    setFilters(clearedFilters);
    setSearchQuery('');
    setCurrentPage(1);
  }, []);

  // Add expense to list (optimistic update)
  const addExpenseToList = useCallback((expense: Expense) => {
    setExpenses(prev => {
      // Insert at the beginning for newest first sort
      if (sort.field === 'date' && sort.order === 'desc') {
        return [expense, ...prev];
      }
      // For other sorts, just add and let next refresh handle proper ordering
      return [expense, ...prev];
    });
    setTotalCount(prev => prev + 1);
  }, [sort]);

  // Update expense in list
  const updateExpenseInList = useCallback((updatedExpense: Expense) => {
    setExpenses(prev => prev.map(expense =>
      expense.id === updatedExpense.id ? updatedExpense : expense
    ));
  }, []);

  // Remove expense from list
  const removeExpenseFromList = useCallback((expenseId: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
    setTotalCount(prev => Math.max(0, prev - 1));
  }, []);

  // Initial load and reload when filters/sort change
  useEffect(() => {
    loadExpenses(1, false);
  }, [filters, sort]);

  // Load cached filters on mount
  useEffect(() => {
    const loadCachedFilters = async () => {
      try {
        const cachedFilters = await expenseStorageService.getCachedFilters();
        if (cachedFilters) {
          setFilters(cachedFilters);
          setSearchQuery(cachedFilters.searchQuery || '');
        }
      } catch (error) {
        console.error('Error loading cached filters:', error);
      }
    };

    loadCachedFilters();
  }, []);

  // Computed values
  const isEmpty = expenses.length === 0 && !isLoading;
  const isFirstLoad = isLoading && currentPage === 1;
  const canLoadMore = hasMore && !isLoadingMore && !isLoading;

  return {
    // Data
    expenses,
    totalCount,
    currentPage,

    // State
    isLoading,
    isLoadingMore,
    isRefreshing,
    error,
    isEmpty,
    isFirstLoad,
    canLoadMore,
    hasMore,

    // Filters and search
    filters,
    sort,
    searchQuery,

    // Actions
    loadExpenses: () => loadExpenses(1, false),
    loadMore,
    refresh,
    search,
    applyFilters,
    applySorting,
    clearFilters,

    // List management
    addExpenseToList,
    updateExpenseInList,
    removeExpenseFromList,

    // Pagination info
    hasNextPage: hasMore,
    hasPreviousPage: currentPage > 1,
  };
};