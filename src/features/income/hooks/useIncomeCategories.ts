import { useState, useEffect, useCallback } from 'react';
import { IncomeCategory, IncomeCategoryCreateInput, IncomeCategoryUpdateInput } from '../models/categoryModel';
import { incomeCategoryService } from '../services/categoryService';

interface UseIncomeCategoriesProps {
  loadOnMount?: boolean;
}

export const useIncomeCategories = ({ loadOnMount = true }: UseIncomeCategoriesProps = {}) => {
  const [categories, setCategories] = useState<IncomeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load categories
  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedCategories = await incomeCategoryService.getIncomeCategories();
      setCategories(fetchedCategories);

    } catch (err: any) {
      console.error('Error loading income categories:', err);
      setError(err.message || 'Failed to load income categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Validate category name
  const validateCategoryName = useCallback((name: string, excludeId?: string): { isValid: boolean; error?: string } => {
    if (!name || name.trim().length === 0) {
      return { isValid: false, error: 'Category name is required' };
    }

    if (name.length > 15) {
      return { isValid: false, error: 'Category name cannot exceed 15 characters' };
    }

    if (!/^[a-zA-Z0-9\s]+$/.test(name)) {
      return { isValid: false, error: 'Category name must contain only alphanumeric characters and spaces' };
    }

    if (name.trim() !== name) {
      return { isValid: false, error: 'Category name cannot start or end with spaces' };
    }

    // Check for duplicates (case-sensitive)
    const isDuplicate = categories.some(cat =>
      cat.name === name && (excludeId ? cat.id !== excludeId : true)
    );

    if (isDuplicate) {
      return { isValid: false, error: 'Category name already exists' };
    }

    return { isValid: true };
  }, [categories]);

  // Create category
  const createCategory = useCallback(async (categoryData: IncomeCategoryCreateInput): Promise<IncomeCategory | null> => {
    // Validate category name
    const validation = validateCategoryName(categoryData.name);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid category name');
      return null;
    }

    setIsCreating(true);
    setError(null);

    try {
      const newCategory = await incomeCategoryService.createIncomeCategory(categoryData);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;

    } catch (err: any) {
      console.error('Error creating income category:', err);
      setError(err.message || 'Failed to create income category');
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [validateCategoryName]);

  // Update category
  const updateCategory = useCallback(async (categoryData: IncomeCategoryUpdateInput): Promise<IncomeCategory | null> => {
    // Validate category name if it's being updated
    if (categoryData.name) {
      const validation = validateCategoryName(categoryData.name, categoryData.id);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid category name');
        return null;
      }
    }

    setIsUpdating(true);
    setError(null);

    try {
      const updatedCategory = await incomeCategoryService.updateIncomeCategory(categoryData);
      setCategories(prev => prev.map(cat =>
        cat.id === categoryData.id ? updatedCategory : cat
      ));
      return updatedCategory;

    } catch (err: any) {
      console.error('Error updating income category:', err);
      setError(err.message || 'Failed to update income category');
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [validateCategoryName]);

  // Delete category
  const deleteCategory = useCallback(async (categoryId: string): Promise<boolean> => {
    const categoryToDelete = categories.find(cat => cat.id === categoryId);
    if (!categoryToDelete) {
      setError('Category not found');
      return false;
    }

    if (categoryToDelete.isDefault) {
      setError('Cannot delete default categories');
      return false;
    }

    setIsDeleting(categoryId);
    setError(null);

    try {
      await incomeCategoryService.deleteIncomeCategory(categoryId);
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      return true;

    } catch (err: any) {
      console.error('Error deleting income category:', err);
      setError(err.message || 'Failed to delete income category');
      return false;
    } finally {
      setIsDeleting(null);
    }
  }, [categories]);

  // Initialize default categories
  const initializeDefaultCategories = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const initializedCategories = await incomeCategoryService.initializeDefaultIncomeCategories();
      setCategories(initializedCategories);
      return true;

    } catch (err: any) {
      console.error('Error initializing default income categories:', err);
      setError(err.message || 'Failed to initialize default income categories');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get category by ID
  const getCategoryById = useCallback((categoryId: string): IncomeCategory | undefined => {
    return categories.find(cat => cat.id === categoryId);
  }, [categories]);

  // Get category by name
  const getCategoryByName = useCallback((categoryName: string): IncomeCategory | undefined => {
    return categories.find(cat => cat.name === categoryName);
  }, [categories]);

  // Get frequently used categories (based on income count)
  const getFrequentlyUsedCategories = useCallback((limit: number = 5): IncomeCategory[] => {
    return [...categories]
      .sort((a, b) => {
        // Sort by income count descending, then by total amount descending
        if (a.incomeCount !== b.incomeCount) {
          return b.incomeCount - a.incomeCount;
        }
        return b.totalAmount - a.totalAmount;
      })
      .slice(0, limit);
  }, [categories]);

  // Check if category name exists
  const categoryNameExists = useCallback((name: string, excludeId?: string): boolean => {
    return categories.some(cat =>
      cat.name === name && (excludeId ? cat.id !== excludeId : true)
    );
  }, [categories]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Refresh categories
  const refresh = useCallback(async () => {
    await loadCategories();
  }, [loadCategories]);

  // Load categories on mount
  useEffect(() => {
    if (loadOnMount) {
      loadCategories();
    }
  }, [loadOnMount, loadCategories]);

  // Computed values
  const defaultCategories = categories.filter(cat => cat.isDefault);
  const customCategories = categories.filter(cat => !cat.isDefault);
  const isEmpty = categories.length === 0 && !isLoading;
  const hasOnlyDefaults = categories.length > 0 && customCategories.length === 0;

  return {
    // Data
    categories,
    defaultCategories,
    customCategories,

    // State
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    isEmpty,
    hasOnlyDefaults,

    // Actions
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    initializeDefaultCategories,
    refresh,
    clearError,

    // Helpers
    getCategoryById,
    getCategoryByName,
    getFrequentlyUsedCategories,
    categoryNameExists,
    validateCategoryName,

    // Computed values
    totalCount: categories.length,
    defaultCount: defaultCategories.length,
    customCount: customCategories.length,
  };
};