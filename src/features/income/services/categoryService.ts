import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { auth, db } from '../../../services/firebaseConfig';
import { IncomeCategory, IncomeCategoryCreateInput, IncomeCategoryUpdateInput, IncomeCategoryAnalytics, DEFAULT_INCOME_CATEGORIES } from '../models/categoryModel';

export interface IncomeCategoryService {
  getIncomeCategories(): Promise<IncomeCategory[]>;
  getIncomeCategoryById(id: string): Promise<IncomeCategory | null>;
  createIncomeCategory(category: IncomeCategoryCreateInput): Promise<IncomeCategory>;
  updateIncomeCategory(category: IncomeCategoryUpdateInput): Promise<IncomeCategory>;
  deleteIncomeCategory(id: string): Promise<void>;
  getIncomeCategoryAnalytics(dateFrom?: string, dateTo?: string): Promise<IncomeCategoryAnalytics[]>;
  initializeDefaultIncomeCategories(): Promise<IncomeCategory[]>;
}

class IncomeCategoryServiceImpl implements IncomeCategoryService {
  private collectionName = 'incomeCategories';

  constructor() {
    // No setup needed for Firebase SDK
  }

  private getCurrentUserId(): string {
    if (!auth.currentUser) {
      throw new Error('User must be authenticated to perform this action');
    }
    return auth.currentUser.uid;
  }

  async getIncomeCategories(): Promise<IncomeCategory[]> {
    const userId = this.getCurrentUserId();
    const q = query(
      collection(db, this.collectionName),
      where('userId', '==', userId),
      orderBy('name', 'asc')
    );
    const querySnapshot = await getDocs(q);

    const categories: IncomeCategory[] = [];
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() } as IncomeCategory);
    });

    return categories;
  }

  async getIncomeCategoryById(id: string): Promise<IncomeCategory | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as IncomeCategory;
    }
    return null;
  }

  async createIncomeCategory(category: IncomeCategoryCreateInput): Promise<IncomeCategory> {
    const userId = this.getCurrentUserId();
    const categoryWithUser = {
      ...category,
      userId,
      isDefault: false,
      incomeCount: 0,
      totalAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, this.collectionName), categoryWithUser);
    const newDoc = await getDoc(docRef);
    return { id: docRef.id, ...newDoc.data() } as IncomeCategory;
  }

  async updateIncomeCategory(category: IncomeCategoryUpdateInput): Promise<IncomeCategory> {
    const userId = this.getCurrentUserId();
    const { id, ...updateData } = category;
    const updateDataWithUser = {
      ...updateData,
      userId,
      updatedAt: new Date().toISOString()
    };

    const docRef = doc(db, this.collectionName, id);
    await updateDoc(docRef, updateDataWithUser);
    const updatedDoc = await getDoc(docRef);
    return { id: updatedDoc.id, ...updatedDoc.data() } as IncomeCategory;
  }

  async deleteIncomeCategory(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async getIncomeCategoryAnalytics(dateFrom?: string, dateTo?: string): Promise<IncomeCategoryAnalytics[]> {
    // This would need to query incomes collection and aggregate by category
    // For now, returning empty array as this requires complex aggregation
    console.log('Income category analytics needs to be implemented with income aggregation');
    return [];
  }

  async initializeDefaultIncomeCategories(): Promise<IncomeCategory[]> {
    const userId = this.getCurrentUserId();
    const batch = writeBatch(db);
    const createdCategories: IncomeCategory[] = [];

    for (const category of DEFAULT_INCOME_CATEGORIES) {
      const docRef = doc(collection(db, this.collectionName));
      const categoryWithUser = {
        ...category,
        userId,
        isDefault: true,
        incomeCount: 0,
        totalAmount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      batch.set(docRef, categoryWithUser);
      createdCategories.push({ id: docRef.id, ...categoryWithUser });
    }

    await batch.commit();
    return createdCategories;
  }
}

export const incomeCategoryService = new IncomeCategoryServiceImpl();