import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { Expense, ExpenseFilters } from '../models/expenseModel';
import { Category } from '../models/categoryModel';

export interface ExpenseStorageService {
  // Firestore operations
  saveExpenseToFirestore(expense: Expense): Promise<void>;
  updateExpenseInFirestore(expense: Expense): Promise<void>;
  deleteExpenseFromFirestore(expenseId: string): Promise<void>;
  syncWithFirestore(): Promise<void>;

  // Local caching
  cacheExpenses(expenses: Expense[]): Promise<void>;
  getCachedExpenses(): Promise<Expense[]>;
  cacheCategories(categories: Category[]): Promise<void>;
  getCachedCategories(): Promise<Category[]>;

  // Offline support
  addPendingSyncExpense(expense: Expense): Promise<void>;
  getPendingSyncExpenses(): Promise<Expense[]>;
  removePendingSyncExpense(expenseId: string): Promise<void>;

  // Utility
  getCachedFilters(): Promise<ExpenseFilters | null>;
  saveCachedFilters(filters: ExpenseFilters): Promise<void>;
  getLastSyncTimestamp(): Promise<string | null>;
  updateLastSyncTimestamp(): Promise<void>;
  clearCache(): Promise<void>;
}

class ExpenseStorageServiceImpl implements ExpenseStorageService {
  private readonly expensesCollection = 'expenses';
  private readonly CACHED_EXPENSES_KEY = 'cached_expenses';
  private readonly CACHED_CATEGORIES_KEY = 'cached_categories';
  private readonly PENDING_SYNC_EXPENSES_KEY = 'pending_sync_expenses';
  private readonly CACHED_FILTERS_KEY = 'cached_filters';
  private readonly LAST_SYNC_KEY = 'last_sync_timestamp';

  constructor() {
    // No setup needed for Firebase SDK
  }


  // Firestore operations
  async saveExpenseToFirestore(expense: Expense): Promise<void> {
    try {
      const { id, ...expenseData } = expense;
      const docRef = doc(db, this.expensesCollection, id);
      await setDoc(docRef, expenseData);

      // Cache locally after successful save
      await this.cacheExpenseLocally(expense);
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      // Save to pending sync if Firestore fails
      await this.addPendingSyncExpense(expense);
      throw error;
    }
  }

  async updateExpenseInFirestore(expense: Expense): Promise<void> {
    try {
      const { id, ...expenseData } = expense;
      const docRef = doc(db, this.expensesCollection, id);
      await updateDoc(docRef, expenseData);

      // Update local cache
      await this.updateCachedExpense(expense);
    } catch (error) {
      console.error('Error updating in Firestore:', error);
      await this.addPendingSyncExpense(expense);
      throw error;
    }
  }

  async deleteExpenseFromFirestore(expenseId: string): Promise<void> {
    try {
      const docRef = doc(db, this.expensesCollection, expenseId);
      await deleteDoc(docRef);

      // Remove from local cache
      await this.removeCachedExpense(expenseId);
    } catch (error) {
      console.error('Error deleting from Firestore:', error);
      throw error;
    }
  }

  async syncWithFirestore(): Promise<void> {
    try {
      const pendingExpenses = await this.getPendingSyncExpenses();

      for (const expense of pendingExpenses) {
        try {
          await this.saveExpenseToFirestore(expense);
          await this.removePendingSyncExpense(expense.id);
        } catch (error) {
          console.error(`Failed to sync expense ${expense.id}:`, error);
        }
      }

      await this.updateLastSyncTimestamp();
    } catch (error) {
      console.error('Error during sync:', error);
      throw error;
    }
  }

  // Local caching methods
  private async cacheExpenseLocally(expense: Expense): Promise<void> {
    const cached = await this.getCachedExpenses();
    const existingIndex = cached.findIndex(e => e.id === expense.id);

    if (existingIndex >= 0) {
      cached[existingIndex] = expense;
    } else {
      cached.push(expense);
    }

    await this.cacheExpenses(cached);
  }

