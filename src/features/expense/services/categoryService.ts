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
import { Category, CategoryCreateInput, CategoryUpdateInput, CategoryAnalytics, CategorySummary, DEFAULT_CATEGORIES } from '../models/categoryModel';

export interface CategoryService {
  getCategories(): Promise<Category[]>;
  getCategoryById(id: string): Promise<Category | null>;
  createCategory(category: CategoryCreateInput): Promise<Category>;
  updateCategory(category: CategoryUpdateInput): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  getCategoryAnalytics(dateFrom?: string, dateTo?: string): Promise<CategoryAnalytics[]>;
  getCategorySummary(month?: string, year?: string): Promise<CategorySummary>;
  initializeDefaultCategories(): Promise<Category[]>;
}

class CategoryServiceImpl implements CategoryService {
  private collectionName = 'categories';

  constructor() {
    // No setup needed for Firebase SDK
  }

  private getCurrentUserId(): string {
    if (!auth.currentUser) {
      throw new Error('User must be authenticated to perform this action');
    }
    return auth.currentUser.uid;
  }

  async getCategories(): Promise<Category[]> {
    const userId = this.getCurrentUserId();
    const q = query(
      collection(db, this.collectionName),
      where('userId', '==', userId),
      orderBy('name', 'asc')
    );
    const querySnapshot = await getDocs(q);

    const categories: Category[] = [];
    querySnapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() } as Category);
    });

    return categories;
  }

  async getCategoryById(id: string): Promise<Category | null> {
    const docRef = doc(db, this.collectionName, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Category;
    }
    return null;
  }

  async createCategory(category: CategoryCreateInput): Promise<Category> {
    const userId = this.getCurrentUserId();
    const categoryWithUser = {
      ...category,
      userId,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, this.collectionName), categoryWithUser);
    const newDoc = await getDoc(docRef);
    return { id: docRef.id, ...newDoc.data() } as Category;
  }

  async updateCategory(category: CategoryUpdateInput): Promise<Category> {
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
    return { id: updatedDoc.id, ...updatedDoc.data() } as Category;
  }

  async deleteCategory(id: string): Promise<void> {
    const docRef = doc(db, this.collectionName, id);
    await deleteDoc(docRef);
  }

  async getCategoryAnalytics(dateFrom?: string, dateTo?: string): Promise<CategoryAnalytics[]> {
    // This would need to query expenses collection and aggregate by category
    // For now, returning empty array as this requires complex aggregation
    console.log('Category analytics needs to be implemented with expense aggregation');
    return [];
  }

  async getCategorySummary(month?: string, year?: string): Promise<CategorySummary> {
    // This would need to query expenses collection and aggregate by category
    // For now, returning empty summary as this requires complex aggregation
    console.log('Category summary needs to be implemented with expense aggregation');
    return { totalExpenses: 0, categoryBreakdown: [], month: month || '', year: year || '' };
  }

  async initializeDefaultCategories(): Promise<Category[]> {
    const userId = this.getCurrentUserId();
    const batch = writeBatch(db);
    const createdCategories: Category[] = [];

    for (const category of DEFAULT_CATEGORIES) {
      const docRef = doc(collection(db, this.collectionName));
      const categoryWithUser = {
        ...category,
        userId,
        isDefault: true,
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

export const categoryService = new CategoryServiceImpl();