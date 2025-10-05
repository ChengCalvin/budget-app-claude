import { useState, useCallback } from 'react';
import { Expense } from '../models/expenseModel';
import { expenseService } from '../services/expenseService';
import { expenseStorageService } from '../services/expenseStorageService';

interface UseExpenseActionsProps {
  onExpenseDeleted?: (expenseId: string) => void;
  onExpenseUpdated?: (expense: Expense) => void;
  onError?: (error: string) => void;
  onSuccess?: (message: string) => void;
}

export const useExpenseActions = ({
  onExpenseDeleted,
  onExpenseUpdated,
  onError,
  onSuccess
}: UseExpenseActionsProps = {}) => {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPerformingBulkAction, setIsPerformingBulkAction] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete expense with confirmation
  const deleteExpense = useCallback(async (
    expenseId: string,
    skipConfirmation: boolean = false
  ): Promise<boolean> => {
    if (!skipConfirmation) {
      // In a real app, you'd show a confirmation dialog here
      // For now, we'll assume confirmation is handled by the UI component
    }

    setIsDeleting(expenseId);
    setError(null);

    try {
      await expenseService.deleteExpense(expenseId);
      onExpenseDeleted?.(expenseId);
      onSuccess?.('Expense deleted successfully');
      return true;

    } catch (err: any) {
      console.error('Error deleting expense:', err);
      const errorMessage = err.message || 'Failed to delete expense';
      setError(errorMessage);
      onError?.(errorMessage);
      return false;
    } finally {
      setIsDeleting(null);
    }
  }, [onExpenseDeleted, onError, onSuccess]);

  // Duplicate expense
  const duplicateExpense = useCallback(async (expense: Expense): Promise<Expense | null> => {
    setError(null);

    try {
      const duplicatedExpense = {
        amount: expense.amount,
        label: `${expense.label} (Copy)`,
        description: expense.description,
        category: expense.category,
        date: new Date().toISOString().split('T')[0], // Set to today
        receipts: [], // Don't duplicate receipts
      };

      const newExpense = await expenseService.createExpense(duplicatedExpense);
      onSuccess?.('Expense duplicated successfully');
      return newExpense;

    } catch (err: any) {
      console.error('Error duplicating expense:', err);
      const errorMessage = err.message || 'Failed to duplicate expense';
      setError(errorMessage);
      onError?.(errorMessage);
      return null;
    }
  }, [onError, onSuccess]);

  // Sync offline expenses
  const syncOfflineExpenses = useCallback(async (): Promise<boolean> => {
    setIsSyncing(true);
    setError(null);

    try {
      await expenseStorageService.syncWithFirestore();
      onSuccess?.('Offline expenses synced successfully');
      return true;

    } catch (err: any) {
      console.error('Error syncing offline expenses:', err);
      const errorMessage = err.message || 'Failed to sync offline expenses';
      setError(errorMessage);
      onError?.(errorMessage);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [onError, onSuccess]);

  // Get pending sync count
  const getPendingSyncCount = useCallback(async (): Promise<number> => {
    try {
      const pendingExpenses = await expenseStorageService.getPendingSyncExpenses();
      return pendingExpenses.length;
    } catch (error) {
      console.error('Error getting pending sync count:', error);
      return 0;
    }
  }, []);

  // Bulk delete expenses
  const bulkDeleteExpenses = useCallback(async (
    expenseIds: string[],
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
      // Delete expenses one by one to handle partial failures
      for (const expenseId of expenseIds) {
        try {
          await expenseService.deleteExpense(expenseId);
          success.push(expenseId);
          onExpenseDeleted?.(expenseId);
        } catch (error) {
          console.error(`Failed to delete expense ${expenseId}:`, error);
          failed.push(expenseId);
        }
      }

      if (success.length > 0) {
        onSuccess?.(`Successfully deleted ${success.length} expense(s)`);
      }

      if (failed.length > 0) {
        const errorMessage = `Failed to delete ${failed.length} expense(s)`;
        setError(errorMessage);
        onError?.(errorMessage);
      }

    } catch (err: any) {
      console.error('Error in bulk delete:', err);
      const errorMessage = err.message || 'Failed to delete expenses';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsPerformingBulkAction(false);
    }

    return { success, failed };
  }, [onExpenseDeleted, onError, onSuccess]);

  // Bulk update category for expenses
  const bulkUpdateCategory = useCallback(async (
    expenseIds: string[],
    newCategory: string
  ): Promise<{ success: string[]; failed: string[] }> => {
    setIsPerformingBulkAction(true);
    setError(null);

    const success: string[] = [];
    const failed: string[] = [];

    try {
      for (const expenseId of expenseIds) {
        try {
          const updatedExpense = await expenseService.updateExpense({
            id: expenseId,
            category: newCategory,
          });
          success.push(expenseId);
          onExpenseUpdated?.(updatedExpense);
        } catch (error) {
          console.error(`Failed to update expense ${expenseId}:`, error);
          failed.push(expenseId);
        }
      }

      if (success.length > 0) {
        onSuccess?.(`Successfully updated ${success.length} expense(s)`);
      }

      if (failed.length > 0) {
        const errorMessage = `Failed to update ${failed.length} expense(s)`;
        setError(errorMessage);
        onError?.(errorMessage);
      }

    } catch (err: any) {
      console.error('Error in bulk category update:', err);
      const errorMessage = err.message || 'Failed to update expenses';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsPerformingBulkAction(false);
    }

    return { success, failed };
  }, [onExpenseUpdated, onError, onSuccess]);

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
    deleteExpense,
    duplicateExpense,
    syncOfflineExpenses,
    bulkDeleteExpenses,
    bulkUpdateCategory,
    getPendingSyncCount,
    clearError,

    // Helper functions for UI
    isDeletingExpense: (expenseId: string) => isDeleting === expenseId,
    canPerformActions: !isActionInProgress,
  };
};