import {
  collection,
  query,
  where,
  orderBy,
  limit as firestoreLimit,
  startAfter,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  QueryConstraint,
  DocumentSnapshot,
  getCountFromServer
} from 'firebase/firestore';
import { auth, db } from '../../../services/firebaseConfig';
import { Expense, ExpenseCreateInput, ExpenseUpdateInput, ExpenseFilters, ExpensePaginationResult, ExpenseSortOptions } from '../models/expenseModel';

export interface ExpenseService {
  getExpenses(filters?: ExpenseFilters, sort?: ExpenseSortOptions, page?: number, limit?: number): Promise<ExpensePaginationResult>;
  getExpenseById(id: string): Promise<Expense | null>;
  createExpense(expense: ExpenseCreateInput): Promise<Expense>;
  updateExpense(expense: ExpenseUpdateInput): Promise<Expense>;
  deleteExpense(id: string): Promise<void>;
  searchExpenses(query: string, filters?: ExpenseFilters): Promise<Expense[]>;
  syncExpenses(): Promise<void>;
  getOfflineExpenses(): Promise<Expense[]>;
}

class ExpenseServiceImpl implements ExpenseService {
  private collectionName = 'expenses';

  constructor() {
    // No setup needed for Firebase SDK
  }

  private getCurrentUserId(): string {
    if (!auth.currentUser) {
      throw new Error('User must be authenticated to perform this action');
    }
    return auth.currentUser.uid;
  }

  async getExpenses(
    filters?: ExpenseFilters,
    sort?: ExpenseSortOptions,
    page: number = 1,
    limit: number = 10
  ): Promise<ExpensePaginationResult> {
    const userId = this.getCurrentUserId();
    const constraints: QueryConstraint[] = [
      // Always filter by current user
      where('userId', '==', userId)
    ];

    // Add filters
    if (filters) {
      if (filters.categories?.length) {
        constraints.push(where('category', 'in', filters.categories));
      }
      if (filters.dateFrom) {
        constraints.push(where('date', '>=', filters.dateFrom));
      }
      if (filters.dateTo) {
        constraints.push(where('date', '<=', filters.dateTo));
      }
      if (filters.amountMin !== undefined) {
        constraints.push(where('amount', '>=', filters.amountMin));
      }
      if (filters.amountMax !== undefined) {
        constraints.push(where('amount', '<=', filters.amountMax));
      }
    }

    // Add sorting
    if (sort) {
      constraints.push(orderBy(sort.field, sort.order));
    } else {
      constraints.push(orderBy('date', 'desc'));
    }

    // Add pagination
    constraints.push(firestoreLimit(limit));

    const q = query(collection(db, this.collectionName), ...constraints);
    const querySnapshot = await getDocs(q);

    const expenses: Expense[] = [];
    querySnapshot.forEach((doc) => {
      expenses.push({ id: doc.id, ...doc.data() } as Expense);
    });

    // Get total count for pagination info (for current user only)
    const countQuery = query(collection(db, this.collectionName), where('userId', '==', userId));
    const countSnapshot = await getCountFromServer(countQuery);
    const total = countSnapshot.data().count;

    return {
      expenses,
      totalCount: total,
      // page,
      // limit,
      hasMore: expenses.length === limit
    };
  }

  async getExpenseById(id: string): Promise<Expense | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Expense;
    }
    return null;
  }

  async createExpense(expense: ExpenseCreateInput): Promise<Expense> {
    const userId = this.getCurrentUserId();
    const expenseWithUser = {
      ...expense,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, this.collectionName), expenseWithUser);
    const newDoc = await getDoc(docRef);
    return { id: docRef.id, ...newDoc.data() } as Expense;
  }

  async updateExpense(expense: ExpenseUpdateInput): Promise<Expense> {
    const userId = this.getCurrentUserId();
    const { id, ...updateData } = expense;
    const updateDataWithUser = {
      ...updateData,
      userId,
      updatedAt: new Date().toISOString()
    };

    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, updateDataWithUser);
    const updatedDoc = await getDoc(docRef);
    return { id: updatedDoc.id, ...updatedDoc.data() } as Expense;
  }

  async deleteExpense(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async searchExpenses(query: string, filters?: ExpenseFilters): Promise<Expense[]> {
    const searchFilters = { ...filters, searchQuery: query };
    const result = await this.getExpenses(searchFilters, undefined, 1, 100);
    return result.expenses;
  }

  async syncExpenses(): Promise<void> {
    // Firebase handles sync automatically with real-time listeners
    console.log('Firebase handles sync automatically');
  }

  async getOfflineExpenses(): Promise<Expense[]> {
    return [];
  }
}

export const expenseService = new ExpenseServiceImpl();