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
import { Income, IncomeCreateInput, IncomeUpdateInput, IncomeFilters, IncomePaginationResult, IncomeSortOptions } from '../models/incomeModel';

export interface IncomeService {
  getIncomes(filters?: IncomeFilters, sort?: IncomeSortOptions, page?: number, limit?: number): Promise<IncomePaginationResult>;
  getIncomeById(id: string): Promise<Income | null>;
  createIncome(income: IncomeCreateInput): Promise<Income>;
  updateIncome(income: IncomeUpdateInput): Promise<Income>;
  deleteIncome(id: string): Promise<void>;
  searchIncomes(query: string, filters?: IncomeFilters): Promise<Income[]>;
  syncIncomes(): Promise<void>;
  getOfflineIncomes(): Promise<Income[]>;
}

class IncomeServiceImpl implements IncomeService {
  private collectionName = 'incomes';

  constructor() {
    // No setup needed for Firebase SDK
  }

  private getCurrentUserId(): string {
    if (!auth.currentUser) {
      throw new Error('User must be authenticated to perform this action');
    }
    return auth.currentUser.uid;
  }

  async getIncomes(
    filters?: IncomeFilters,
    sort?: IncomeSortOptions,
    page: number = 1,
    limit: number = 10
  ): Promise<IncomePaginationResult> {
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

    const incomes: Income[] = [];
    querySnapshot.forEach((doc) => {
      incomes.push({ id: doc.id, ...doc.data() } as Income);
    });

    // Get total count for pagination info (for current user only)
    const countQuery = query(collection(db, this.collectionName), where('userId', '==', userId));
    const countSnapshot = await getCountFromServer(countQuery);
    const total = countSnapshot.data().count;

    return {
      incomes,
      totalCount: total,
      hasMore: incomes.length === limit
    };
  }

  async getIncomeById(id: string): Promise<Income | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Income;
    }
    return null;
  }

  async createIncome(income: IncomeCreateInput): Promise<Income> {
    const userId = this.getCurrentUserId();
    const incomeWithUser = {
      ...income,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, this.collectionName), incomeWithUser);
    const newDoc = await getDoc(docRef);
    return { id: docRef.id, ...newDoc.data() } as Income;
  }

  async updateIncome(income: IncomeUpdateInput): Promise<Income> {
    const userId = this.getCurrentUserId();
    const { id, ...updateData } = income;
    const updateDataWithUser = {
      ...updateData,
      userId,
      updatedAt: new Date().toISOString()
    };

    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, updateDataWithUser);
    const updatedDoc = await getDoc(docRef);
    return { id: updatedDoc.id, ...updatedDoc.data() } as Income;
  }

  async deleteIncome(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async searchIncomes(query: string, filters?: IncomeFilters): Promise<Income[]> {
    const searchFilters = { ...filters, searchQuery: query };
    const result = await this.getIncomes(searchFilters, undefined, 1, 100);
    return result.incomes;
  }

  async syncIncomes(): Promise<void> {
    // Firebase handles sync automatically with real-time listeners
    console.log('Firebase handles sync automatically');
  }

  async getOfflineIncomes(): Promise<Income[]> {
    return [];
  }
}

export const incomeService = new IncomeServiceImpl();