  private async updateCachedExpense(expense: Expense): Promise<void> {
    await this.cacheExpenseLocally(expense);
  }

  private async removeCachedExpense(expenseId: string): Promise<void> {
    const cached = await this.getCachedExpenses();
    const filtered = cached.filter(e => e.id !== expenseId);
    await this.cacheExpenses(filtered);
  }

  async cacheExpenses(expenses: Expense[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.CACHED_EXPENSES_KEY, JSON.stringify({
        data: expenses,
        timestamp: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error caching expenses:', error);
      throw new Error('Failed to cache expenses');
    }
  }

  async getCachedExpenses(): Promise<Expense[]> {
    try {
      const stored = await AsyncStorage.getItem(this.CACHED_EXPENSES_KEY);
      if (!stored) return [];

      const cached = JSON.parse(stored);
      return cached.data || [];
    } catch (error) {
      console.error('Error getting cached expenses:', error);
      return [];
    }
  }

  async cacheCategories(categories: Category[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.CACHED_CATEGORIES_KEY, JSON.stringify({
        data: categories,
        timestamp: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error caching categories:', error);
      throw new Error('Failed to cache categories');
    }
  }

  async getCachedCategories(): Promise<Category[]> {
    try {
      const stored = await AsyncStorage.getItem(this.CACHED_CATEGORIES_KEY);
      if (!stored) return [];

      const cached = JSON.parse(stored);
      return cached.data || [];
    } catch (error) {
      console.error('Error getting cached categories:', error);
      return [];
    }
  }

  async addPendingSyncExpense(expense: Expense): Promise<void> {
    try {
      const pending = await this.getPendingSyncExpenses();
      const existingIndex = pending.findIndex(e => e.id === expense.id);

      if (existingIndex >= 0) {
        pending[existingIndex] = expense;
      } else {
        pending.push(expense);
      }

      await AsyncStorage.setItem(this.PENDING_SYNC_EXPENSES_KEY, JSON.stringify(pending));
    } catch (error) {
      console.error('Error adding pending sync expense:', error);
      throw new Error('Failed to add pending sync expense');
    }
  }

  async getPendingSyncExpenses(): Promise<Expense[]> {
    try {
      const stored = await AsyncStorage.getItem(this.PENDING_SYNC_EXPENSES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting pending sync expenses:', error);
      return [];
    }
  }

  async removePendingSyncExpense(expenseId: string): Promise<void> {
    try {
      const pending = await this.getPendingSyncExpenses();
      const filtered = pending.filter(expense => expense.id !== expenseId);
      await AsyncStorage.setItem(this.PENDING_SYNC_EXPENSES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing pending sync expense:', error);
      throw new Error('Failed to remove pending sync expense');
    }
  }

  async getCachedFilters(): Promise<ExpenseFilters | null> {
    try {
      const stored = await AsyncStorage.getItem(this.CACHED_FILTERS_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting cached filters:', error);
      return null;
    }
  }

  async saveCachedFilters(filters: ExpenseFilters): Promise<void> {
    try {
      await AsyncStorage.setItem(this.CACHED_FILTERS_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving cached filters:', error);
      throw new Error('Failed to save cached filters');
    }
  }

  async getLastSyncTimestamp(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.LAST_SYNC_KEY);
    } catch (error) {
      console.error('Error getting last sync timestamp:', error);
      return null;
    }
  }

  async updateLastSyncTimestamp(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.LAST_SYNC_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Error updating last sync timestamp:', error);
      throw new Error('Failed to update last sync timestamp');
    }
  }

  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.CACHED_EXPENSES_KEY,
        this.CACHED_CATEGORIES_KEY,
        this.PENDING_SYNC_EXPENSES_KEY,
        this.CACHED_FILTERS_KEY,
        this.LAST_SYNC_KEY,
      ]);
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw new Error('Failed to clear cache');
    }
  }
}

export const expenseStorageService = new ExpenseStorageServiceImpl();