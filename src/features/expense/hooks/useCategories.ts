import { useState, useEffect, useCallback } from 'react';
import { Category, CategoryCreateInput, CategoryUpdateInput, DEFAULT_CATEGORIES } from '../models/categoryModel';
import { validateCategoryName } from '../models/expenseValidation';
import { categoryService } from '../services/categoryService';
import { expenseStorageService } from '../services/expenseStorageService';

interface UseCategoriesProps {
  loadOnMount?: boolean;
}

export const useCategories = ({ loadOnMount = true }: UseCategoriesProps = {}) => {
  const [categories, setCategories] = useState<Category[]>([]);
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
      const fetchedCategories = await categoryService.getCategories();
      setCategories(fetchedCategories);

      // Cache categories locally
      await expenseStorageService.cacheCategories(fetchedCategories);

    } catch (err: any) {
      console.error('Error loading categories:', err);
      setError(err.message || 'Failed to load categories');

      // Try to load from cache
      try {
        const cachedCategories = await expenseStorageService.getCachedCategories();
        if (cachedCategories.length > 0) {
          setCategories(cachedCategories);
          setError('Showing cached data - unable to sync with server');
        }
      } catch (cacheError) {
        console.error('Error loading cached categories:', cacheError);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create category
  const createCategory = useCallback(async (categoryData: CategoryCreateInput): Promise<Category | null> => {
    // Validate category name
    const existingNames = categories.map(cat => cat.name);
    const validation = validateCategoryName(categoryData.name, existingNames);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid category name');
      return null;
    }

    setIsCreating(true);
    setError(null);

    try {
      const newCategory = await categoryService.createCategory(categoryData);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;

    } catch (err: any) {
      console.error('Error creating category:', err);
      setError(err.message || 'Failed to create category');
      return null;
    } finally {
      setIsCreating(false);
    }
  }, [categories]);

  // Update category
  const updateCategory = useCallback(async (categoryData: CategoryUpdateInput): Promise<Category | null> => {
    // Validate category name if it's being updated
    if (categoryData.name) {
      const existingNames = categories
        .filter(cat => cat.id !== categoryData.id)
        .map(cat => cat.name);
      const validation = validateCategoryName(categoryData.name, existingNames);
      if (!validation.isValid) {
        setError(validation.error || 'Invalid category name');
        return null;
      }
    }

    setIsUpdating(true);
    setError(null);

    try {
      const updatedCategory = await categoryService.updateCategory(categoryData);
      setCategories(prev => prev.map(cat =>
        cat.id === categoryData.id ? updatedCategory : cat
      ));
      return updatedCategory;

    } catch (err: any) {
      console.error('Error updating category:', err);
      setError(err.message || 'Failed to update category');
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, [categories]);

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
      await categoryService.deleteCategory(categoryId);
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      return true;

    } catch (err: any) {
      console.error('Error deleting category:', err);
      setError(err.message || 'Failed to delete category');
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
      const initializedCategories = await categoryService.initializeDefaultCategories();
      setCategories(initializedCategories);
      return true;

    } catch (err: any) {
      console.error('Error initializing default categories:', err);
      setError(err.message || 'Failed to initialize default categories');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get category by ID
  const getCategoryById = useCallback((categoryId: string): Category | undefined => {
    return categories.find(cat => cat.id === categoryId);
  }, [categories]);

  // Get category by name
  const getCategoryByName = useCallback((categoryName: string): Category | undefined => {
    return categories.find(cat => cat.name === categoryName);
  }, [categories]);

  // Get frequently used categories (could be based on usage analytics)
  const getFrequentlyUsedCategories = useCallback((limit: number = 5): Category[] => {
    // For now, return default categories first, then custom ones
    const defaultCats = categories.filter(cat => cat.isDefault);
    const customCats = categories.filter(cat => !cat.isDefault);
    return [...defaultCats, ...customCats].slice(0, limit);
  }, [categories]);

  // Check if category name exists
  const categoryNameExists = useCallback((name: string, excludeId?: string): boolean => {
    return categories.some(cat =>
      cat.name === name && (excludeId ? cat.id !== excludeId : true)
    );
  }, [categories]);

  // Validate category name
  const validateNewCategoryName = useCallback((name: string, excludeId?: string): { isValid: boolean; error?: string } => {
    const existingNames = categories
      .filter(cat => excludeId ? cat.id !== excludeId : true)
      .map(cat => cat.name);
    return validateCategoryName(name, existingNames);
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
    validateNewCategoryName,

    // Computed values
    totalCount: categories.length,
    defaultCount: defaultCategories.length,
    customCount: customCategories.length,
  };
};