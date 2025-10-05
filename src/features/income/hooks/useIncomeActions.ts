import { useState, useCallback } from 'react';
import { Income } from '../models/incomeModel';
import { incomeService } from '../services/incomeService';

interface UseIncomeActionsProps {
  onIncomeDeleted?: (incomeId: string) => void;
  onIncomeUpdated?: (income: Income) => void;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

export const useIncomeActions = ({
  onIncomeDeleted,
  onIncomeUpdated,
  onError,
  onSuccess
}: UseIncomeActionsProps = {}) => {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete income with confirmation
  const deleteIncome = useCallback(async (
    incomeId: string,
    skipConfirmation: boolean = false
  ): Promise<boolean> => {
    if (!skipConfirmation) {
      // In a real app, you'd show a confirmation dialog here
      // For now, we'll assume confirmation is handled by the UI component
    }

    setIsDeleting(incomeId);
    setError(null);

    try {
      await incomeService.deleteIncome(incomeId);
      onIncomeDeleted?.(incomeId);
      onSuccess?.('Income deleted successfully');
      return true;

    } catch (err: any) {
      console.error('Error deleting income:', err);
      const errorMessage = err.message || 'Failed to delete income';
      setError(errorMessage);
      onError?.(errorMessage);
      return false;
    } finally {
      setIsDeleting(null);
    }
  }, [onIncomeDeleted, onError, onSuccess]);

  // Duplicate income (keep same label since recurring income often has identical names)
  const duplicateIncome = useCallback(async (income: Income): Promise<Income | null> => {
    setError(null);

    try {
      const duplicatedIncome = {
        amount: income.amount,
        label: income.label, // Keep same label for recurring income
        description: income.description,
        category: income.category,
        date: new Date().toISOString().split('T')[0], // Set to today
        supportingDocuments: [], // Don't duplicate supporting documents
      };

      const newIncome = await incomeService.createIncome(duplicatedIncome);
      onSuccess?.('Income duplicated successfully');
      return newIncome;

    } catch (err: any) {
      console.error('Error duplicating income:', err);
      const errorMessage = err.message || 'Failed to duplicate income';
      setError(errorMessage);
      onError?.(errorMessage);
      return null;
    }
  }, [onError, onSuccess]);

  // Sync offline incomes
  const syncOfflineIncomes = useCallback(async (): Promise<boolean> => {
    setIsSyncing(true);
    setError(null);

    try {
      await incomeService.syncIncomes();
      onSuccess?.('Offline incomes synced successfully');
      return true;

    } catch (err: any) {
      console.error('Error syncing offline incomes:', err);
      const errorMessage = err.message || 'Failed to sync offline incomes';
      setError(errorMessage);
      onError?.(errorMessage);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [onError, onSuccess]);

  // Bulk delete incomes
  const bulkDeleteIncomes = useCallback(async (
    incomeIds: string[],
    skipConfirmation: boolean = false
  ): Promise<{ success: string[]; failed: string[] }> => {
    if (!skipConfirmation) {
      // In a real app, you'd show a confirmation dialog here
    }

    setIsPerformingBulkAction(true);
    setError(null);

    const success: string[] = [];
    const failed: string[] = [];

    try {
      // Delete incomes one by one to handle partial failures
      for (const incomeId of incomeIds) {
        try {
          await incomeService.deleteIncome(incomeId);
          success.push(incomeId);
          onIncomeDeleted?.(incomeId);
        } catch (error) {
          console.error(`Failed to delete income ${incomeId}:`, error);
          failed.push(incomeId);
        }
      }

      if (success.length > 0) {
        onSuccess?.(`Successfully deleted ${success.length} income(s)`);
      }

      if (failed.length > 0) {
        const errorMessage = `Failed to delete ${failed.length} income(s)`;
        setError(errorMessage);
        onError?.(errorMessage);
      }

    } catch (err: any) {
      console.error('Error in bulk delete:', err);
      const errorMessage = err.message || 'Failed to delete incomes';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsPerformingBulkAction(false);
    }

    return { success, failed };
  }, [onIncomeDeleted, onError, onSuccess]);

  // Bulk update category for incomes
  const bulkUpdateCategory = useCallback(async (
    incomeIds: string[],
    newCategory: string
  ): Promise<{ success: string[]; failed: string[] }> => {
    setIsPerformingBulkAction(true);
    setError(null);

    const success: string[] = [];
    const failed: string[] = [];

    try {
      for (const incomeId of incomeIds) {
        try {
          const updatedIncome = await incomeService.updateIncome({
            id: incomeId,
            category: newCategory,
          });
          success.push(incomeId);
          onIncomeUpdated?.(updatedIncome);
        } catch (error) {
          console.error(`Failed to update income ${incomeId}:`, error);
          failed.push(incomeId);
        }
      }

      if (success.length > 0) {
        onSuccess?.(`Successfully updated ${success.length} income(s)`);
      }

      if (failed.length > 0) {
        const errorMessage = `Failed to update ${failed.length} income(s)`;
        setError(errorMessage);
        onError?.(errorMessage);
      }

    } catch (err: any) {
      console.error('Error in bulk category update:', err);
      const errorMessage = err.message || 'Failed to update incomes';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsPerformingBulkAction(false);
    }

    return { success, failed };
  }, [onIncomeUpdated, onError, onSuccess]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Check if any action is in progress
  const isActionInProgress = isDeleting !== null || isSyncing || isPerformingBulkAction;

  return {
    // State
    isDeleting,
    isSyncing,
    isPerformingBulkAction,
    isActionInProgress,
    error,

    // Actions
    deleteIncome,
    duplicateIncome,
    syncOfflineIncomes,
    bulkDeleteIncomes,
    bulkUpdateCategory,
    clearError,

    // Helper functions for UI
    isDeletingIncome: (incomeId: string) => isDeleting === incomeId,
    canPerformActions: !isActionInProgress,
  };
};