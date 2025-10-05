import { useState, useEffect, useCallback } from 'react';
import { Income, IncomeFilters, IncomeSortOptions, IncomePaginationResult } from '../models/incomeModel';
import { incomeService } from '../services/incomeService';

interface UseIncomeListProps {
  initialFilters?: IncomeFilters;
  initialSort?: IncomeSortOptions;
  pageSize?: number;
}

export const useIncomeList = ({
  initialFilters = {},
  initialSort = { field: 'date', order: 'desc' },
  pageSize = 10
}: UseIncomeListProps = {}) => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [filters, setFilters] = useState<IncomeFilters>(initialFilters);
  const [sort, setSort] = useState<IncomeSortOptions>(initialSort);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(filters.searchQuery || '');

  // Load incomes
  const loadIncomes = useCallback(async (page: number = 1, append: boolean = false) => {
    if (page === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setError(null);

    try {
      const result: IncomePaginationResult = await incomeService.getIncomes(
        filters,
        sort,
        page,
        pageSize
      );

      if (append && page > 1) {
        setIncomes(prev => [...prev, ...result.incomes]);
      } else {
        setIncomes(result.incomes);
      }

      setTotalCount(result.totalCount);
      setHasMore(result.hasMore);
      setCurrentPage(page);

    } catch (err: any) {
      console.error('Error loading incomes:', err);
      setError(err.message || 'Failed to load incomes');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [filters, sort, pageSize]);

  // Load more incomes (pagination)
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading) return;
    await loadIncomes(currentPage + 1, true);
  }, [hasMore, isLoadingMore, isLoading, currentPage, loadIncomes]);

  // Refresh incomes
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    setCurrentPage(1);
    await loadIncomes(1, false);
    setIsRefreshing(false);
  }, [loadIncomes]);

  // Search incomes
  const search = useCallback(async (query: string) => {
    setSearchQuery(query);
    const newFilters = { ...filters, searchQuery: query };
    setFilters(newFilters);
    setCurrentPage(1);
  }, [filters]);

  // Apply filters
  const applyFilters = useCallback(async (newFilters: IncomeFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, []);

  // Apply sorting
  const applySorting = useCallback(async (newSort: IncomeSortOptions) => {
    setSort(newSort);
    setCurrentPage(1);
  }, []);

  // Clear filters
  const clearFilters = useCallback(async () => {
    const clearedFilters: IncomeFilters = {};
    setFilters(clearedFilters);
    setSearchQuery('');
    setCurrentPage(1);
  }, []);

  // Add income to list (optimistic update)
  const addIncomeToList = useCallback((income: Income) => {
    setIncomes(prev => {
      // Insert at the beginning for newest first sort
      if (sort.field === 'date' && sort.order === 'desc') {
        return [income, ...prev];
      }
      // For other sorts, just add and let next refresh handle proper ordering
      return [income, ...prev];
    });
    setTotalCount(prev => prev + 1);
  }, [sort]);

  // Update income in list
  const updateIncomeInList = useCallback((updatedIncome: Income) => {
    setIncomes(prev => prev.map(income =>
      income.id === updatedIncome.id ? updatedIncome : income
    ));
  }, []);

  // Remove income from list
  const removeIncomeFromList = useCallback((incomeId: string) => {
    setIncomes(prev => prev.filter(income => income.id !== incomeId));
    setTotalCount(prev => Math.max(0, prev - 1));
  }, []);

  // Initial load and reload when filters/sort change
  useEffect(() => {
    loadIncomes(1, false);
  }, [filters, sort]);

  // Computed values
  const isEmpty = incomes.length === 0 && !isLoading;
  const isFirstLoad = isLoading && currentPage === 1;
  const canLoadMore = hasMore && !isLoadingMore && !isLoading;

  return {
    // Data
    incomes,
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
    loadIncomes: () => loadIncomes(1, false),
    loadMore,
    refresh,
    search,
    applyFilters,
    applySorting,
    clearFilters,

    // List management
    addIncomeToList,
    updateIncomeInList,
    removeIncomeFromList,

    // Pagination info
    hasNextPage: hasMore,
    hasPreviousPage: currentPage > 1,
  };
};